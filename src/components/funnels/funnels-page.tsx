import { useState } from "react";
import { Plus, Pencil, Trash2, DollarSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppData } from "@/lib/data-context";
import type { FunnelType, FunnelStage } from "@/types/database";
import { t } from "@/lib/i18n";
import sh from "@/components/shared.module.css";
import s from "./funnels-page.module.css";

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
  const totalValue = funnelLeads.reduce((sum, l) => sum + Number(l.value || 0), 0);

  if (!activeFunnel && funnels.length > 0 && activeFunnelId !== funnels[0].id) {
    setActiveFunnelId(funnels[0].id);
  }

  return (
    <div className={sh.page}>
      <div className={sh.header}>
        <div>
          <h1 className={sh.title}>{t("funnels.title")}</h1>
          {activeFunnel && (
            <p className={sh.subtitle}>
              {funnelLeads.length} lead{funnelLeads.length !== 1 ? "s" : ""}
              {totalValue > 0 && <> · ${totalValue.toLocaleString()} pipeline</>}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {activeFunnel && <Button onClick={() => setShowCreateLead(true)}><Plus style={{ width: 16, height: 16 }} /> {t("funnels.newLead")}</Button>}
          <Button variant="outline" onClick={() => setShowCreateFunnel(true)}><Plus style={{ width: 16, height: 16 }} /> {t("funnels.new")}</Button>
        </div>
      </div>

      {funnels.length > 0 && (
        <div className={s.funnelTabs}>
          {funnels.map((f) => (
            <div key={f.id} className={s.funnelTab}>
              <Button variant={activeFunnelId === f.id ? "default" : "ghost"} size="sm" onClick={() => setActiveFunnelId(f.id)}>
                {f.name}
                <Badge variant="secondary" style={{ marginLeft: "0.25rem", fontSize: 10 }}>{leads.filter((l) => l.funnel_id === f.id).length}</Badge>
              </Button>
              <Button variant="ghost" size="icon" className={s.funnelDeleteBtn}
                onClick={() => { if (window.confirm(`Delete "${f.name}"?`)) deleteFunnel(f.id); }}>
                <X style={{ width: 12, height: 12 }} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {funnels.length === 0 ? (
        <Card><CardContent style={{ padding: "3rem 0", textAlign: "center", display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" }}>
          <p style={{ color: "var(--muted-foreground)" }}>{t("funnels.noFunnels")}</p>
          <Button onClick={() => setShowCreateFunnel(true)}><Plus style={{ width: 16, height: 16 }} /> {t("funnels.createFunnel")}</Button>
        </CardContent></Card>
      ) : activeFunnel ? (
        <div className={s.kanban}>
          {activeStages.map((stage) => {
            const stageLeads = funnelLeads.filter((l) => l.stage_id === stage.id);
            const stageValue = stageLeads.reduce((sum, l) => sum + Number(l.value || 0), 0);
            const nextStage = activeStages.find((st) => st.position === stage.position + 1);
            const prevStage = activeStages.find((st) => st.position === stage.position - 1);

            return (
              <div key={stage.id} className={s.column}>
                <div className={s.columnHeader}>
                  <div className={s.columnTitle}>
                    <span className={s.columnName}>{stage.title}</span>
                    <Badge variant="secondary" style={{ fontSize: 10 }}>{stageLeads.length}</Badge>
                  </div>
                  {stageValue > 0 && <span className={s.columnValue}>${stageValue.toLocaleString()}</span>}
                </div>
                <div className={s.columnCards}>
                  {stageLeads.map((lead) => (
                    <Card key={lead.id}>
                      <CardContent className={s.leadContent}>
                        <div className={s.leadTop}>
                          <div>
                            <p className={s.leadName}>{lead.name}</p>
                            {lead.company && <p className={s.leadCompany}>{lead.company}</p>}
                          </div>
                          <div className={s.leadActions}>
                            <Button variant="ghost" size="icon" className={s.leadActionBtn} onClick={() => setEditingLead(lead)}><Pencil style={{ width: 12, height: 12 }} /></Button>
                            <Button variant="ghost" size="icon" className={s.leadActionBtn} onClick={() => deleteLead(lead.id)}><Trash2 style={{ width: 12, height: 12 }} /></Button>
                          </div>
                        </div>
                        {(lead.value || lead.email) && (
                          <div className={s.leadMeta}>
                            {lead.value && <span className={s.leadValue}><DollarSign className={s.leadValueIcon} />{Number(lead.value).toLocaleString()}</span>}
                            {lead.email && <span className={s.leadEmail}>{lead.email}</span>}
                          </div>
                        )}
                        {lead.notes && <p className={[s.leadNotes, "line-clamp-2"].join(" ")}>{lead.notes}</p>}
                        <div className={s.leadMoveButtons}>
                          {prevStage && <Button variant="ghost" size="sm" className={s.leadMoveBtn} onClick={() => moveLead(lead.id, prevStage.id)}>← {prevStage.title}</Button>}
                          {nextStage && <Button variant="ghost" size="sm" className={[s.leadMoveBtn, s.leadMoveBtnRight].join(" ")} onClick={() => moveLead(lead.id, nextStage.id)}>{nextStage.title} →</Button>}
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

      <Dialog open={showCreateFunnel} onClose={() => setShowCreateFunnel(false)} title="New Funnel">
        <CreateFunnelForm onCancel={() => setShowCreateFunnel(false)} onSubmit={async (data) => {
          const { funnel } = await addFunnel(data);
          setActiveFunnelId(funnel.id);
          setShowCreateFunnel(false);
        }} />
      </Dialog>

      {activeFunnel && activeStages.length > 0 && (
        <Dialog open={showCreateLead} onClose={() => setShowCreateLead(false)} title="New Lead">
          <LeadForm stages={activeStages} onCancel={() => setShowCreateLead(false)} submitLabel="Create"
            onSubmit={async (data) => {
              await addLead({ ...data, funnel_id: activeFunnel.id, tags: [] });
              setShowCreateLead(false);
            }} />
        </Dialog>
      )}

      <Dialog open={!!editingLead} onClose={() => setEditingLead(null)} title="Edit Lead">
        {editingLead && activeFunnel && (
          <LeadForm stages={activeStages} initial={editingLead} onCancel={() => setEditingLead(null)} submitLabel="Save"
            onSubmit={async (data) => { await updateLead(editingLead.id, data); setEditingLead(null); }} />
        )}
      </Dialog>
    </div>
  );
}

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
      const validStages = stages.filter((st) => st.title.trim());
      if (!name.trim() || validStages.length < 2) return;
      onSubmit({ name: name.trim(), type, stages: validStages.map((st, i) => ({ title: st.title.trim(), position: i })) });
    }} className={sh.formGrid}>
      <div className={sh.formRow2}>
        <div className={sh.formField}><label className={sh.formLabel}>Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sales Pipeline" autoFocus /></div>
        <div className={sh.formField}><label className={sh.formLabel}>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as FunnelType)}
            className={sh.formSelect} style={{ textTransform: "capitalize" }}>
            {FUNNEL_TYPES.map((ft) => <option key={ft} value={ft}>{ft.replace("_", " ")}</option>)}
          </select></div>
      </div>
      <div className={sh.formField}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label className={sh.formLabel}>Stages (left to right)</label>
          <Button type="button" variant="ghost" size="sm" onClick={addStage}><Plus style={{ width: 12, height: 12 }} /> Add</Button>
        </div>
        {stages.map((st, i) => (
          <div key={i} className={s.stageRow}>
            <span className={s.stageNum}>{i + 1}</span>
            <Input value={st.title} onChange={(e) => setStages((prev) => prev.map((stg, idx) => idx === i ? { title: e.target.value } : stg))}
              placeholder={`Stage ${i + 1}`} className={s.stageInput} />
            {stages.length > 2 && (
              <Button type="button" variant="ghost" size="icon" className={s.stageDeleteBtn} onClick={() => removeStage(i)}><X style={{ width: 12, height: 12 }} /></Button>
            )}
          </div>
        ))}
      </div>
      <div className={sh.formActions}>
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Create</Button>
      </div>
    </form>
  );
}

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
    }} className={sh.formGrid}>
      <div className={sh.formRow2}>
        <div className={sh.formField}><label className={sh.formLabel}>Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Lead name" autoFocus /></div>
        <div className={sh.formField}><label className={sh.formLabel}>Company</label>
          <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" /></div>
      </div>
      <div className={sh.formRow2}>
        <div className={sh.formField}><label className={sh.formLabel}>Stage</label>
          <select value={stageId} onChange={(e) => setStageId(e.target.value)} className={sh.formSelect}>
            {stages.map((st) => <option key={st.id} value={st.id}>{st.title}</option>)}
          </select></div>
        <div className={sh.formField}><label className={sh.formLabel}>Value ($)</label>
          <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" /></div>
      </div>
      <div className={sh.formRow2}>
        <div className={sh.formField}><label className={sh.formLabel}>Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@..." /></div>
        <div className={sh.formField}><label className={sh.formLabel}>Phone</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+380..." /></div>
      </div>
      <div className={sh.formField}><label className={sh.formLabel}>Source</label>
        <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="LinkedIn, referral..." /></div>
      <div className={sh.formField}><label className={sh.formLabel}>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes..." rows={2} className={sh.formTextarea} /></div>
      <div className={sh.formActions}>
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
