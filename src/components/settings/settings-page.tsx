import { useState } from "react";
import { Save, Download, Trash2, User, Receipt, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Settings, Currency } from "@/types";

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "GBP", label: "British Pound", symbol: "£" },
  { value: "UAH", label: "Ukrainian Hryvnia", symbol: "₴" },
  { value: "PLN", label: "Polish Zloty", symbol: "zł" },
];

interface SettingsPageProps {
  settings: Settings;
  onUpdate: (data: Partial<Settings>) => void;
  onExportData: () => void;
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

export function SettingsPage({ settings, onUpdate, onExportData, onClearData }: SettingsPageProps) {
  const [form, setForm] = useState<Settings>({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdate(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const hasChanges =
    form.name !== settings.name ||
    form.email !== settings.email ||
    form.company !== settings.company ||
    form.address !== settings.address ||
    form.defaultRate !== settings.defaultRate ||
    form.currency !== settings.currency ||
    form.invoicePrefix !== settings.invoicePrefix ||
    form.paymentTermsDays !== settings.paymentTermsDays ||
    form.invoiceNotes !== settings.invoiceNotes;

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
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-4 w-4" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Full Name">
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="John Doe"
              />
            </FieldGroup>
            <FieldGroup label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="john@example.com"
              />
            </FieldGroup>
          </div>
          <FieldGroup label="Company / Business Name">
            <Input
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              placeholder="Acme Inc."
            />
          </FieldGroup>
          <FieldGroup label="Address">
            <textarea
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="Street, City, Country"
              rows={2}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Billing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Billing Defaults
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Default Hourly Rate">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {CURRENCIES.find((c) => c.value === form.currency)?.symbol || "$"}
                </span>
                <Input
                  type="number"
                  value={form.defaultRate || ""}
                  onChange={(e) => setForm((f) => ({ ...f, defaultRate: Number(e.target.value) }))}
                  className="pl-7"
                  placeholder="50"
                />
              </div>
            </FieldGroup>
            <FieldGroup label="Currency">
              <select
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value as Currency }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.symbol} {c.label}
                  </option>
                ))}
              </select>
            </FieldGroup>
          </div>
        </CardContent>
      </Card>

      {/* Invoice */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="h-4 w-4" /> Invoice Defaults
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Invoice Number Prefix">
              <Input
                value={form.invoicePrefix}
                onChange={(e) => setForm((f) => ({ ...f, invoicePrefix: e.target.value }))}
                placeholder="INV"
              />
            </FieldGroup>
            <FieldGroup label="Payment Terms (days)">
              <Input
                type="number"
                value={form.paymentTermsDays || ""}
                onChange={(e) => setForm((f) => ({ ...f, paymentTermsDays: Number(e.target.value) }))}
                placeholder="30"
              />
            </FieldGroup>
          </div>
          <FieldGroup label="Default Invoice Notes">
            <textarea
              value={form.invoiceNotes}
              onChange={(e) => setForm((f) => ({ ...f, invoiceNotes: e.target.value }))}
              placeholder="Payment is due within 30 days. Thank you for your business!"
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button variant="outline" onClick={onExportData}>
            <Download className="h-4 w-4" /> Export JSON
          </Button>
          <Button variant="destructive" onClick={onClearData}>
            <Trash2 className="h-4 w-4" /> Clear All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
