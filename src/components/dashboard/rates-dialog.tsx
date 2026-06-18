import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useAppData } from "@/contexts/data-context";
import { useT } from "@/i18n";
import type { BillingType, Project } from "@/types/database";

const seg = (active: boolean) =>
  `px-3 py-1.5 text-md-minus font-medium ${active ? "bg-card text-heading shadow-[0px_1px_4px_0px_rgba(0,0,0,0.08)]" : "text-dark-3"}`;

/** Rate editor for the currently-selected project (billing + rate / budget).
 *  When no project is selected, edits the user's default hourly rate.
 *  Mounted fresh per open (no reset effect). */
function RatesForm({ project, onClose }: { project: Project | undefined; onClose: () => void }) {
  const { settings, updateSettings, updateProject } = useAppData();
  const { toast } = useToast();
  const t = useT();
  const [billing, setBilling] = useState<BillingType>(project?.billing_type ?? "hourly");
  const [value, setValue] = useState(
    project
      ? String((project.billing_type === "fixed" ? project.fixed_budget : project.rate) ?? "")
      : String(settings?.default_rate ?? ""),
  );
  const [saving, setSaving] = useState(false);
  const fixed = billing === "fixed";

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const num = Number(value) || 0;
      if (project) {
        await updateProject(project.id, {
          billing_type: billing,
          rate: fixed ? null : num,
          fixed_budget: fixed ? num : null,
        });
      } else {
        await updateSettings({ default_rate: num });
      }
      toast(t("rates.updated"), "success");
      onClose();
    } catch {
      toast(t("rates.updateFailed"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {project ? (
        <>
          <div className="flex flex-col gap-1.5">
            <span className="text-md-minus text-muted-foreground">{t("rates.billing")}</span>
            <div className="flex w-fit items-start bg-wash p-1">
              <button type="button" className={seg(!fixed)} onClick={() => setBilling("hourly")}>{t("rates.hourly")}</button>
              <button type="button" className={seg(fixed)} onClick={() => setBilling("fixed")}>{t("rates.fixed")}</button>
            </div>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-md-minus text-muted-foreground">{fixed ? t("rates.budget") : t("rates.rate")}</span>
            <Input type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" autoFocus />
          </label>
        </>
      ) : (
        <label className="flex flex-col gap-1.5">
          <span className="text-md-minus text-muted-foreground">{t("rates.defaultRateField")}</span>
          <Input type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" autoFocus />
          <span className="text-sm text-muted-foreground">{t("rates.noProjectHint")}</span>
        </label>
      )}

      <div className="flex justify-end gap-2.5 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>{t("rates.cancel")}</Button>
        <Button type="submit" disabled={saving}>{t("rates.save")}</Button>
      </div>
    </form>
  );
}

export function RatesDialog({ open, onClose, project }: { open: boolean; onClose: () => void; project: Project | undefined }) {
  const t = useT();
  return (
    <Dialog open={open} onClose={onClose} title={project ? `${t("rates.ratePrefix")}${project.name}` : t("rates.defaultRate")}>
      {open && <RatesForm project={project} onClose={onClose} />}
    </Dialog>
  );
}
