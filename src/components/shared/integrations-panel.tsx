"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ClientPicker } from "@/components/shared/client-picker";
import { ProjectPicker } from "@/components/shared/project-picker";
import { useAppData } from "@/contexts/data-context";
import { useT, useLang } from "@/i18n";
import { jiraApi } from "@/actions";
import type { JiraProjectOption } from "@/domain/jira-sync";
import type { JiraConnectionSummary, JiraProjectMapping } from "@/types/database";

const ERROR_KEYS: Record<string, string> = {
  jira_denied: "integrations.errorDenied",
  jira_failed: "integrations.errorFailed",
  jira_unavailable: "integrations.errorUnavailable",
};

/** One Jira project and where its worklogs land. A client alone books the time
 *  against a project named after the Jira one, a project implies its own
 *  client, and clearing both drops the mapping. */
function MappingRow({
  option,
  mapping,
  onSave,
}: {
  option: JiraProjectOption;
  mapping: JiraProjectMapping | undefined;
  onSave: (next: { client_id: string | null; project_id: string | null }) => void;
}) {
  const { clients, projects, getClientById, getProjectById } = useAppData();
  const t = useT();

  const clientId = mapping?.client_id ?? null;
  const projectId = mapping?.project_id ?? null;
  const clientName = getClientById(clientId)?.name ?? t("integrations.noClient");
  // With a client but no project, the sync books time against a project named
  // after the Jira one, so promising that is only honest once a client is set.
  const projectName =
    getProjectById(projectId)?.name ??
    t(clientId ? "integrations.autoProject" : "integrations.noProject");

  return (
    <div className="grid grid-cols-1 items-center gap-2 border-b border-line py-3 last:border-b-0 sm:grid-cols-3">
      <div className="min-w-0">
        <span className="block truncate text-md text-ink">{option.name}</span>
        <span className="block text-md-minus text-muted-foreground">{option.key}</span>
      </div>
      <div className="flex min-w-0 items-center gap-1">
        <ClientPicker
          clients={clients}
          onChange={(id) => onSave({ client_id: id, project_id: projectId })}
          trigger={
            <Button type="button" variant="outline" className="min-w-0 flex-1 justify-between">
              <span className={`line-clamp-1 min-w-0 ${clientId ? "text-ink" : "text-muted-foreground"}`}>
                {clientName}
              </span>
              <span aria-hidden="true" className="shrink-0 text-muted-foreground">▾</span>
            </Button>
          }
        />
        {clientId && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t("integrations.clearClient")}
            onClick={() => onSave({ client_id: null, project_id: projectId })}
          >
            <X />
          </Button>
        )}
      </div>
      <ProjectPicker
        projects={projects}
        onChange={(id) => onSave({ client_id: clientId, project_id: id })}
        trigger={
          <Button type="button" variant="outline" className="w-full justify-between">
            <span className={`line-clamp-1 min-w-0 ${projectId ? "text-ink" : "text-muted-foreground"}`}>
              {projectName}
            </span>
            <span aria-hidden="true" className="shrink-0 text-muted-foreground">▾</span>
          </Button>
        }
      />
    </div>
  );
}

/** Integrations page body: the Jira Cloud connection, and — once connected —
 *  which Jira project each worklog should be logged under. */
