import { createMcpHandler, withMcpAuth } from "mcp-handler";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { z } from "zod";
import { getAdminClient, getUserClient } from "@/lib/supabase-mcp";
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

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Auth verification — validates Supabase access token via admin API
// ---------------------------------------------------------------------------
async function verifyToken(
  _req: Request,
  bearerToken?: string
): Promise<AuthInfo | undefined> {
  if (!bearerToken) return undefined;
  const admin = getAdminClient();
  const { data, error } = await admin.auth.getUser(bearerToken);
  if (error || !data.user) return undefined;
  return {
    token: bearerToken,
    clientId: data.user.id,
    scopes: [],
    extra: { userId: data.user.id, accessToken: bearerToken },
  };
}

// ---------------------------------------------------------------------------
// MCP handler with all tools
// ---------------------------------------------------------------------------
function initServer(server: McpServer) {
  // ------------------------------------------------------------------ 1
  server.tool(
    "list_clients",
    "List all clients for the authenticated user",
    {},
    async (_args, extra) => {
      const supabase = getUserClient(extra.authInfo as AuthInfo);
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, company, email")
        .order("name");
      if (error) throw new Error(error.message);
      const clients = (data as Pick<Client, "id" | "name" | "company" | "email">[]) ?? [];
      const text =
        clients.length === 0
          ? "No clients found."
          : clients
              .map(
                (c) =>
                  `• ${c.name}${c.company ? ` (${c.company})` : ""} — id: ${c.id}`
              )
              .join("\n");
      return { content: [{ type: "text" as const, text }] };
    }
  );

  // ------------------------------------------------------------------ 2
  server.tool(
    "list_projects",
    "List all projects with client name, billing type, and rate",
    {},
    async (_args, extra) => {
      const supabase = getUserClient(extra.authInfo as AuthInfo);
      const { data, error } = await supabase
        .from("projects")
        .select(
          "id, name, billing_type, rate, fixed_budget, status, client_id, clients(name)"
        )
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
      const text =
        rows.length === 0
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
      return { content: [{ type: "text" as const, text }] };
    }
  );

  // ------------------------------------------------------------------ 3
  server.tool(
    "recent_sessions",
    "List recent time-tracking sessions",
    { limit: z.number().int().min(1).max(100).optional().default(20) },
    async ({ limit }, extra) => {
      const supabase = getUserClient(extra.authInfo as AuthInfo);
      const { data, error } = await supabase
        .from("sessions")
        .select(
          "id, name, started_at, duration_seconds, rate, billing_type, payment_status, project_id, projects(name)"
        )
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
      const text =
        rows.length === 0
          ? "No sessions found."
          : rows
              .map((s) => {
                const hours = ((s.duration_seconds ?? 0) / 3600).toFixed(2);
                const amount =
                  s.billing_type === "hourly"
                    ? `$${(((s.duration_seconds ?? 0) / 3600) * (s.rate ?? 0)).toFixed(2)}`
                    : "fixed";
                const date = s.started_at
                  ? new Date(s.started_at).toISOString().slice(0, 10)
                  : "—";
                const projectName = Array.isArray(s.projects)
                  ? s.projects[0]?.name ?? "no project"
                  : (s.projects as { name: string } | null)?.name ?? "no project";
                return `• [${date}] ${s.name ?? "Untitled"} | ${projectName} | ${hours}h | ${amount} | ${s.payment_status}`;
              })
              .join("\n");
      return { content: [{ type: "text" as const, text }] };
    }
  );

  // ------------------------------------------------------------------ 4
  server.tool(
    "log_time",
    "Log a new time entry session",
    {
      name: z.string().min(1),
      durationMinutes: z.number().positive(),
      projectId: z.string().uuid().optional(),
      clientId: z.string().uuid().optional(),
      startedAt: z.string().optional(),
    },
    async ({ name, durationMinutes, projectId, clientId, startedAt }, extra) => {
      const supabase = getUserClient(extra.authInfo as AuthInfo);

      // Resolve project details
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
          resolvedClientId = resolvedClientId ?? (proj as Pick<Project, "client_id" | "rate" | "billing_type">).client_id;
          rate = (proj as Pick<Project, "client_id" | "rate" | "billing_type">).rate;
          billingType = (proj as Pick<Project, "client_id" | "rate" | "billing_type">).billing_type as "hourly" | "fixed";
        }
      }

      // Fall back to user default rate
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
          user_id: (extra.authInfo as AuthInfo).extra?.userId as string,
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
      const text = `Logged: "${cr.name}" — ${hours}h (${amount}) on ${sessionStarted.slice(0, 10)} | id: ${cr.id}`;
      return { content: [{ type: "text" as const, text }] };
    }
  );

  // ------------------------------------------------------------------ 5
  server.tool(
    "dashboard_summary",
    "Get dashboard metrics summary for a period",
    {
      period: z
        .enum(["Day", "Week", "Month", "All"])
        .optional()
        .default("Week"),
    },
    async ({ period }, extra) => {
      const supabase = getUserClient(extra.authInfo as AuthInfo);
      const p = (period ?? "Week") as Period;

      const [sessRes, projRes, clientRes, invRes, actRes, settRes] =
        await Promise.all([
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
        settings: (settRes.data as UserSettings | null),
        now,
        today: new Date(now.toDateString()),
        period: p,
      };

      const metrics = computeMetrics(input);
      const range = rangeFor(p, now);

      const lines: string[] = [
        `=== Dashboard (${p}) ===`,
        `Period: ${range.start.toISOString().slice(0, 10)} → ${range.end.toISOString().slice(0, 10)}`,
        ``,
        `Tracked time: ${metrics.tracking.rateLabel}`,
        `Earned: ${metrics.tracking.earnedLabel}`,
        ``,
        `Billable: ${metrics.billable.billableTimeLabel} (${metrics.billable.pctLabel})`,
        `Non-billable: ${metrics.billable.nonBillableTimeLabel} (${metrics.billable.nonBillablePctLabel})`,
        `Invoiced: ${metrics.billable.invoicedLabel}`,
        ``,
        `Weekly goal: ${metrics.goals.weeklyLabel} (${metrics.goals.weeklyPct}%)`,
        `Current streak: ${metrics.goals.currentStreak} days | Longest: ${metrics.goals.longestStreak} days`,
        ``,
        `Top projects:`,
        ...metrics.projects.rows.map(
          (r) => `  • ${r.name}: ${r.timeLabel} (${r.pctLabel})`
        ),
      ];

      return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    }
  );

  // ------------------------------------------------------------------ 6
  server.tool(
    "list_unbilled",
    "List unbilled sessions for a client",
    { clientId: z.string().uuid() },
    async ({ clientId }, extra) => {
      const supabase = getUserClient(extra.authInfo as AuthInfo);

      const [sessRes, billedRes] = await Promise.all([
        supabase
          .from("sessions")
          .select("*")
          .eq("client_id", clientId)
          .eq("payment_status", "unpaid"),
        supabase
          .from("invoice_items")
          .select("session_id")
          .not("session_id", "is", null),
      ]);

      if (sessRes.error) throw new Error(sessRes.error.message);

      const billedSet = new Set(
        ((billedRes.data ?? []) as { session_id: string | null }[])
          .map((r) => r.session_id)
          .filter((id): id is string => id !== null)
      );

      const sessions = unbilledSessions(
        (sessRes.data as Session[]) ?? [],
        clientId,
        billedSet
      );

      if (sessions.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: "No unbilled sessions for this client.",
            },
          ],
        };
      }

      const lines = sessions.map((s) => {
        const hours = ((s.duration_seconds ?? 0) / 3600).toFixed(2);
        const amount =
          s.billing_type === "hourly"
            ? `$${(((s.duration_seconds ?? 0) / 3600) * (s.rate ?? 0)).toFixed(2)}`
            : "fixed";
        const date = s.started_at
          ? new Date(s.started_at).toISOString().slice(0, 10)
          : "—";
        return `• [${date}] ${s.name ?? "Untitled"} — ${hours}h (${amount}) | id: ${s.id}`;
      });

      const totalHours = sessions.reduce(
        (sum, s) => sum + (s.duration_seconds ?? 0) / 3600,
        0
      );
      const totalAmount = sessions
        .filter((s) => s.billing_type === "hourly")
        .reduce(
          (sum, s) =>
            sum + ((s.duration_seconds ?? 0) / 3600) * (s.rate ?? 0),
          0
        );

      lines.push(
        `\nTotal: ${totalHours.toFixed(2)}h | ~$${totalAmount.toFixed(2)} (hourly sessions only)`
      );
      return {
        content: [{ type: "text" as const, text: lines.join("\n") }],
      };
    }
  );

  // ------------------------------------------------------------------ 8 (Clients — CRUD)
  server.tool(
    "create_client",
    "Create a new client record for the authenticated user",
    {
      name: z.string().min(1),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      notes: z.string().optional(),
      tags: z.array(z.string()).optional(),
    },
    async ({ name, email, phone, company, notes, tags }, extra) => {
      const supabase = getUserClient(extra.authInfo as AuthInfo);
      const userId = (extra.authInfo as AuthInfo).extra?.userId as string;
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
      const text = `Client created: "${c.name}"${c.company ? ` (${c.company})` : ""} | id: ${c.id}`;
      return { content: [{ type: "text" as const, text }] };
    }
  );

  server.tool(
    "update_client",
    "Update an existing client by id (pass only the fields to change)",
    {
      id: z.string().uuid(),
      name: z.string().min(1).optional(),
      email: z.string().email().nullable().optional(),
      phone: z.string().nullable().optional(),
      company: z.string().nullable().optional(),
      notes: z.string().nullable().optional(),
      tags: z.array(z.string()).optional(),
    },
    async ({ id, ...fields }, extra) => {
      const supabase = getUserClient(extra.authInfo as AuthInfo);
      // Build update payload (only provided keys)
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
      const text = `Client updated: "${c.name}"${c.company ? ` (${c.company})` : ""} | id: ${c.id}`;
      return { content: [{ type: "text" as const, text }] };
    }
  );

  server.tool(
    "delete_client",
    "Delete a client by id (cascades to projects and sessions via DB constraints)",
    { id: z.string().uuid() },
    async ({ id }, extra) => {
      const supabase = getUserClient(extra.authInfo as AuthInfo);
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return { content: [{ type: "text" as const, text: `Client ${id} deleted.` }] };
    }
  );

  // ------------------------------------------------------------------ 9 (Projects — CRUD)
  server.tool(
    "create_project",
    "Create a new project linked to a client",
    {
      name: z.string().min(1),
      clientId: z.string().uuid(),
      billingType: z.enum(["hourly", "fixed"]).optional().default("hourly"),
      rate: z.number().nonnegative().optional(),
      status: z.string().optional().default("active"),
    },
    async ({ name, clientId, billingType, rate, status }, extra) => {
      const supabase = getUserClient(extra.authInfo as AuthInfo);
      const userId = (extra.authInfo as AuthInfo).extra?.userId as string;
      const billing = billingType ?? "hourly";
      const { data, error } = await supabase
        .from("projects")
        .insert({
          user_id: userId,
          client_id: clientId,
          name,
          billing_type: billing,
          rate: billing === "hourly" ? (rate ?? null) : null,
          fixed_budget: billing === "fixed" ? (rate ?? null) : null,
          status: (status ?? "active") as Project["status"],
        })
        .select("id, name, billing_type, rate, fixed_budget, status")
        .single();
      if (error) throw new Error(error.message);
      type ProjRow = Pick<Project, "id" | "name" | "billing_type" | "rate" | "fixed_budget" | "status">;
      const p = data as ProjRow;
      const rateLabel =
        p.billing_type === "hourly"
          ? `$${p.rate ?? 0}/hr`
          : `$${p.fixed_budget ?? 0} fixed`;
      const text = `Project created: "${p.name}" | ${p.billing_type} ${rateLabel} | status: ${p.status} | id: ${p.id}`;
      return { content: [{ type: "text" as const, text }] };
    }
  );

  server.tool(
    "update_project",
    "Update an existing project by id (pass only the fields to change)",
    {
      id: z.string().uuid(),
      name: z.string().min(1).optional(),
      billingType: z.enum(["hourly", "fixed"]).optional(),
      rate: z.number().nonnegative().nullable().optional(),
      fixedBudget: z.number().nonnegative().nullable().optional(),
      status: z.string().optional(),
    },
    async ({ id, name, billingType, rate, fixedBudget, status }, extra) => {
      const supabase = getUserClient(extra.authInfo as AuthInfo);
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
      const rateLabel =
        p.billing_type === "hourly"
          ? `$${p.rate ?? 0}/hr`
          : `$${p.fixed_budget ?? 0} fixed`;
      const text = `Project updated: "${p.name}" | ${p.billing_type} ${rateLabel} | status: ${p.status} | id: ${p.id}`;
      return { content: [{ type: "text" as const, text }] };
    }
  );

  server.tool(
    "delete_project",
    "Delete a project by id",
    { id: z.string().uuid() },
    async ({ id }, extra) => {
      const supabase = getUserClient(extra.authInfo as AuthInfo);
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return { content: [{ type: "text" as const, text: `Project ${id} deleted.` }] };
    }
  );

  // ------------------------------------------------------------------ 10 (Sessions — update + delete)
  server.tool(
    "update_session",
    "Update an existing time-entry session by id (pass only the fields to change)",
    {
      id: z.string().uuid(),
      name: z.string().min(1).optional(),
      startedAt: z.string().optional(),
      durationMinutes: z.number().positive().optional(),
      paymentStatus: z.enum(["paid", "unpaid"]).optional(),
      projectId: z.string().uuid().nullable().optional(),
      rate: z.number().nonnegative().nullable().optional(),
    },
    async ({ id, name, startedAt, durationMinutes, paymentStatus, projectId, rate }, extra) => {
      const supabase = getUserClient(extra.authInfo as AuthInfo);
      const payload: Record<string, unknown> = {};
      if (name !== undefined) payload.name = name;
      if (startedAt !== undefined) payload.started_at = startedAt;
      if (durationMinutes !== undefined)
        payload.duration_seconds = Math.round(durationMinutes * 60);
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
      const text = `Session updated: "${s.name ?? "Untitled"}" | ${hours}h on ${date} | ${s.payment_status} | id: ${s.id}`;
      return { content: [{ type: "text" as const, text }] };
    }
  );

  server.tool(
    "delete_session",
    "Delete a time-entry session by id",
    { id: z.string().uuid() },
    async ({ id }, extra) => {
      const supabase = getUserClient(extra.authInfo as AuthInfo);
      const { error } = await supabase.from("sessions").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return { content: [{ type: "text" as const, text: `Session ${id} deleted.` }] };
    }
  );

  // ------------------------------------------------------------------ 11 (Invoices — list + update + delete)
  server.tool(
    "list_invoices",
    "List invoices with optional status filter, including client name and totals",
    {
      status: z
        .enum(["draft", "sent", "paid", "overdue"])
        .optional(),
    },
    async ({ status }, extra) => {
      const supabase = getUserClient(extra.authInfo as AuthInfo);
      let query = supabase
        .from("invoices")
        .select(
          "id, invoice_number, total, currency, status, due_date, created_at, clients(name)"
        )
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
      if (rows.length === 0) {
        return { content: [{ type: "text" as const, text: "No invoices found." }] };
      }
      const text = rows
        .map((inv) => {
          const clientName = Array.isArray(inv.clients)
            ? inv.clients[0]?.name ?? "—"
            : (inv.clients as { name: string } | null)?.name ?? "—";
          const due = inv.due_date ? ` due: ${inv.due_date}` : "";
          return `• ${inv.invoice_number} | ${clientName} | $${inv.total.toFixed(2)} ${inv.currency} | ${inv.status}${due} | id: ${inv.id}`;
        })
        .join("\n");
      return { content: [{ type: "text" as const, text }] };
    }
  );

  server.tool(
    "update_invoice",
    "Update an invoice status, due date, or notes. Setting status to 'sent' records sent_at; 'paid' records paid_at.",
    {
      id: z.string().uuid(),
      status: z.enum(["draft", "sent", "paid"]).optional(),
      dueDate: z.string().nullable().optional(),
      notes: z.string().nullable().optional(),
    },
    async ({ id, status, dueDate, notes }, extra) => {
      const supabase = getUserClient(extra.authInfo as AuthInfo);
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
      const text = `Invoice ${inv.invoice_number} updated | status: ${inv.status} | total: $${inv.total.toFixed(2)} ${inv.currency} | id: ${inv.id}`;
      return { content: [{ type: "text" as const, text }] };
    }
  );

  server.tool(
    "delete_invoice",
    "Delete an invoice and all its line items by id",
    { id: z.string().uuid() },
    async ({ id }, extra) => {
      const supabase = getUserClient(extra.authInfo as AuthInfo);
      // Delete line items first to respect FK constraints
      const { error: itemsErr } = await supabase
        .from("invoice_items")
        .delete()
        .eq("invoice_id", id);
      if (itemsErr) throw new Error(itemsErr.message);
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return { content: [{ type: "text" as const, text: `Invoice ${id} and its line items deleted.` }] };
    }
  );

  // ------------------------------------------------------------------ 7 (original — shifted comment, no code change)
  server.tool(
    "create_invoice",
    "Create a draft invoice for a client from their unbilled sessions",
    {
      clientId: z.string().uuid(),
      sessionIds: z.array(z.string().uuid()).optional(),
      taxRate: z.number().min(0).max(100).optional().default(0),
    },
    async ({ clientId, sessionIds, taxRate }, extra) => {
      const supabase = getUserClient(extra.authInfo as AuthInfo);
      const tax = taxRate ?? 0;

      // Fetch sessions
      let sessQuery = supabase
        .from("sessions")
        .select("*")
        .eq("client_id", clientId);
      if (sessionIds && sessionIds.length > 0) {
        sessQuery = sessQuery.in("id", sessionIds);
      }

      const [sessRes, billedRes, invRes, settRes] = await Promise.all([
        sessQuery,
        supabase
          .from("invoice_items")
          .select("session_id")
          .not("session_id", "is", null),
        supabase.from("invoices").select("invoice_number"),
        supabase.from("user_settings").select("default_currency").single(),
      ]);

      if (sessRes.error) throw new Error(sessRes.error.message);

      const billedSet = new Set(
        ((billedRes.data ?? []) as { session_id: string | null }[])
          .map((r) => r.session_id)
          .filter((id): id is string => id !== null)
      );

      // If no explicit sessionIds, find all unbilled
      const candidateSessions = sessionIds && sessionIds.length > 0
        ? (sessRes.data as Session[]) ?? []
        : unbilledSessions(
            (sessRes.data as Session[]) ?? [],
            clientId,
            billedSet
          );

      if (candidateSessions.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: "No sessions available to invoice for this client.",
            },
          ],
        };
      }

      const items = candidateSessions.map(sessionToInvoiceItem);
      const totals = computeInvoiceTotals(items, tax);
      // Build minimal Invoice[] shape needed by nextInvoiceNumber
      const existingInvoices = (
        (invRes.data ?? []) as { invoice_number: string }[]
      ).map((r) => ({ invoice_number: r.invoice_number } as Invoice));
      const invoiceNumber = nextInvoiceNumber(existingInvoices);
      const currency =
        (settRes.data as Pick<UserSettings, "default_currency"> | null)
          ?.default_currency ?? "USD";

      // Insert invoice
      const { data: invoice, error: invErr } = await supabase
        .from("invoices")
        .insert({
          user_id: (extra.authInfo as AuthInfo).extra?.userId as string,
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

      // Insert invoice items
      const inv = invoice as Pick<Invoice, "id" | "invoice_number" | "total">;
      const invoiceItems = items.map((item) => ({
        ...item,
        invoice_id: inv.id,
      }));
      const { error: itemsErr } = await supabase
        .from("invoice_items")
        .insert(invoiceItems);
      if (itemsErr) throw new Error(itemsErr.message);

      const text = `Invoice ${inv.invoice_number} created (draft) | id: ${inv.id}\n  Items: ${items.length}\n  Subtotal: $${totals.subtotal.toFixed(2)}\n  Tax (${tax}%): $${totals.tax_amount.toFixed(2)}\n  Total: $${totals.total.toFixed(2)} ${currency}`;
      return { content: [{ type: "text" as const, text }] };
    }
  );
}

const mcpHandler = createMcpHandler(
  initServer,
  { serverInfo: { name: "logr-mcp", version: "1.0.0" } },
  { basePath: "/", sessionIdGenerator: undefined }
);

/**
 * Wrap with Bearer token auth.
 *
 * - required: true        → unauthenticated requests get a 401
 * - resourceMetadataPath  → the WWW-Authenticate challenge on 401 includes
 *     resource_metadata="<origin>/.well-known/oauth-protected-resource"
 *     so MCP clients supporting RFC 9728 can auto-discover the AS.
 *     mcp-handler derives the origin from the incoming request's host, which
 *     is correct on Vercel (the host header is logr.work in production).
 */
const handler = withMcpAuth(mcpHandler, verifyToken, {
  required: true,
  resourceMetadataPath: "/.well-known/oauth-protected-resource",
});

export { handler as GET, handler as POST };
