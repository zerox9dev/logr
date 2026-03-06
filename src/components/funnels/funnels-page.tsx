import { useState } from "react";
import { Plus, Pencil, Trash2, ExternalLink, DollarSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppData } from "@/lib/data-context";
import type { FunnelType, FunnelStage } from "@/types/database";
import { t } from "@/lib/i18n";

const FUNNEL_TYPES: FunnelType[] = ["sales", "onboarding", "delivery", "reactivation", "job_hunting"];

export function FunnelsPage() {
  const { funnels, leads, addFunnel, deleteFunnel, addLead, updateLead, deleteLead, moveLead, getStagesForFunnel } = useAppData();
  const [activeFunnelId, setActiveFunnelId] = useState<string | null>(funnels[0]?.id || null);
  const [showCreateFunnel, setShowCreateFunnel] = useState(false);
  const [showCreateLead, setShowCreateLead] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);

  const activeFunnel = funnels.find((f) => f.id === activeFunnelId);
  const activeStages = activeFunnel ? getStagesForFunnel(activeFunnel.id) : [];
  const funnelLeads = activeFunnel ? leads.filter((l) => l.funnel_id === activeFunnel.id) : [];
  const totalValue = funnelLeads.reduce((s, l) => s + Number(l.value || 0), 0);

  if (!activeFunnel && funnels.length > 0 && activeFunnelId !== funnels[0].id) {
    setActiveFunnelId(funnels[0].id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("funnels.title")}</h1>
          {activeFunnel && (
            <p className="text-sm text-muted-foreground mt-1">
              {funnelLeads.length} lead{funnelLeads.length !== 1 ? "s" : ""}
              {totalValue > 0 && <> · ${totalValue.toLocaleString()} pipeline</>}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {activeFunnel && <Button onClick={() => setShowCreateLead(true)}><Plus className="h-4 w-4" /> {t("funnels.newLead")}</Button>}
          <Button variant="outline" onClick={() => setShowCreateFunnel(true)}><Plus className="h-4 w-4" /> {t("funnels.new")}</Button>
        </div>
      </div>

      {funnels.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto">
          {funnels.map((f) => (
            <div key={f.id} className="flex items-center">
              <Button variant={activeFunnelId === f.id ? "default" : "ghost"} size="sm" onClick={() => setActiveFunnelId(f.id)}>
                {f.name}
                <Badge variant="secondary" className="ml-1 text-[10px]">{leads.filter((l) => l.funnel_id === f.id).length}</Badge>
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-50 hover:opacity-100"
                onClick={() => { if (window.confirm(`Delete "${f.name}"?`)) deleteFunnel(f.id); }}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {funnels.length === 0 ? (
        <Card><CardContent className="py-12 text-center space-y-3">
          <p className="text-muted-foreground">{t("funnels.noFunnels")}</p>
          <Button onClick={() => setShowCreateFunnel(true)}><Plus className="h-4 w-4" /> {t("funnels.createFunnel")}</Button>
        </CardContent></Card>
      ) : activeFunnel ? (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {activeStages.map((stage) => {
            const stageLeads = funnelLeads.filter((l) => l.stage_id === stage.id);
            const stageValue = stageLeads.reduce((s, l) => s + Number(l.value || 0), 0);
            const nextStage = activeStages.find((s) => s.position === stage.position + 1);
            const prevStage = activeStages.find((s) => s.position === stage.position - 1);

            return (
              <div key={stage.id} className="flex-shrink-0 w-64">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{stage.title}</span>
                    <Badge variant="secondary" className="text-[10px]">{stageLeads.length}</Badge>
                  </div>
                  {stageValue > 0 && <span className="text-xs text-muted-foreground">${stageValue.toLocaleString()}</span>}
                </div>
                <div className="space-y-2 min-h-[100px]">
                  {stageLeads.map((lead) => (
                    <Card key={lead.id} className="group">
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium">{lead.name}</p>
                            {lead.company && <p className="text-xs text-muted-foreground">{lead.company}</p>}
                          </div>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingLead(lead)}><Pencil className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteLead(lead.id)}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </div>
                        {(lead.value || lead.email) && (
                          <div className="flex items-center gap-2 flex-wrap">
                            {lead.value && <span className="text-xs font-medium flex items-center gap-0.5"><DollarSign className="h-3 w-3" />{Number(lead.value).toLocaleString()}</span>}
                            {lead.email && <span className="text-xs text-muted-foreground">{lead.email}</span>}
                          </div>
                        )}
                        {lead.notes && <p className="text-xs text-muted-foreground line-clamp-2">{lead.notes}</p>}
                        <div className="flex gap-1 pt-1">
                          {prevStage && <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => moveLead(lead.id, prevStage.id)}>← {prevStage.title}</Button>}
                          {nextStage && <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 ml-auto" onClick={() => moveLead(lead.id, nextStage.id)}>{nextStage.title} →</Button>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Create funnel dialog */}
      <Dialog open={showCreateFunnel} onClose={() => setShowCreateFunnel(false)} title="New Funnel">
        <CreateFunnelForm onCancel={() => setShowCreateFunnel(false)} onSubmit={async (data) => {
          const { funnel } = await addFunnel(data);
          setActiveFunnelId(funnel.id);
          setShowCreateFunnel(false);
        }} />
      </Dialog>

      {/* Create lead dialog */}
      {activeFunnel && activeStages.length > 0 && (
        <Dialog open={showCreateLead} onClose={() => setShowCreateLead(false)} title="New Lead">
          <LeadForm stages={activeStages} onCancel={() => setShowCreateLead(false)} submitLabel="Create"
            onSubmit={async (data) => {
              await addLead({ ...data, funnel_id: activeFunnel.id, tags: [] });
              setShowCreateLead(false);
            }} />
        </Dialog>
      )}

      {/* Edit lead dialog */}
      <Dialog open={!!editingLead} onClose={() => setEditingLead(null)} title="Edit Lead">
        {editingLead && activeFunnel && (
          <LeadForm stages={activeStages} initial={editingLead} onCancel={() => setEditingLead(null)} submitLabel="Save"
            onSubmit={async (data) => { await updateLead(editingLead.id, data); setEditingLead(null); }} />
        )}
      </Dialog>
    </div>
  );
}

// ── Create Funnel Form ──

function CreateFunnelForm({ onSubmit, onCancel }: {
  onSubmit: (data: { name: string; type: FunnelType; stages: { title: string; position: number }[] }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<FunnelType>("sales");
  const [stages, setStages] = useState([{ title: "" }, { title: "" }, { title: "" }]);

  const addStage = () => setStages((prev) => [...prev, { title: "" }]);
  const removeStage = (i: number) => { if (stages.length > 2) setStages((prev) => prev.filter((_, idx) => idx !== i)); };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const validStages = stages.filter((s) => s.title.trim());
      if (!name.trim() || validStages.length < 2) return;
      onSubmit({ name: name.trim(), type, stages: validStages.map((s, i) => ({ title: s.title.trim(), position: i })) });
    }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><label className="text-sm font-medium">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sales Pipeline" autoFocus /></div>
        <div className="space-y-2"><label className="text-sm font-medium">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as FunnelType)}
            className="flex h-9 w-full rounded-lg border border-input bg-white px-3 py-1 text-sm capitalize">
            {FUNNEL_TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
          </select></div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Stages (left to right)</label>
          <Button type="button" variant="ghost" size="sm" onClick={addStage}><Plus className="h-3 w-3" /> Add</Button>
        </div>
        {stages.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-5 text-center">{i + 1}</span>
            <Input value={s.title} onChange={(e) => setStages((prev) => prev.map((st, idx) => idx === i ? { title: e.target.value } : st))}
              placeholder={`Stage ${i + 1}`} className="flex-1" />
            {stages.length > 2 && (
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeStage(i)}><X className="h-3 w-3" /></Button>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Create</Button>
      </div>
    </form>
  );
}

// ── Lead Form ──

function LeadForm({ initial, stages, onSubmit, onCancel, submitLabel }: {
  initial?: any; stages: FunnelStage[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void; submitLabel: string;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [company, setCompany] = useState(initial?.company || "");
  const [stageId, setStageId] = useState(initial?.stage_id || stages[0]?.id || "");
  const [value, setValue] = useState(initial?.value?.toString() || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [phone, setPhone] = useState(initial?.phone || "");
  const [source, setSource] = useState(initial?.source || "");
  const [notes, setNotes] = useState(initial?.notes || "");

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      if (!name.trim()) return;
      onSubmit({
        stage_id: stageId, name: name.trim(), company: company || null,
        value: value ? Number(value) : null, currency: null,
        email: email || null, phone: phone || null, source: source || null, notes: notes || null, client_id: null,
      });
    }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><label className="text-sm font-medium">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Lead name" autoFocus /></div>
        <div className="space-y-2"><label className="text-sm font-medium">Company</label>
          <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><label className="text-sm font-medium">Stage</label>
          <select value={stageId} onChange={(e) => setStageId(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-white px-3 py-1 text-sm">
            {stages.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select></div>
        <div className="space-y-2"><label className="text-sm font-medium">Value ($)</label>
          <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><label className="text-sm font-medium">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@..." /></div>
        <div className="space-y-2"><label className="text-sm font-medium">Phone</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+380..." /></div>
      </div>
      <div className="space-y-2"><label className="text-sm font-medium">Source</label>
        <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="LinkedIn, referral..." /></div>
      <div className="space-y-2"><label className="text-sm font-medium">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes..." rows={2}
          className="flex w-full rounded-lg border border-input bg-white px-3 py-2 text-sm placeholder:text-muted-foreground" /></div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