export function IntegrationsPanel() {
  const { reload } = useAppData();
  const { toast } = useToast();
  const t = useT();
  const { lang } = useLang();
  const params = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [connection, setConnection] = useState<JiraConnectionSummary | null>(null);
  const [mappings, setMappings] = useState<JiraProjectMapping[]>([]);
  const [jiraProjects, setJiraProjects] = useState<JiraProjectOption[]>([]);
  const [projectsError, setProjectsError] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [summary, isConfigured] = await Promise.all([
        jiraApi.getConnection(),
        jiraApi.isConfigured(),
      ]);
      setConfigured(isConfigured);
      setConnection(summary);
      if (!summary) {
        setMappings([]);
        setJiraProjects([]);
        return;
      }
      setMappings(await jiraApi.listMappings());
      try {
        setJiraProjects(await jiraApi.listJiraProjects());
        setProjectsError(false);
      } catch {
        setProjectsError(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch-on-mount: `load` syncs loading state around a Server Action call,
    // the same external-data sync `use-data.ts` does.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const error = params.get("error");
  const errorKey = error ? ERROR_KEYS[error] : undefined;

  const saveMapping = async (
    option: JiraProjectOption,
    next: { client_id: string | null; project_id: string | null },
  ) => {
    try {
      const saved = await jiraApi.saveMapping({
        jira_project_key: option.key,
        jira_project_name: option.name,
        client_id: next.client_id,
        project_id: next.project_id,
      });
      setMappings((current) => {
        const rest = current.filter((m) => m.jira_project_key !== option.key);
        return saved ? [...rest, saved] : rest;
      });
      toast(t("integrations.mappingSaved"), "success");
    } catch {
      toast(t("integrations.mappingFailed"), "error");
    }
  };

  const sync = async () => {
    setSyncing(true);
    try {
      const summary = await jiraApi.triggerSync();
      toast(
        `${t("integrations.imported")}: ${summary.imported} · ${t("integrations.skippedUnmapped")}: ${summary.skippedUnmapped} · ${t("integrations.skippedDuplicate")}: ${summary.skippedDuplicate}`,
        "success",
      );
      setConnection(await jiraApi.getConnection());
      await reload();
    } catch {
      toast(t("integrations.syncFailed"), "error");
    } finally {
      setSyncing(false);
    }
  };

  const disconnect = async () => {
    try {
      await jiraApi.disconnect();
      await load();
      toast(t("integrations.disconnected"), "success");
    } catch {
      toast(t("integrations.disconnectFailed"), "error");
    }
  };

  // With Jira unreachable, the projects already mapped still list — an
  // existing mapping stays editable instead of vanishing with the API call.
  const options: JiraProjectOption[] = jiraProjects.length
    ? jiraProjects
    : mappings.map((m) => ({ key: m.jira_project_key, name: m.jira_project_name ?? m.jira_project_key }));

  const lastSynced = connection?.lastSyncedAt
    ? new Date(connection.lastSyncedAt).toLocaleString(lang)
    : t("integrations.never");

  return (
    <div className="min-w-0 flex-1 overflow-x-hidden bg-page px-4 py-4 lg:px-2">
      <div className="card-radius flex min-w-0 flex-col border border-line bg-card p-6">
        <h1 className="mb-1 text-widget font-semibold text-heading">{t("integrations.title")}</h1>
        <p className="mb-4 text-base text-muted-foreground">{t("integrations.jiraDesc")}</p>

        {errorKey && (
          <p className="mb-4 border border-line bg-wash p-3 text-md text-destructive">{t(errorKey)}</p>
        )}

        {loading ? (
          <p className="py-8 text-center text-base text-muted-foreground">{t("common.loading")}</p>
        ) : !configured ? (
          <p className="py-4 text-md text-muted-foreground">{t("integrations.notConfigured")}</p>
        ) : !connection ? (
          <div className="flex flex-col items-start gap-3">
            <p className="text-md text-muted-foreground">{t("integrations.notConnected")}</p>
            <Button asChild>
              <a href="/auth/jira">{t("integrations.connect")}</a>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-md text-ink">
                  {connection.atlassianEmail ?? t("integrations.connectedAccount")}
                </span>
                <span className="text-md-minus text-muted-foreground">
                  {connection.siteName ?? connection.siteUrl ?? ""}
                </span>
                <span className="text-md-minus text-muted-foreground">
                  {t("integrations.lastSynced")}: {lastSynced}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={sync} disabled={syncing}>
                  {syncing ? t("integrations.syncing") : t("integrations.syncNow")}
                </Button>
                <Button type="button" variant="outline" onClick={disconnect}>
                  {t("integrations.disconnect")}
                </Button>
              </div>
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="text-md font-semibold text-heading">{t("integrations.mappings")}</h2>
              <p className="text-md-minus text-muted-foreground">{t("integrations.mappingsHint")}</p>
              {projectsError && (
                <p className="text-md text-muted-foreground">{t("integrations.projectsFailed")}</p>
              )}
              {options.length === 0 ? (
                <p className="py-4 text-md text-muted-foreground">{t("integrations.noJiraProjects")}</p>
              ) : (
                <div className="flex flex-col">
                  {options.map((option) => (
                    <MappingRow
                      key={option.key}
                      option={option}
                      mapping={mappings.find((m) => m.jira_project_key === option.key)}
                      onSave={(next) => void saveMapping(option, next)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
