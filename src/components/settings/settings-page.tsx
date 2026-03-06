import { useState, useRef } from "react";
import { Save, Download, Upload, Trash2, User, Receipt, CreditCard, Cog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Settings, Currency, DateFormat, TimeFormat, WeekStart, Project } from "@/types";

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "GBP", label: "British Pound", symbol: "£" },
  { value: "UAH", label: "Ukrainian Hryvnia", symbol: "₴" },
  { value: "PLN", label: "Polish Zloty", symbol: "zł" },
];

interface SettingsPageProps {
  settings: Settings;
  projects: Project[];
  onUpdate: (data: Partial<Settings>) => void;
  onExportData: () => void;
  onImportData: (json: string) => void;
  onClearData: () => void;
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function SelectField({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function SettingsPage({ settings, projects, onUpdate, onExportData, onImportData, onClearData }: SettingsPageProps) {
  const [form, setForm] = useState<Settings>({ ...settings });
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onUpdate(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onImportData(reader.result);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const hasChanges = JSON.stringify(form) !== JSON.stringify(settings);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Your profile and preferences.</p>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges}>
          <Save className="h-4 w-4" />
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><User className="h-4 w-4" /> Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Full Name">
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="John Doe" />
            </FieldGroup>
            <FieldGroup label="Email">
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="john@example.com" />
            </FieldGroup>
          </div>
          <FieldGroup label="Company / Business Name">
            <Input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} placeholder="Acme Inc." />
          </FieldGroup>
          <FieldGroup label="Address">
            <textarea value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Street, City, Country" rows={2}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Billing */}
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CreditCard className="h-4 w-4" /> Billing Defaults</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Default Hourly Rate">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {CURRENCIES.find((c) => c.value === form.currency)?.symbol || "$"}
                </span>
                <Input type="number" value={form.defaultRate || ""} onChange={(e) => setForm((f) => ({ ...f, defaultRate: Number(e.target.value) }))} className="pl-7" placeholder="50" />
              </div>
            </FieldGroup>
            <FieldGroup label="Currency">
              <SelectField value={form.currency} onChange={(v) => setForm((f) => ({ ...f, currency: v as Currency }))}
                options={CURRENCIES.map((c) => ({ value: c.value, label: `${c.symbol} ${c.label}` }))} />
            </FieldGroup>
          </div>
        </CardContent>
      </Card>

      {/* Invoice */}
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Receipt className="h-4 w-4" /> Invoice Defaults</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Invoice Number Prefix">
              <Input value={form.invoicePrefix} onChange={(e) => setForm((f) => ({ ...f, invoicePrefix: e.target.value }))} placeholder="INV" />
            </FieldGroup>
            <FieldGroup label="Payment Terms (days)">
              <Input type="number" value={form.paymentTermsDays || ""} onChange={(e) => setForm((f) => ({ ...f, paymentTermsDays: Number(e.target.value) }))} placeholder="30" />
            </FieldGroup>
          </div>
          <FieldGroup label="Default Invoice Notes">
            <textarea value={form.invoiceNotes} onChange={(e) => setForm((f) => ({ ...f, invoiceNotes: e.target.value }))} placeholder="Payment is due within 30 days." rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Cog className="h-4 w-4" /> Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <FieldGroup label="Date Format">
              <SelectField value={form.dateFormat} onChange={(v) => setForm((f) => ({ ...f, dateFormat: v as DateFormat }))}
                options={[
                  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
                  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
                  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
                ]} />
            </FieldGroup>
            <FieldGroup label="Time Format">
              <SelectField value={form.timeFormat} onChange={(v) => setForm((f) => ({ ...f, timeFormat: v as TimeFormat }))}
                options={[
                  { value: "24h", label: "24-hour" },
                  { value: "12h", label: "12-hour" },
                ]} />
            </FieldGroup>
            <FieldGroup label="Week Starts On">
              <SelectField value={form.weekStart} onChange={(v) => setForm((f) => ({ ...f, weekStart: v as WeekStart }))}
                options={[
                  { value: "monday", label: "Monday" },
                  { value: "sunday", label: "Sunday" },
                ]} />
            </FieldGroup>
            <FieldGroup label="Default Project">
              <SelectField value={form.defaultProjectId} onChange={(v) => setForm((f) => ({ ...f, defaultProjectId: v }))}
                options={[{ value: "", label: "None" }, ...projects.map((p) => ({ value: p.id, label: p.name }))]} />
            </FieldGroup>
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Data</CardTitle></CardHeader>
        <CardContent className="flex gap-3">
          <Button variant="outline" onClick={onExportData}>
            <Download className="h-4 w-4" /> Export JSON
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> Import JSON
          </Button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <Button variant="destructive" onClick={onClearData}>
            <Trash2 className="h-4 w-4" /> Clear All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
