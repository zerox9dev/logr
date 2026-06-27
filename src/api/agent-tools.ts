// Shared agent tool registry.
//
// Single source of truth for the tools both surfaces expose:
//   • the external MCP server at /[transport] (Claude Desktop et al.)
//   • the in-app conversational chat at /api/chat
//
// Each tool is defined once, parameterised by a user-scoped Supabase client
// (RLS-enforced) and the user id. Handlers return a plain string; each surface
// adapts that to its own response shape. `destructive: true` marks tools the
// chat must confirm with the user before running.

import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  unbilledSessions,
  sessionToInvoiceItem,
  computeInvoiceTotals,
  nextInvoiceNumber,
} from "@/domain/invoicing";
import { computeMetrics, rangeFor } from "@/domain/dashboard-metrics";
import type { Period, MetricsInput } from "@/domain/dashboard-metrics";
import type {
  Session,
  Project,
  Client,
  Invoice,
  Activity,
  UserSettings,
} from "@/types/database";

export interface ToolContext {
  /** User-scoped Supabase client — all queries are RLS-filtered. */
  supabase: SupabaseClient;
  userId: string;
}

export interface AgentTool {
  name: string;
  description: string;
  /** Zod raw shape — consumed directly by the MCP SDK and JSON-Schema-ified for the chat. */
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

export const agentTools: AgentTool[] = [
  defineTool({
    name: "list_clients",
    description: "List all clients for the authenticated user",
    schema: {},
    async handler(_args, { supabase }) {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, company, email")
        .order("name");
      if (error) throw new Error(error.message);
      const clients = (data as Pick<Client, "id" | "name" | "company" | "email">[]) ?? [];
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
    async handler(_args, { supabase }) {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, billing_type, rate, fixed_budget, status, client_id, clients(name)")
        .order("name");
      if (error) throw new Error(error.message);
      type ProjectRow = {
        id: string;
        name: string;
        billing_type: string;
        rate: number | null;
        fixed_budget: number | null;
        status: string;
        client_id: string;
        clients: { name: string }[] | null;
      };
      const rows = (data as ProjectRow[]) ?? [];
      return rows.length === 0
        ? "No projects found."
        : rows
            .map((p) => {
              const clientName = Array.isArray(p.clients)
                ? p.clients[0]?.name ?? "—"
                : (p.clients as { name: string } | null)?.name ?? "—";
              const rate =
                p.billing_type === "hourly"
                  ? `$${p.rate ?? 0}/hr`
                  : `$${p.fixed_budget ?? p.rate ?? 0} fixed`;
              return `• ${p.name} | client: ${clientName} | ${p.billing_type} ${rate} | status: ${p.status} | id: ${p.id}`;
            })
            .join("\n");
    },
  }),

  defineTool({
    name: "recent_sessions",
    description: "List recent time-tracking sessions",
    schema: { limit: z.number().int().min(1).max(100).optional().default(20) },
    async handler({ limit }, { supabase }) {
      const { data, error } = await supabase
        .from("sessions")
        .select("id, name, started_at, duration_seconds, rate, billing_type, payment_status, project_id, projects(name)")
        .order("started_at", { ascending: false })
        .limit(limit ?? 20);
      if (error) throw new Error(error.message);
      type SessionRow = {
        id: string;
        name: string | null;
        started_at: string | null;
        duration_seconds: number | null;
        rate: number | null;
        billing_type: string;
        payment_status: string;
        projects: { name: string }[] | null;
      };
      const rows = (data as SessionRow[]) ?? [];
      return rows.length === 0
        ? "No sessions found."
        : rows
            .map((s) => {
              const hours = ((s.duration_seconds ?? 0) / 3600).toFixed(2);
              const amount =
                s.billing_type === "hourly"
                  ? `$${(((s.duration_seconds ?? 0) / 3600) * (s.rate ?? 0)).toFixed(2)}`
                  : "fixed";
              const date = s.started_at ? new Date(s.started_at).toISOString().slice(0, 10) : "—";
              const projectName = Array.isArray(s.projects)
                ? s.projects[0]?.name ?? "no project"
                : (s.projects as { name: string } | null)?.name ?? "no project";
              return `• [${date}] ${s.name ?? "Untitled"} | ${projectName} | ${hours}h | ${amount} | ${s.payment_status}`;
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
      projectId: z.string().uuid().optional(),
      clientId: z.string().uuid().optional(),
      startedAt: z.string().optional(),
    },
    async handler({ name, durationMinutes, projectId, clientId, startedAt }, { supabase, userId }) {
      let resolvedClientId: string | null = clientId ?? null;
      let rate: number | null = null;
      let billingType: "hourly" | "fixed" = "hourly";

      if (projectId) {
        const { data: proj } = await supabase
          .from("projects")
          .select("client_id, rate, billing_type")
          .eq("id", projectId)
          .single();
        if (proj) {
          const p = proj as Pick<Project, "client_id" | "rate" | "billing_type">;
          resolvedClientId = resolvedClientId ?? p.client_id;
          rate = p.rate;
          billingType = p.billing_type as "hourly" | "fixed";
        }
      }

      if (!rate) {
        const { data: settings } = await supabase
          .from("user_settings")
          .select("default_rate")
          .single();
        rate = (settings as Pick<UserSettings, "default_rate"> | null)?.default_rate ?? 0;
      }

      const durationSeconds = Math.round(durationMinutes * 60);
      const sessionStarted = startedAt ?? new Date().toISOString();

      const { data: created, error } = await supabase
        .from("sessions")
        .insert({
          user_id: userId,
          name,
          duration_seconds: durationSeconds,
          project_id: projectId ?? null,
          client_id: resolvedClientId,
          started_at: sessionStarted,
          rate,
          billing_type: billingType,
          payment_status: "unpaid" as const,
          tags: [],
        })
        .select("id, name, duration_seconds, rate, billing_type, started_at")
        .single();

      if (error) throw new Error(error.message);
      const hours = (durationSeconds / 3600).toFixed(2);
      const amount =
        billingType === "hourly"
          ? `$${((durationSeconds / 3600) * (rate ?? 0)).toFixed(2)}`
          : "fixed";
      const cr = created as Pick<Session, "id" | "name" | "started_at">;
      return `Logged: "${cr.name}" — ${hours}h (${amount}) on ${sessionStarted.slice(0, 10)} | id: ${cr.id}`;
    },
  }),

  defineTool({
    name: "dashboard_summary",
    description: "Get dashboard metrics summary for a period",
    schema: { period: z.enum(["Day", "Week", "Month", "All"]).optional().default("Week") },
    async handler({ period }, { supabase }) {
      const p = (period ?? "Week") as Period;

      const [sessRes, projRes, clientRes, invRes, actRes, settRes] = await Promise.all([
        supabase.from("sessions").select("*"),
        supabase.from("projects").select("*"),
        supabase.from("clients").select("*"),
        supabase.from("invoices").select("*"),
        supabase.from("activities").select("*"),
        supabase.from("user_settings").select("*").single(),
      ]);

      const now = new Date();
      const input: MetricsInput = {
        sessions: (sessRes.data as Session[]) ?? [],
        projects: (projRes.data as Project[]) ?? [],
        clients: (clientRes.data as Client[]) ?? [],
        invoices: (invRes.data as Invoice[]) ?? [],
        activities: (actRes.data as Activity[]) ?? [],
        settings: settRes.data as UserSettings | null,
        now,
        today: new Date(now.toDateString()),
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
    schema: { clientId: z.string().uuid() },
    async handler({ clientId }, { supabase }) {
      const [sessRes, billedRes] = await Promise.all([
        supabase.from("sessions").select("*").eq("client_id", clientId).eq("payment_status", "unpaid"),
        supabase.from("invoice_items").select("session_id").not("session_id", "is", null),
      ]);

      if (sessRes.error) throw new Error(sessRes.error.message);

      const billedSet = new Set(
        ((billedRes.data ?? []) as { session_id: string | null }[])
          .map((r) => r.session_id)
          .filter((id): id is string => id !== null)
      );

      const sessions = unbilledSessions((sessRes.data as Session[]) ?? [], clientId, billedSet);
      if (sessions.length === 0) return "No unbilled sessions for this client.";

      const lines = sessions.map((s) => {
        const hours = ((s.duration_seconds ?? 0) / 3600).toFixed(2);
        const amount =
          s.billing_type === "hourly"
            ? `$${(((s.duration_seconds ?? 0) / 3600) * (s.rate ?? 0)).toFixed(2)}`
            : "fixed";
        const date = s.started_at ? new Date(s.started_at).toISOString().slice(0, 10) : "—";
        return `• [${date}] ${s.name ?? "Untitled"} — ${hours}h (${amount}) | id: ${s.id}`;
      });

      const totalHours = sessions.reduce((sum, s) => sum + (s.duration_seconds ?? 0) / 3600, 0);
      const totalAmount = sessions
        .filter((s) => s.billing_type === "hourly")
        .reduce((sum, s) => sum + ((s.duration_seconds ?? 0) / 3600) * (s.rate ?? 0), 0);

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
    async handler({ name, email, phone, company, notes, tags }, { supabase, userId }) {
      const { data, error } = await supabase
        .from("clients")
        .insert({
          user_id: userId,
          name,
          email: email ?? null,
          phone: phone ?? null,
          company: company ?? null,
          notes: notes ?? null,
          tags: tags ?? [],
        })
        .select("id, name, company, email")
        .single();
      if (error) throw new Error(error.message);
      const c = data as Pick<Client, "id" | "name" | "company" | "email">;
      return `Client created: "${c.name}"${c.company ? ` (${c.company})` : ""} | id: ${c.id}`;
    },
  }),

  defineTool({
    name: "update_client",
    description: "Update an existing client by id (pass only the fields to change)",
    schema: {
      id: z.string().uuid(),
      name: z.string().min(1).optional(),
      email: z.string().email().nullable().optional(),
      phone: z.string().nullable().optional(),
      company: z.string().nullable().optional(),
      notes: z.string().nullable().optional(),
      tags: z.array(z.string()).optional(),
    },
    async handler({ id, ...fields }, { supabase }) {
      const payload: Record<string, unknown> = {};
      if (fields.name !== undefined) payload.name = fields.name;
      if (fields.email !== undefined) payload.email = fields.email;
      if (fields.phone !== undefined) payload.phone = fields.phone;
      if (fields.company !== undefined) payload.company = fields.company;
      if (fields.notes !== undefined) payload.notes = fields.notes;
      if (fields.tags !== undefined) payload.tags = fields.tags;
      const { data, error } = await supabase
        .from("clients")
        .update(payload)
        .eq("id", id)
        .select("id, name, company, email")
        .single();
      if (error) throw new Error(error.message);
      const c = data as Pick<Client, "id" | "name" | "company" | "email">;
      return `Client updated: "${c.name}"${c.company ? ` (${c.company})` : ""} | id: ${c.id}`;
    },
  }),

  defineTool({
    name: "delete_client",
    description: "Delete a client by id (cascades to projects and sessions via DB constraints)",
    schema: { id: z.string().uuid() },
    destructive: true,
    async handler({ id }, { supabase }) {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return `Client ${id} deleted.`;
    },
  }),

  defineTool({
    name: "create_project",
    description: "Create a new project linked to a client",
    schema: {
      name: z.string().min(1),
      clientId: z.string().uuid(),
      billingType: z.enum(["hourly", "fixed"]).optional().default("hourly"),
      rate: z.number().nonnegative().optional(),
      status: z.string().optional().default("active"),
    },
    async handler({ name, clientId, billingType, rate, status }, { supabase, userId }) {
      const billing = billingType ?? "hourly";
      const { data, error } = await supabase
        .from("projects")
        .insert({
          user_id: userId,
          client_id: clientId,
          name,
          billing_type: billing,
          rate: billing === "hourly" ? rate ?? null : null,
          fixed_budget: billing === "fixed" ? rate ?? null : null,
          status: (status ?? "active") as Project["status"],
        })
        .select("id, name, billing_type, rate, fixed_budget, status")
        .single();
      if (error) throw new Error(error.message);
      type ProjRow = Pick<Project, "id" | "name" | "billing_type" | "rate" | "fixed_budget" | "status">;
      const p = data as ProjRow;
      const rateLabel = p.billing_type === "hourly" ? `$${p.rate ?? 0}/hr` : `$${p.fixed_budget ?? 0} fixed`;
      return `Project created: "${p.name}" | ${p.billing_type} ${rateLabel} | status: ${p.status} | id: ${p.id}`;
    },
  }),

  defineTool({
    name: "update_project",
    description: "Update an existing project by id (pass only the fields to change)",
    schema: {
      id: z.string().uuid(),
      name: z.string().min(1).optional(),
      billingType: z.enum(["hourly", "fixed"]).optional(),
      rate: z.number().nonnegative().nullable().optional(),
      fixedBudget: z.number().nonnegative().nullable().optional(),
      status: z.string().optional(),
    },
    async handler({ id, name, billingType, rate, fixedBudget, status }, { supabase }) {
      const payload: Record<string, unknown> = {};
      if (name !== undefined) payload.name = name;
      if (billingType !== undefined) payload.billing_type = billingType;
      if (rate !== undefined) payload.rate = rate;
      if (fixedBudget !== undefined) payload.fixed_budget = fixedBudget;
      if (status !== undefined) payload.status = status;
      const { data, error } = await supabase
        .from("projects")
        .update(payload)
        .eq("id", id)
        .select("id, name, billing_type, rate, fixed_budget, status")
        .single();
      if (error) throw new Error(error.message);
      type ProjRow = Pick<Project, "id" | "name" | "billing_type" | "rate" | "fixed_budget" | "status">;
      const p = data as ProjRow;
      const rateLabel = p.billing_type === "hourly" ? `$${p.rate ?? 0}/hr` : `$${p.fixed_budget ?? 0} fixed`;
      return `Project updated: "${p.name}" | ${p.billing_type} ${rateLabel} | status: ${p.status} | id: ${p.id}`;
    },
  }),

  defineTool({
    name: "delete_project",
    description: "Delete a project by id",
    schema: { id: z.string().uuid() },
    destructive: true,
    async handler({ id }, { supabase }) {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return `Project ${id} deleted.`;
    },
  }),

  defineTool({
    name: "update_session",
    description: "Update an existing time-entry session by id (pass only the fields to change)",
    schema: {
      id: z.string().uuid(),
      name: z.string().min(1).optional(),
      startedAt: z.string().optional(),
      durationMinutes: z.number().positive().optional(),
      paymentStatus: z.enum(["paid", "unpaid"]).optional(),
      projectId: z.string().uuid().nullable().optional(),
      rate: z.number().nonnegative().nullable().optional(),
    },
    async handler({ id, name, startedAt, durationMinutes, paymentStatus, projectId, rate }, { supabase }) {
      const payload: Record<string, unknown> = {};
      if (name !== undefined) payload.name = name;
      if (startedAt !== undefined) payload.started_at = startedAt;
      if (durationMinutes !== undefined) payload.duration_seconds = Math.round(durationMinutes * 60);
      if (paymentStatus !== undefined) payload.payment_status = paymentStatus;
      if (projectId !== undefined) payload.project_id = projectId;
      if (rate !== undefined) payload.rate = rate;
      const { data, error } = await supabase
        .from("sessions")
        .update(payload)
        .eq("id", id)
        .select("id, name, started_at, duration_seconds, rate, payment_status")
        .single();
      if (error) throw new Error(error.message);
      type SessRow = Pick<Session, "id" | "name" | "started_at" | "duration_seconds" | "rate" | "payment_status">;
      const s = data as SessRow;
      const hours = ((s.duration_seconds ?? 0) / 3600).toFixed(2);
      const date = s.started_at ? new Date(s.started_at).toISOString().slice(0, 10) : "—";
      return `Session updated: "${s.name ?? "Untitled"}" | ${hours}h on ${date} | ${s.payment_status} | id: ${s.id}`;
    },
  }),

  defineTool({
    name: "delete_session",
    description: "Delete a time-entry session by id",
    schema: { id: z.string().uuid() },
    destructive: true,
    async handler({ id }, { supabase }) {
      const { error } = await supabase.from("sessions").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return `Session ${id} deleted.`;
    },
  }),

  defineTool({
    name: "list_invoices",
    description: "List invoices with optional status filter, including client name and totals",
    schema: { status: z.enum(["draft", "sent", "paid", "overdue"]).optional() },
    async handler({ status }, { supabase }) {
      let query = supabase
        .from("invoices")
        .select("id, invoice_number, total, currency, status, due_date, created_at, clients(name)")
        .order("created_at", { ascending: false });
      if (status) query = query.eq("status", status);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      type InvRow = {
        id: string;
        invoice_number: string;
        total: number;
        currency: string;
        status: string;
        due_date: string | null;
        created_at: string;
        clients: { name: string }[] | null;
      };
      const rows = (data as InvRow[]) ?? [];
      if (rows.length === 0) return "No invoices found.";
      return rows
        .map((inv) => {
          const clientName = Array.isArray(inv.clients)
            ? inv.clients[0]?.name ?? "—"
            : (inv.clients as { name: string } | null)?.name ?? "—";
          const due = inv.due_date ? ` due: ${inv.due_date}` : "";
          return `• ${inv.invoice_number} | ${clientName} | $${inv.total.toFixed(2)} ${inv.currency} | ${inv.status}${due} | id: ${inv.id}`;
        })
        .join("\n");
    },
  }),

  defineTool({
    name: "update_invoice",
    description:
      "Update an invoice status, due date, or notes. Setting status to 'sent' records sent_at; 'paid' records paid_at.",
    schema: {
      id: z.string().uuid(),
      status: z.enum(["draft", "sent", "paid"]).optional(),
      dueDate: z.string().nullable().optional(),
      notes: z.string().nullable().optional(),
    },
    async handler({ id, status, dueDate, notes }, { supabase }) {
      const payload: Record<string, unknown> = {};
      if (status !== undefined) {
        payload.status = status;
        if (status === "sent") payload.sent_at = new Date().toISOString();
        if (status === "paid") payload.paid_at = new Date().toISOString();
      }
      if (dueDate !== undefined) payload.due_date = dueDate;
      if (notes !== undefined) payload.notes = notes;
      const { data, error } = await supabase
        .from("invoices")
        .update(payload)
        .eq("id", id)
        .select("id, invoice_number, status, total, currency")
        .single();
      if (error) throw new Error(error.message);
      type InvRow = Pick<Invoice, "id" | "invoice_number" | "status" | "total" | "currency">;
      const inv = data as InvRow;
      return `Invoice ${inv.invoice_number} updated | status: ${inv.status} | total: $${inv.total.toFixed(2)} ${inv.currency} | id: ${inv.id}`;
    },
  }),

  defineTool({
    name: "delete_invoice",
    description: "Delete an invoice and all its line items by id",
    schema: { id: z.string().uuid() },
    destructive: true,
    async handler({ id }, { supabase }) {
      const { error: itemsErr } = await supabase.from("invoice_items").delete().eq("invoice_id", id);
      if (itemsErr) throw new Error(itemsErr.message);
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return `Invoice ${id} and its line items deleted.`;
    },
  }),

  defineTool({
    name: "create_invoice",
    description: "Create a draft invoice for a client from their unbilled sessions",
    schema: {
      clientId: z.string().uuid(),
      sessionIds: z.array(z.string().uuid()).optional(),
      taxRate: z.number().min(0).max(100).optional().default(0),
    },
    async handler({ clientId, sessionIds, taxRate }, { supabase, userId }) {
      const tax = taxRate ?? 0;

      let sessQuery = supabase.from("sessions").select("*").eq("client_id", clientId);
      if (sessionIds && sessionIds.length > 0) sessQuery = sessQuery.in("id", sessionIds);

      const [sessRes, billedRes, invRes, settRes] = await Promise.all([
        sessQuery,
        supabase.from("invoice_items").select("session_id").not("session_id", "is", null),
        supabase.from("invoices").select("invoice_number"),
        supabase.from("user_settings").select("default_currency").single(),
      ]);

      if (sessRes.error) throw new Error(sessRes.error.message);

      const billedSet = new Set(
        ((billedRes.data ?? []) as { session_id: string | null }[])
          .map((r) => r.session_id)
          .filter((id): id is string => id !== null)
      );

      const candidateSessions =
        sessionIds && sessionIds.length > 0
          ? (sessRes.data as Session[]) ?? []
          : unbilledSessions((sessRes.data as Session[]) ?? [], clientId, billedSet);

      if (candidateSessions.length === 0) return "No sessions available to invoice for this client.";

      const items = candidateSessions.map(sessionToInvoiceItem);
      const totals = computeInvoiceTotals(items, tax);
      const existingInvoices = ((invRes.data ?? []) as { invoice_number: string }[]).map(
        (r) => ({ invoice_number: r.invoice_number } as Invoice)
      );
      const invoiceNumber = nextInvoiceNumber(existingInvoices);
      const currency =
        (settRes.data as Pick<UserSettings, "default_currency"> | null)?.default_currency ?? "USD";

      const { data: invoice, error: invErr } = await supabase
        .from("invoices")
        .insert({
          user_id: userId,
          client_id: clientId,
          invoice_number: invoiceNumber,
          subtotal: totals.subtotal,
          tax_rate: tax,
          tax_amount: totals.tax_amount,
          total: totals.total,
          currency,
          status: "draft" as const,
          due_date: null,
        })
        .select("id, invoice_number, total")
        .single();

      if (invErr) throw new Error(invErr.message);

      const inv = invoice as Pick<Invoice, "id" | "invoice_number" | "total">;
      const invoiceItems = items.map((item) => ({ ...item, invoice_id: inv.id }));
      const { error: itemsErr } = await supabase.from("invoice_items").insert(invoiceItems);
      if (itemsErr) throw new Error(itemsErr.message);

      return `Invoice ${inv.invoice_number} created (draft) | id: ${inv.id}\n  Items: ${items.length}\n  Subtotal: $${totals.subtotal.toFixed(2)}\n  Tax (${tax}%): $${totals.tax_amount.toFixed(2)}\n  Total: $${totals.total.toFixed(2)} ${currency}`;
    },
  }),
];

/** Lookup by name — used by both surfaces to dispatch a tool call. */
export const agentToolByName: Map<string, AgentTool> = new Map(
  agentTools.map((t) => [t.name, t])
);
