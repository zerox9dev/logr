import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useAppData } from "@/lib/data-context";
import { useT } from "@/lib/i18n";
import type { SessionInsert } from "@/types/database";

// ── CSV parser ────────────────────────────────────────────────────────────────
// Handles: UTF-8 BOM, CRLF + LF, double-quoted fields, embedded commas,
// escaped quotes (""), and trailing newlines.

function parseCsv(raw: string): Record<string, string>[] {
  // Strip leading UTF-8 BOM if present
  const text = raw.startsWith("﻿") ? raw.slice(1) : raw;
  // Normalise line endings
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const records: Record<string, string>[] = [];
  let pos = 0;
  const len = lines.length;

  function parseField(): string {
    if (pos < len && lines[pos] === '"') {
      // Quoted field
      pos++; // skip opening quote
      let value = "";
      while (pos < len) {
        const ch = lines[pos];
        if (ch === '"') {
          pos++;
          if (pos < len && lines[pos] === '"') {
            // Escaped quote
            value += '"';
            pos++;
          } else {
            break; // closing quote
          }
        } else {
          value += ch;
          pos++;
        }
      }
      return value;
    }
    // Unquoted field — read until comma or newline
    let value = "";
    while (pos < len && lines[pos] !== "," && lines[pos] !== "\n") {
      value += lines[pos++];
    }
    return value;
  }

  function parseLine(): string[] | null {
    if (pos >= len) return null;
    const fields: string[] = [];
    while (true) {
      fields.push(parseField());
      if (pos >= len || lines[pos] === "\n") {
        if (pos < len) pos++; // consume newline
        break;
      }
      if (lines[pos] === ",") {
        pos++; // consume comma, then parse next field
      }
    }
    return fields;
  }

  // Parse header row
  const headerFields = parseLine();
  if (!headerFields) return records;
  const headers = headerFields.map((h) => h.trim());

  // Parse data rows
  while (pos < len) {
    // Skip blank lines
    if (lines[pos] === "\n") { pos++; continue; }
    const fields = parseLine();
    if (!fields) break;
    // Skip entirely empty rows
    if (fields.length === 1 && fields[0] === "") continue;
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = fields[i] ?? ""; });
    records.push(row);
  }

  return records;
}

// ── Duration parser ───────────────────────────────────────────────────────────

