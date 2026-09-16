// Shared agent tool registry.
//
// Single source of truth for the tools the in-app conversational chat at
// /api/chat exposes. (The external MCP server that used to share this registry
// was removed with the Supabase OAuth Authorization Server it depended on; a
// PocketBase-native replacement is still to be designed.)
//
// Each tool is defined once, parameterised by a user-scoped PocketBase client
// and the user id, and every query carries an explicit ownership filter.
// Handlers return a plain string; each surface adapts that to its own response
// shape. `destructive: true` marks tools the chat must confirm before running.

import { z } from "zod";
import type PocketBase from "pocketbase";
import {
  unbilledSessions,
  sessionToInvoiceItem,
  computeInvoiceTotals,
  nextInvoiceNumber,
} from "@/domain/invoicing";
import { computeMetrics, rangeFor } from "@/domain/dashboard-metrics";
import type { Period, MetricsInput } from "@/domain/dashboard-metrics";
import { filterValue } from "@/lib/pocketbase";
import {
  toClientRow,
  toProjectRow,
  toSessionRow,
  toInvoiceRow,
  toActivityRow,
  toUserSettingsRow,
} from "@/lib/pocketbase-mappers";
import type { Invoice, Project } from "@/types/database";

// Record ids are PocketBase's 15-character strings, not UUIDs — schemas accept
// any non-empty id so the model isn't rejected before the call is made.
const recordId = z.string().min(1);

export interface ToolContext {
  /** User-scoped PocketBase client. */
  pb: PocketBase;
  userId: string;
}

export interface AgentTool {
  name: string;
  description: string;
  /** Zod raw shape — JSON-Schema-ified for the chat. */
  schema: z.ZodRawShape;
  /** Requires explicit user confirmation in the chat before running. */
  destructive?: boolean;
  handler: (args: Record<string, unknown>, ctx: ToolContext) => Promise<string>;
}

/** Keeps per-tool arg types inferred in each handler body while the registry stays uniform. */
function defineTool<S extends z.ZodRawShape>(t: {
  name: string;
  description: string;
  schema: S;
  destructive?: boolean;
  handler: (args: z.infer<z.ZodObject<S>>, ctx: ToolContext) => Promise<string>;
}): AgentTool {
  return { ...t, handler: t.handler as unknown as AgentTool["handler"] };
}

const ownedBy = (userId: string) => `user = "${filterValue(userId)}"`;

/** Name of an expanded relation record, or a dash when it isn't set. */
function expandedName(record: { expand?: Record<string, unknown> }, key: string): string {
  const related = record.expand?.[key] as { name?: unknown } | undefined;
  return typeof related?.name === "string" && related.name ? related.name : "—";
}

async function billedSessionIds(pb: PocketBase, userId: string): Promise<Set<string>> {
  const items = await pb.collection("invoice_items").getFullList({
    filter: `invoice.user = "${filterValue(userId)}" && session != ""`,
    fields: "session",
  });
  return new Set(
    items
      .map((i) => (typeof i.session === "string" ? i.session : ""))
      .filter((id) => id !== ""),
  );
}

