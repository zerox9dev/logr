"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/field";
import { useToast } from "@/components/ui/toast";
import { useAppData } from "@/contexts/data-context";
import { useT } from "@/i18n";
import type { UserSettings } from "@/types/database";

const numOrNull = (value: string) => {
  if (value.trim() === "") return null;
  const n = Number(value);
  return isNaN(n) || n < 0 ? null : n;
};

const strOrNull = (value: string) => (value.trim() === "" ? null : value.trim());

/** Mounted once the settings row has loaded so the inputs start filled. */
function SettingsFields({ settings }: { settings: UserSettings | null }) {
  const { updateSettings } = useAppData();
  const { toast } = useToast();
  const t = useT();
  const [fullName, setFullName] = useState(settings?.full_name ?? "");
  const [company, setCompany] = useState(settings?.company ?? "");
  const [email, setEmail] = useState(settings?.email ?? "");
  const [phone, setPhone] = useState(settings?.phone ?? "");
  const [address, setAddress] = useState(settings?.address ?? "");
  const [currency, setCurrency] = useState(settings?.default_currency ?? "USD");
  const [rate, setRate] = useState(settings?.default_rate != null ? String(settings.default_rate) : "");
  const [goal, setGoal] = useState(settings?.weekly_goal_hours != null ? String(settings.weekly_goal_hours) : "");
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await updateSettings({
        full_name: strOrNull(fullName),
        company: strOrNull(company),
        email: strOrNull(email),
        phone: strOrNull(phone),
        address: strOrNull(address),
        default_currency: currency.trim() || "USD",
        default_rate: numOrNull(rate),
        weekly_goal_hours: numOrNull(goal),
      });
      toast(t("settings.saved"), "success");
    } catch {
      toast(t("settings.saveFailed"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="text-md font-semibold text-heading">{t("settings.profile")}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t("settings.fullName")}>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </Field>
          <Field label={t("settings.company")}>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} />
          </Field>
          <Field label={t("settings.email")}>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label={t("settings.phone")}>
            <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label={t("settings.address")}>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </Field>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-md font-semibold text-heading">{t("settings.billingDefaults")}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t("settings.currency")}>
            <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="USD" />
          </Field>
          <Field label={t("settings.defaultRate")}>
            <Input type="number" min="0" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="0" />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-md font-semibold text-heading">{t("goals.title")}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t("goals.weeklyGoalHours")}>
            <Input type="number" min="0" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="40" />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-md font-semibold text-heading">{t("integrations.title")}</h2>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-md text-muted-foreground">{t("settings.integrationsHint")}</p>
          <Button asChild type="button" variant="outline">
            <Link href="/app/settings/integrations">{t("settings.manageIntegrations")}</Link>
          </Button>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? t("settings.saving") : t("settings.saveSettings")}
        </Button>
      </div>
    </form>
  );
}

/** Settings page body: the whole user_settings row in one form — the same
 *  fields the rates and goal dialogs edit one at a time. */
export function SettingsForm() {
  const { settings, loading } = useAppData();
  const t = useT();

  return (
    <div className="min-w-0 flex-1 overflow-x-hidden bg-page px-4 py-4 lg:px-2">
      <div className="card-radius flex min-w-0 flex-col border border-line bg-card p-6">
        <h1 className="mb-4 text-widget font-semibold text-heading">{t("sidebar.settings")}</h1>
        {loading ? (
          <p className="py-8 text-center text-base text-muted-foreground">{t("common.loading")}</p>
        ) : (
          <SettingsFields settings={settings} />
        )}
      </div>
    </div>
  );
}