function parseDuration(hms: string): number {
  const parts = hms.trim().split(":").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return 0;
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

// ── Import logic ──────────────────────────────────────────────────────────────

interface ImportResult {
  sessions: number;
  clients: number;
  projects: number;
  skipped: number;
  duplicates: number;
}

export function ImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { clients, projects, sessions, settings, addClient, addProject, addSessionsBulk } = useAppData();
  const { toast } = useToast();
  const t = useT();

  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  function reset() {
    setFileName(null);
    setFile(null);
    setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setFileName(f?.name ?? null);
    setResult(null);
  }

  async function handleImport() {
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      const rows = parseCsv(text);

      // Build case-insensitive lookup maps from existing data
      const clientByName = new Map<string, string>(); // lower → id
      for (const c of clients) clientByName.set(c.name.toLowerCase(), c.id);

      const projectByKey = new Map<string, string>(); // `${clientId}::${nameLower}` → id
      for (const p of projects) projectByKey.set(`${p.client_id}::${p.name.toLowerCase()}`, p.id);

      // Build dedup set from existing sessions: `started_at|duration_seconds|name`
      const existingKeys = new Set<string>();
      for (const s of sessions) {
        existingKeys.add(`${s.started_at}|${s.duration_seconds}|${s.name}`);
      }

      let newClients = 0;
      let newProjects = 0;
      let skipped = 0;
      let duplicates = 0;
      const sessionInserts: Omit<SessionInsert, "user_id">[] = [];

      const defaultRate = settings?.default_rate ?? null;

      for (const row of rows) {
        const startDate = (row["Start date"] ?? "").trim();
        const startTime = (row["Start time"] ?? "").trim();
        const durRaw = (row["Duration"] ?? "").trim();
        const durationSeconds = parseDuration(durRaw);

        // Skip rows with missing start date/time or zero/unparseable duration
        if (!startDate || !startTime || durationSeconds <= 0) {
          skipped++;
          continue;
        }

        const startedAt = new Date(`${startDate}T${startTime}`).toISOString();
        const description = (row["Description"] ?? "").trim();
        const name = description || t("import.noDescription");

        // Dedup check: skip if this exact session already exists (or was already
        // accepted earlier in this same batch)
        const dedupKey = `${startedAt}|${durationSeconds}|${name}`;
        if (existingKeys.has(dedupKey)) {
          duplicates++;
          continue;
        }
        existingKeys.add(dedupKey);

        const clientName = (row["Client"] ?? "").trim();
        const projectName = (row["Project"] ?? "").trim();
        const billable = (row["Billable"] ?? "").trim() === "Yes";
        const tagArr = (row["Tags"] ?? "").split(",").map((s) => s.trim()).filter(Boolean);

        const rate = billable ? (defaultRate ?? 0) : 0;

        // ── Client resolution ──
        let clientId: string | null = null;
        if (clientName) {
          const key = clientName.toLowerCase();
          if (clientByName.has(key)) {
            clientId = clientByName.get(key)!;
          } else {
            const created = await addClient({
              name: clientName,
              email: null,
              phone: null,
              company: null,
              address: null,
              country: null,
              website: null,
              notes: null,
              tags: [],
            });
            clientByName.set(key, created.id);
            clientId = created.id;
            newClients++;
          }
        }

        // ── Project resolution ──
        let projectId: string | null = null;
        if (projectName && clientId !== null) {
          const mapKey = `${clientId}::${projectName.toLowerCase()}`;
          if (projectByKey.has(mapKey)) {
            projectId = projectByKey.get(mapKey)!;
          } else {
            const created = await addProject({
              client_id: clientId,
              name: projectName,
              billing_type: "hourly",
              rate: defaultRate ?? null,
              fixed_budget: null,
              status: "active",
            });
            projectByKey.set(mapKey, created.id);
            projectId = created.id;
            newProjects++;
          }
        }
        // If project name exists but no client → project_id stays null (by design)

        sessionInserts.push({
          client_id: clientId,
          project_id: projectId,
          name,
          notes: null,
          tags: tagArr,
          started_at: startedAt,
          duration_seconds: durationSeconds,
          rate,
          billing_type: "hourly",
          payment_status: "unpaid",
        });
      }

      if (sessionInserts.length > 0) {
        await addSessionsBulk(sessionInserts);
      }

      const res: ImportResult = {
        sessions: sessionInserts.length,
        clients: newClients,
        projects: newProjects,
        skipped,
        duplicates,
      };
      setResult(res);

      const msg = [
        t("import.successSessions").replace("{n}", String(res.sessions)),
        res.clients > 0 ? t("import.successClients").replace("{k}", String(res.clients)) : null,
        res.projects > 0 ? t("import.successProjects").replace("{m}", String(res.projects)) : null,
        res.skipped > 0 ? t("import.successSkipped").replace("{s}", String(res.skipped)) : null,
        res.duplicates > 0 ? t("import.successDuplicates").replace("{d}", String(res.duplicates)) : null,
      ].filter(Boolean).join(", ");

      toast(msg, "success");
    } catch (err) {
      console.error("Toggl import error:", err);
      toast(t("import.importFailed"), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} title={t("import.dialogTitle")}>
      <div className="flex flex-col gap-4">
        {/* Hint lines */}
        <div className="flex flex-col gap-1">
          <p className="text-md-minus text-muted">{t("import.hint")}</p>
          <p className="text-md-minus text-muted">{t("import.hintDuplicate")}</p>
          <p className="text-md-minus text-muted">{t("import.hintRate")}</p>
        </div>

        {/* File picker */}
        <label className="flex flex-col gap-1.5">
          <span className="text-md-minus text-muted">{t("import.chooseFile")}</span>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="border border-line bg-card px-3 py-2 text-md text-ink file:mr-3 file:border-0 file:bg-wash file:px-2 file:py-1 file:text-sm file:font-medium file:text-ink focus:outline-none focus:ring-1 focus:ring-line"
          />
          {fileName && (
            <span className="text-md-minus text-muted tnum">{fileName}</span>
          )}
        </label>

        {/* Result summary */}
        {result !== null && (
          <div className="border border-line bg-wash px-3 py-2.5">
            <p className="text-md font-medium text-heading">
              {t("import.successSessions").replace("{n}", String(result.sessions))}
              {result.clients > 0 && <span className="font-normal text-muted">{", "}{t("import.successClients").replace("{k}", String(result.clients))}</span>}
              {result.projects > 0 && <span className="font-normal text-muted">{", "}{t("import.successProjects").replace("{m}", String(result.projects))}</span>}
              {result.skipped > 0 && <span className="font-normal text-muted">{", "}{t("import.successSkipped").replace("{s}", String(result.skipped))}</span>}
              {result.duplicates > 0 && <span className="font-normal text-muted">{", "}{t("import.successDuplicates").replace("{d}", String(result.duplicates))}</span>}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={handleClose}>
            {t("new.cancel")}
          </Button>
          <Button
            type="button"
            disabled={!file || busy}
            onClick={() => { void handleImport(); }}
          >
            {busy ? t("import.importing") : t("import.import")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