export const agentTools: AgentTool[] = [
  defineTool({
    name: "list_clients",
    description: "List all clients for the authenticated user",
    schema: {},
    async handler(_args, { pb, userId }) {
      const records = await pb.collection("clients").getFullList({
        filter: ownedBy(userId),
        sort: "name",
      });
      const clients = records.map(toClientRow);
      return clients.length === 0
        ? "No clients found."
        : clients
            .map((c) => `• ${c.name}${c.company ? ` (${c.company})` : ""} — id: ${c.id}`)
            .join("\n");
    },
  }),

  defineTool({
    name: "list_projects",
    description: "List all projects with client name, billing type, and rate",
    schema: {},
    async handler(_args, { pb, userId }) {
      const records = await pb.collection("projects").getFullList({
        filter: ownedBy(userId),
        sort: "name",
        expand: "client",
      });
      if (records.length === 0) return "No projects found.";
      return records
        .map((record) => {
          const p = toProjectRow(record);
          const rate =
            p.billing_type === "hourly"
              ? `$${p.rate ?? 0}/hr`
              : `$${p.fixed_budget ?? p.rate ?? 0} fixed`;
          return `• ${p.name} | client: ${expandedName(record, "client")} | ${p.billing_type} ${rate} | status: ${p.status} | id: ${p.id}`;
        })
        .join("\n");
    },
  }),

  defineTool({
    name: "recent_sessions",
    description: "List recent time-tracking sessions",
    schema: { limit: z.number().int().min(1).max(100).optional().default(20) },
    async handler({ limit }, { pb, userId }) {
      const page = await pb.collection("sessions").getList(1, limit ?? 20, {
        filter: ownedBy(userId),
        sort: "-started_at",
        expand: "project",
      });
      if (page.items.length === 0) return "No sessions found.";
      return page.items
        .map((record) => {
          const s = toSessionRow(record);
          const hours = (s.duration_seconds / 3600).toFixed(2);
          const amount =
            s.billing_type === "hourly"
              ? `$${((s.duration_seconds / 3600) * s.rate).toFixed(2)}`
              : "fixed";
          const date = s.started_at ? s.started_at.slice(0, 10) : "—";
          const projectName = record.expand?.project ? expandedName(record, "project") : "no project";
          return `• [${date}] ${s.name || "Untitled"} | ${projectName} | ${hours}h | ${amount} | ${s.payment_status}`;
        })
        .join("\n");
    },
  }),

  defineTool({
    name: "log_time",
    description: "Log a new time entry session",
    schema: {
      name: z.string().min(1),
      durationMinutes: z.number().positive(),
      projectId: recordId.optional(),
      clientId: recordId.optional(),
      startedAt: z.string().optional(),
    },
    async handler({ name, durationMinutes, projectId, clientId, startedAt }, { pb, userId }) {
      let resolvedClientId: string | null = clientId ?? null;
      let rate: number | null = null;
      let billingType: "hourly" | "fixed" = "hourly";

      if (projectId) {
        const project = toProjectRow(await pb.collection("projects").getOne(projectId));
        resolvedClientId = resolvedClientId ?? project.client_id;
        rate = project.rate;
        billingType = project.billing_type;
      }

      if (!rate) {
        const settings = await pb
          .collection("user_settings")
          .getFirstListItem(ownedBy(userId))
          .catch(() => null);
        rate = settings ? toUserSettingsRow(settings).default_rate ?? 0 : 0;
      }

      const durationSeconds = Math.round(durationMinutes * 60);
      const sessionStarted = startedAt ?? new Date().toISOString();

      const created = toSessionRow(
        await pb.collection("sessions").create({
          user: userId,
          name,
          duration_seconds: durationSeconds,
          project: projectId ?? "",
          client: resolvedClientId ?? "",
          started_at: sessionStarted,
          rate,
          billing_type: billingType,
          payment_status: "unpaid",
          tags: [],
        }),
      );

      const hours = (durationSeconds / 3600).toFixed(2);
      const amount =
        billingType === "hourly"
          ? `$${((durationSeconds / 3600) * (rate ?? 0)).toFixed(2)}`
          : "fixed";
      return `Logged: "${created.name}" — ${hours}h (${amount}) on ${sessionStarted.slice(0, 10)} | id: ${created.id}`;
    },
  }),

  defineTool({
    name: "dashboard_summary",
    description: "Get dashboard metrics summary for a period",
    schema: { period: z.enum(["Day", "Week", "Month", "All"]).optional().default("Week") },
    async handler({ period }, { pb, userId }) {
      const p = (period ?? "Week") as Period;
      const filter = ownedBy(userId);

      const [sessions, projects, clients, invoices, activities, settings] = await Promise.all([
        pb.collection("sessions").getFullList({ filter }),
        pb.collection("projects").getFullList({ filter }),
        pb.collection("clients").getFullList({ filter }),
        pb.collection("invoices").getFullList({ filter }),
        pb.collection("activities").getFullList({ filter }),
        pb.collection("user_settings").getFirstListItem(filter).catch(() => null),
      ]);

      const now = new Date();
      const input: MetricsInput = {
        sessions: sessions.map(toSessionRow),
        projects: projects.map(toProjectRow),
        clients: clients.map(toClientRow),
        invoices: invoices.map(toInvoiceRow),
        activities: activities.map(toActivityRow),
        settings: settings ? toUserSettingsRow(settings) : null,
        now,
        period: p,
      };

      const metrics = computeMetrics(input);
      const range = rangeFor(p, now);

      return [
        `=== Dashboard (${p}) ===`,
        `Period: ${range.start.toISOString().slice(0, 10)} → ${range.end.toISOString().slice(0, 10)}`,
        ``,
        `Tracked time: ${metrics.daily.totalTimeLabel}`,
        `Earned: ${metrics.billable.billableEarnedLabel}`,
        ``,
        `Billable: ${metrics.billable.billableTimeLabel} (${metrics.billable.pctLabel})`,
        `Non-billable: ${metrics.billable.nonBillableTimeLabel} (${metrics.billable.nonBillablePctLabel})`,
        `Invoiced: ${metrics.billable.invoicedLabel}`,
        ``,
        `Weekly goal: ${metrics.goals.weeklyLabel} (${metrics.goals.weeklyPct}%)`,
        `Current streak: ${metrics.goals.currentStreak} days | Longest: ${metrics.goals.longestStreak} days`,
        ``,
        `Top projects:`,
        ...metrics.projects.rows.map((r) => `  • ${r.name}: ${r.timeLabel} (${r.pctLabel})`),
      ].join("\n");
    },
  }),

  defineTool({
    name: "list_unbilled",
    description: "List unbilled sessions for a client",
    schema: { clientId: recordId },
    async handler({ clientId }, { pb, userId }) {
      const [records, billedSet] = await Promise.all([
        pb.collection("sessions").getFullList({
          filter: `${ownedBy(userId)} && client = "${filterValue(clientId)}" && payment_status = "unpaid"`,
        }),
        billedSessionIds(pb, userId),
      ]);

      const sessions = unbilledSessions(records.map(toSessionRow), clientId, billedSet);
      if (sessions.length === 0) return "No unbilled sessions for this client.";

      const lines = sessions.map((s) => {
        const hours = (s.duration_seconds / 3600).toFixed(2);
        const amount =
          s.billing_type === "hourly"
            ? `$${((s.duration_seconds / 3600) * s.rate).toFixed(2)}`
            : "fixed";
        const date = s.started_at ? s.started_at.slice(0, 10) : "—";
        return `• [${date}] ${s.name || "Untitled"} — ${hours}h (${amount}) | id: ${s.id}`;
      });

      const totalHours = sessions.reduce((sum, s) => sum + s.duration_seconds / 3600, 0);
      const totalAmount = sessions
        .filter((s) => s.billing_type === "hourly")
        .reduce((sum, s) => sum + (s.duration_seconds / 3600) * s.rate, 0);

      lines.push(`\nTotal: ${totalHours.toFixed(2)}h | ~$${totalAmount.toFixed(2)} (hourly sessions only)`);
      return lines.join("\n");
    },
  }),

  defineTool({
    name: "create_client",
    description: "Create a new client record for the authenticated user",
    schema: {
      name: z.string().min(1),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      notes: z.string().optional(),
      tags: z.array(z.string()).optional(),
    },
    async handler({ name, email, phone, company, notes, tags }, { pb, userId }) {
      const c = toClientRow(
        await pb.collection("clients").create({
          user: userId,
          name,
          email: email ?? "",
          phone: phone ?? "",
          company: company ?? "",
          notes: notes ?? "",
          tags: tags ?? [],
        }),
      );
      return `Client created: "${c.name}"${c.company ? ` (${c.company})` : ""} | id: ${c.id}`;
    },
  }),

  defineTool({
    name: "update_client",
    description: "Update an existing client by id (pass only the fields to change)",
    schema: {
      id: recordId,
      name: z.string().min(1).optional(),
      email: z.string().email().nullable().optional(),
      phone: z.string().nullable().optional(),
      company: z.string().nullable().optional(),
      notes: z.string().nullable().optional(),
      tags: z.array(z.string()).optional(),
    },
    async handler({ id, ...fields }, { pb }) {
      const payload: Record<string, unknown> = {};
      if (fields.name !== undefined) payload.name = fields.name;
      if (fields.email !== undefined) payload.email = fields.email ?? "";
      if (fields.phone !== undefined) payload.phone = fields.phone ?? "";
      if (fields.company !== undefined) payload.company = fields.company ?? "";
      if (fields.notes !== undefined) payload.notes = fields.notes ?? "";
      if (fields.tags !== undefined) payload.tags = fields.tags;
      const c = toClientRow(await pb.collection("clients").update(id, payload));
      return `Client updated: "${c.name}"${c.company ? ` (${c.company})` : ""} | id: ${c.id}`;
    },
  }),

  defineTool({
    name: "delete_client",
    description: "Delete a client by id (cascades to projects and sessions via collection rules)",
    schema: { id: recordId },
    destructive: true,
    async handler({ id }, { pb }) {
      await pb.collection("clients").delete(id);
      return `Client ${id} deleted.`;
    },
  }),

  defineTool({
    name: "create_project",
    description: "Create a new project linked to a client",
    schema: {
      name: z.string().min(1),
      clientId: recordId,
      billingType: z.enum(["hourly", "fixed"]).optional().default("hourly"),
      rate: z.number().nonnegative().optional(),
      status: z.string().optional().default("active"),
    },
    async handler({ name, clientId, billingType, rate, status }, { pb, userId }) {
      const billing = billingType ?? "hourly";
      const p = toProjectRow(
        await pb.collection("projects").create({
          user: userId,
          client: clientId,
          name,
          billing_type: billing,
          rate: billing === "hourly" ? rate ?? null : null,
          fixed_budget: billing === "fixed" ? rate ?? null : null,
          status: (status ?? "active") as Project["status"],
        }),
      );
      const rateLabel = p.billing_type === "hourly" ? `$${p.rate ?? 0}/hr` : `$${p.fixed_budget ?? 0} fixed`;
      return `Project created: "${p.name}" | ${p.billing_type} ${rateLabel} | status: ${p.status} | id: ${p.id}`;
    },
  }),

  defineTool({
    name: "update_project",
    description: "Update an existing project by id (pass only the fields to change)",
    schema: {
      id: recordId,
      name: z.string().min(1).optional(),
      billingType: z.enum(["hourly", "fixed"]).optional(),
      rate: z.number().nonnegative().nullable().optional(),
      fixedBudget: z.number().nonnegative().nullable().optional(),
      status: z.string().optional(),
    },
    async handler({ id, name, billingType, rate, fixedBudget, status }, { pb }) {
      const payload: Record<string, unknown> = {};
      if (name !== undefined) payload.name = name;
      if (billingType !== undefined) payload.billing_type = billingType;
      if (rate !== undefined) payload.rate = rate;
      if (fixedBudget !== undefined) payload.fixed_budget = fixedBudget;
      if (status !== undefined) payload.status = status;
      const p = toProjectRow(await pb.collection("projects").update(id, payload));
      const rateLabel = p.billing_type === "hourly" ? `$${p.rate ?? 0}/hr` : `$${p.fixed_budget ?? 0} fixed`;
      return `Project updated: "${p.name}" | ${p.billing_type} ${rateLabel} | status: ${p.status} | id: ${p.id}`;
    },
  }),

  defineTool({
    name: "delete_project",
    description: "Delete a project by id",
    schema: { id: recordId },
    destructive: true,
    async handler({ id }, { pb }) {
      await pb.collection("projects").delete(id);
      return `Project ${id} deleted.`;
    },
  }),

  defineTool({
    name: "update_session",
    description: "Update an existing time-entry session by id (pass only the fields to change)",
    schema: {
      id: recordId,
      name: z.string().min(1).optional(),
      startedAt: z.string().optional(),
      durationMinutes: z.number().positive().optional(),
      paymentStatus: z.enum(["paid", "unpaid"]).optional(),
      projectId: recordId.nullable().optional(),
      rate: z.number().nonnegative().nullable().optional(),
    },
    async handler({ id, name, startedAt, durationMinutes, paymentStatus, projectId, rate }, { pb }) {
      const payload: Record<string, unknown> = {};
      if (name !== undefined) payload.name = name;
      if (startedAt !== undefined) payload.started_at = startedAt;
      if (durationMinutes !== undefined) payload.duration_seconds = Math.round(durationMinutes * 60);
      if (paymentStatus !== undefined) payload.payment_status = paymentStatus;
      if (projectId !== undefined) payload.project = projectId ?? "";
      if (rate !== undefined) payload.rate = rate;
      const s = toSessionRow(await pb.collection("sessions").update(id, payload));
      const hours = (s.duration_seconds / 3600).toFixed(2);
      const date = s.started_at ? s.started_at.slice(0, 10) : "—";
      return `Session updated: "${s.name || "Untitled"}" | ${hours}h on ${date} | ${s.payment_status} | id: ${s.id}`;
    },
  }),

  defineTool({
    name: "delete_session",
    description: "Delete a time-entry session by id",
    schema: { id: recordId },
    destructive: true,
    async handler({ id }, { pb }) {
      await pb.collection("sessions").delete(id);
      return `Session ${id} deleted.`;
    },
  }),

  defineTool({
    name: "list_invoices",
    description: "List invoices with optional status filter, including client name and totals",
    schema: { status: z.enum(["draft", "sent", "paid", "overdue"]).optional() },
    async handler({ status }, { pb, userId }) {
      const filter = status
        ? `${ownedBy(userId)} && status = "${filterValue(status)}"`
        : ownedBy(userId);
      const records = await pb.collection("invoices").getFullList({
        filter,
        sort: "-created",
        expand: "client",
      });
      if (records.length === 0) return "No invoices found.";
      return records
        .map((record) => {
          const inv = toInvoiceRow(record);
          const due = inv.due_date ? ` due: ${inv.due_date.slice(0, 10)}` : "";
          return `• ${inv.invoice_number} | ${expandedName(record, "client")} | $${inv.total.toFixed(2)} ${inv.currency} | ${inv.status}${due} | id: ${inv.id}`;
        })
        .join("\n");
    },
  }),

  defineTool({
    name: "update_invoice",
    description:
      "Update an invoice status, due date, or notes. Setting status to 'sent' records sent_at; 'paid' records paid_at.",
    schema: {
      id: recordId,
      status: z.enum(["draft", "sent", "paid"]).optional(),
      dueDate: z.string().nullable().optional(),
      notes: z.string().nullable().optional(),
    },
    async handler({ id, status, dueDate, notes }, { pb }) {
      const payload: Record<string, unknown> = {};
      if (status !== undefined) {
        payload.status = status;
        if (status === "sent") payload.sent_at = new Date().toISOString();
        if (status === "paid") payload.paid_at = new Date().toISOString();
      }
      if (dueDate !== undefined) payload.due_date = dueDate ?? "";
      if (notes !== undefined) payload.notes = notes ?? "";
      const inv = toInvoiceRow(await pb.collection("invoices").update(id, payload));
      return `Invoice ${inv.invoice_number} updated | status: ${inv.status} | total: $${inv.total.toFixed(2)} ${inv.currency} | id: ${inv.id}`;
    },
  }),

  defineTool({
    name: "delete_invoice",
    description: "Delete an invoice and all its line items by id",
    schema: { id: recordId },
    destructive: true,
    async handler({ id }, { pb, userId }) {
      const items = await pb.collection("invoice_items").getFullList({
        filter: `invoice.user = "${filterValue(userId)}" && invoice = "${filterValue(id)}"`,
        fields: "id",
      });
      await Promise.all(items.map((item) => pb.collection("invoice_items").delete(item.id)));
      await pb.collection("invoices").delete(id);
      return `Invoice ${id} and its line items deleted.`;
    },
  }),

  defineTool({
    name: "create_invoice",
    description: "Create a draft invoice for a client from their unbilled sessions",
    schema: {
      clientId: recordId,
      sessionIds: z.array(recordId).optional(),
      taxRate: z.number().min(0).max(100).optional().default(0),
    },
    async handler({ clientId, sessionIds, taxRate }, { pb, userId }) {
      const tax = taxRate ?? 0;

      const sessionFilter = [`${ownedBy(userId)} && client = "${filterValue(clientId)}"`];
      if (sessionIds && sessionIds.length > 0) {
        sessionFilter.push(
          `(${sessionIds.map((id) => `id = "${filterValue(id)}"`).join(" || ")})`,
        );
      }

      const [sessionRecords, billedSet, invoiceRecords, settings] = await Promise.all([
        pb.collection("sessions").getFullList({ filter: sessionFilter.join(" && ") }),
        billedSessionIds(pb, userId),
        pb.collection("invoices").getFullList({ filter: ownedBy(userId), fields: "invoice_number" }),
        pb.collection("user_settings").getFirstListItem(ownedBy(userId)).catch(() => null),
      ]);

      const sessions = sessionRecords.map(toSessionRow);
      const candidateSessions =
        sessionIds && sessionIds.length > 0
          ? sessions
          : unbilledSessions(sessions, clientId, billedSet);

      if (candidateSessions.length === 0) return "No sessions available to invoice for this client.";

      const items = candidateSessions.map(sessionToInvoiceItem);
      const totals = computeInvoiceTotals(items, tax);
      const existingInvoices = invoiceRecords.map(
        (r) => ({ invoice_number: String(r.invoice_number ?? "") } as Invoice),
      );
      const invoiceNumber = nextInvoiceNumber(existingInvoices);
      const currency = settings ? toUserSettingsRow(settings).default_currency : "USD";

      const invoice = toInvoiceRow(
        await pb.collection("invoices").create({
          user: userId,
          client: clientId,
          invoice_number: invoiceNumber,
          subtotal: totals.subtotal,
          tax_rate: tax,
          tax_amount: totals.tax_amount,
          total: totals.total,
          currency,
          status: "draft",
          due_date: "",
        }),
      );

      await Promise.all(
        items.map((item) =>
          pb.collection("invoice_items").create({
            invoice: invoice.id,
            session: item.session_id ?? "",
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
          }),
        ),
      );

      return `Invoice ${invoice.invoice_number} created (draft) | id: ${invoice.id}\n  Items: ${items.length}\n  Subtotal: $${totals.subtotal.toFixed(2)}\n  Tax (${tax}%): $${totals.tax_amount.toFixed(2)}\n  Total: $${totals.total.toFixed(2)} ${currency}`;
    },
  }),
];

/** Lookup by name — used to dispatch a tool call. */
export const agentToolByName: Map<string, AgentTool> = new Map(
  agentTools.map((t) => [t.name, t])
);
