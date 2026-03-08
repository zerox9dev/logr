import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppData } from "@/lib/data-context";
import { useAuth } from "@/lib/auth-context";
import { t } from "@/lib/i18n";
import sh from "@/components/shared.module.css";

export function SettingsPage() {
  const { settings, updateSettings } = useAppData();
  const { signOut, user } = useAuth();
  const [fullName, setFullName] = useState(settings?.full_name || "");
  const [company, setCompany] = useState(settings?.company || "");
  const [email, setEmail] = useState(settings?.email || "");
  const [phone, setPhone] = useState(settings?.phone || "");
  const [address, setAddress] = useState(settings?.address || "");
  const [currency, setCurrency] = useState(settings?.default_currency || "USD");
  const [rate, setRate] = useState(settings?.default_rate?.toString() || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateSettings({ full_name: fullName || null, company: company || null, email: email || null, phone: phone || null, address: address || null, default_currency: currency, default_rate: rate ? Number(rate) : null });
    setSaving(false);
  };

  return (
    <div className={sh.page}>
      <h1 className={sh.title}>{t("settings.title")}</h1>
      <Card><CardHeader><CardTitle>{t("settings.profile")}</CardTitle></CardHeader>
        <CardContent className={sh.formGrid}>
          <div className={sh.formRow2}>
            <div className={sh.formField}><label className={sh.formLabel}>{t("settings.fullName")}</label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
            <div className={sh.formField}><label className={sh.formLabel}>{t("settings.company")}</label><Input value={company} onChange={(e) => setCompany(e.target.value)} /></div>
          </div>
          <div className={sh.formRow2}>
            <div className={sh.formField}><label className={sh.formLabel}>{t("settings.email")}</label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className={sh.formField}><label className={sh.formLabel}>{t("settings.phone")}</label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          </div>
          <div className={sh.formField}><label className={sh.formLabel}>{t("settings.address")}</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className={sh.formTextarea} /></div>
        </CardContent>
      </Card>
      <Card><CardHeader><CardTitle>{t("settings.billingDefaults")}</CardTitle></CardHeader>
        <CardContent className={sh.formGrid}>
          <div className={sh.formRow2}>
            <div className={sh.formField}><label className={sh.formLabel}>{t("settings.currency")}</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={sh.formSelect}>
                <option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option><option value="UAH">UAH (₴)</option><option value="PLN">PLN (zł)</option>
              </select></div>
            <div className={sh.formField}><label className={sh.formLabel}>{t("settings.defaultRate")}</label><Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="50" /></div>
          </div>
        </CardContent>
      </Card>
      <div className={sh.header}>
        <Button onClick={handleSave} disabled={saving}>{saving ? t("settings.saving") : t("settings.saveSettings")}</Button>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{user?.email}</span>
          <Button variant="outline" onClick={signOut}>{t("settings.signOut")}</Button>
        </div>
      </div>
    </div>
  );
}
