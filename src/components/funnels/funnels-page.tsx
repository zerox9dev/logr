import { useState } from "react";
import { Plus, Pencil, Trash2, ExternalLink, DollarSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Funnel, FunnelStage, FunnelDeal } from "@/types";

const STAGE_COLORS = [
  "#6366f1", "#3b82f6", "#06b6d4", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#8b5cf6", "#f97316", "#14b8a6",
];

// ── Create Funnel Dialog ──

function CreateFunnelForm({ onSubmit, onCancel }: {
  onSubmit: (data: { name: string; stages: { name: string; color: string }[] }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [stages, setStages] = useState<{ name: string; color: string }[]>([
    { name: "", color: STAGE_COLORS[0] },
    { name: "", color: STAGE_COLORS[1] },
    { name: "", color: STAGE_COLORS[2] },
  ]);

  const addStage = () => {
    setStages((prev) => [...prev, { name: "", color: STAGE_COLORS[prev.length % STAGE_COLORS.length] }]);
  };

  const removeStage = (i: number) => {
    if (stages.length > 2) setStages((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateStage = (i: number, field: "name" | "color", value: string) => {
    setStages((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const validStages = stages.filter((s) => s.name.trim());
    if (validStages.length < 2) return;
    onSubmit({ name: name.trim(), stages: validStages });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Funnel Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Freelance Pipeline, Job Search" autoFocus />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Stages (left to right)</label>
          <Button type="button" variant="ghost" size="sm" onClick={addStage}>
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>
        {stages.map((stage, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-5 text-center">{i + 1}</span>
            <button type="button" onClick={() => {
              const next = STAGE_COLORS[(STAGE_COLORS.indexOf(stage.color) + 1) % STAGE_COLORS.length];
              updateStage(i, "color", next);
            }} className="h-7 w-7 rounded-full shrink-0 border-2 border-transparent hover:border-border transition-colors"
              style={{ backgroundColor: stage.color }} />
            <Input value={stage.name} onChange={(e) => updateStage(i, "name", e.target.value)}
              placeholder={`Stage ${i + 1}`} className="flex-1" />
            {stages.length > 2 && (
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeStage(i)}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
        <p className="text-xs text-muted-foreground">Min 2 stages. Click color circle to change.</p>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Create Funnel</Button>
      </div>
    </form>
  );
}

// ── Deal Form ──

function DealForm({ initial, stages, onSubmit, onCancel, submitLabel }: {
  initial?: Partial<FunnelDeal>;
  stages: FunnelStage[];
  onSubmit: (data: Omit<FunnelDeal, "id" | "funnelId" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [company, setCompany] = useState(initial?.company || "");
  const [stageId, setStageId] = useState(initial?.stageId || stages[0]?.id || "");
  const [value, setValue] = useState(initial?.value?.toString() || "");
  const [contactName, setContactName] = useState(initial?.contactName || "");
  const [contactEmail, setContactEmail] = useState(initial?.contactEmail || "");
  const [url, setUrl] = useState(initial?.url || "");
  const [notes, setNotes] = useState(initial?.notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ stageId, title: title.trim(), company, value: value ? Number(value) : null, contactName, contactEmail, url, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Deal name" autoFocus />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Company</label>
          <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Inc." />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Stage</label>
          <select value={stageId} onChange={(e) => setStageId(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Value ($)</label>
          <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Contact</label>
          <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="John Doe" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="john@example.com" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">URL</label>
        <Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes..." rows={2}
          className="flex w-full rounded-lg border border-input bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}

// ── Deal Card ──

function DealCard({ deal, stages, onEdit, onDelete, onMove }: {
  deal: FunnelDeal;
  stages: FunnelStage[];
  onEdit: () => void;
  onDelete: () => void;
  onMove: (stageId: string) => void;
}) {
  const stage = stages.find((s) => s.id === deal.stageId);
  const nextStage = stages.find((s) => s.order === (stage?.order || 0) + 1);
  const prevStage = stages.find((s) => s.order === (stage?.order || 0) - 1);

  return (
    <Card className="group">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium">{deal.title}</p>
            {deal.company && <p className="text-xs text-muted-foreground">{deal.company}</p>}
          </div>
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit}><Pencil className="h-3 w-3" /></Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDelete}><Trash2 className="h-3 w-3" /></Button>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {deal.value != null && deal.value > 0 && (
            <span className="text-xs font-medium flex items-center gap-0.5"><DollarSign className="h-3 w-3" />{deal.value.toLocaleString()}</span>
          )}
          {deal.url && (
            <a href={deal.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-0.5"><ExternalLink className="h-3 w-3" /> Link</a>
          )}
          {deal.contactName && <span className="text-xs text-muted-foreground">{deal.contactName}</span>}
        </div>
        {deal.notes && <p className="text-xs text-muted-foreground line-clamp-2">{deal.notes}</p>}
        <div className="flex gap-1 pt-1">
          {prevStage && <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => onMove(prevStage.id)}>← {prevStage.name}</Button>}
          {nextStage && <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 ml-auto" onClick={() => onMove(nextStage.id)}>{nextStage.name} →</Button>}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ──

interface FunnelsPageProps {
  funnels: Funnel[];
  deals: FunnelDeal[];
  onAddFunnel: (data: { name: string; stages: { name: string; color: string }[] }) => Funnel;
  onUpdateFunnel: (id: string, data: Partial<Funnel>) => void;
  onDeleteFunnel: (id: string) => void;
  onAddDeal: (data: Omit<FunnelDeal, "id" | "createdAt" | "updatedAt">) => void;
  onUpdateDeal: (id: string, data: Partial<FunnelDeal>) => void;
  onDeleteDeal: (id: string) => void;
  onMoveDeal: (id: string, stageId: string) => void;
}

export function FunnelsPage({ funnels, deals, onAddFunnel, onUpdateFunnel, onDeleteFunnel, onAddDeal, onUpdateDeal, onDeleteDeal, onMoveDeal }: FunnelsPageProps) {
  const [activeFunnelId, setActiveFunnelId] = useState<string | null>(funnels[0]?.id || null);
  const [showCreateFunnel, setShowCreateFunnel] = useState(false);
  const [showCreateDeal, setShowCreateDeal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<FunnelDeal | null>(null);

  const activeFunnel = funnels.find((f) => f.id === activeFunnelId);
  const funnelDeals = activeFunnel ? deals.filter((d) => d.funnelId === activeFunnel.id) : [];
  const totalValue = funnelDeals.reduce((s, d) => s + (d.value || 0), 0);

  // Auto-select first funnel if active deleted
  if (!activeFunnel && funnels.length > 0 && activeFunnelId !== funnels[0].id) {
    setActiveFunnelId(funnels[0].id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Funnels</h1>
          {activeFunnel && (
            <p className="text-sm text-muted-foreground mt-1">
              {funnelDeals.length} deal{funnelDeals.length !== 1 ? "s" : ""}
              {totalValue > 0 && <> · ${totalValue.toLocaleString()} pipeline</>}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {activeFunnel && (
            <Button onClick={() => setShowCreateDeal(true)}>
              <Plus className="h-4 w-4" /> New Deal
            </Button>
          )}
          <Button variant="outline" onClick={() => setShowCreateFunnel(true)}>
            <Plus className="h-4 w-4" /> New Funnel
          </Button>
        </div>
      </div>

      {/* Funnel tabs */}
      {funnels.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto">
          {funnels.map((f) => (
            <div key={f.id} className="flex items-center">
              <Button
                variant={activeFunnelId === f.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveFunnelId(f.id)}
              >
                {f.name}
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  {deals.filter((d) => d.funnelId === f.id).length}
                </Badge>
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-50 hover:opacity-100"
                onClick={() => {
                  if (window.confirm(`Delete "${f.name}" and all its deals?`)) {
                    onDeleteFunnel(f.id);
                  }
                }}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {funnels.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <p className="text-muted-foreground">No funnels yet. Create one to start tracking deals.</p>
            <Button onClick={() => setShowCreateFunnel(true)}>
              <Plus className="h-4 w-4" /> Create First Funnel
            </Button>
          </CardContent>
        </Card>
      ) : activeFunnel ? (
        /* Kanban board */
        <div className="flex gap-3 overflow-x-auto pb-4">
          {activeFunnel.stages.map((stage) => {
            const stageDeals = funnelDeals.filter((d) => d.stageId === stage.id);
            const stageValue = stageDeals.reduce((s, d) => s + (d.value || 0), 0);

            return (
              <div key={stage.id} className="flex-shrink-0 w-64">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className="text-sm font-medium">{stage.name}</span>
                    <Badge variant="secondary" className="text-[10px]">{stageDeals.length}</Badge>
                  </div>
                  {stageValue > 0 && <span className="text-xs text-muted-foreground">${stageValue.toLocaleString()}</span>}
                </div>
                <div className="space-y-2 min-h-[100px]">
                  {stageDeals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} stages={activeFunnel.stages}
                      onEdit={() => setEditingDeal(deal)}
                      onDelete={() => onDeleteDeal(deal.id)}
                      onMove={(stageId) => onMoveDeal(deal.id, stageId)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Create funnel dialog */}
      <Dialog open={showCreateFunnel} onClose={() => setShowCreateFunnel(false)} title="New Funnel">
        <CreateFunnelForm
          onCancel={() => setShowCreateFunnel(false)}
          onSubmit={(data) => {
            const funnel = onAddFunnel(data);
            setActiveFunnelId(funnel.id);
            setShowCreateFunnel(false);
          }}
        />
      </Dialog>

      {/* Create deal dialog */}
      {activeFunnel && (
        <Dialog open={showCreateDeal} onClose={() => setShowCreateDeal(false)} title="New Deal">
          <DealForm
            stages={activeFunnel.stages}
            onCancel={() => setShowCreateDeal(false)}
            submitLabel="Create"
            onSubmit={(data) => {
              onAddDeal({ ...data, funnelId: activeFunnel.id });
              setShowCreateDeal(false);
            }}
          />
        </Dialog>
      )}

      {/* Edit deal dialog */}
      <Dialog open={!!editingDeal} onClose={() => setEditingDeal(null)} title="Edit Deal">
        {editingDeal && activeFunnel && (
          <DealForm
            initial={editingDeal}
            stages={activeFunnel.stages}
            onCancel={() => setEditingDeal(null)}
            submitLabel="Save"
            onSubmit={(data) => {
              onUpdateDeal(editingDeal.id, data);
              setEditingDeal(null);
            }}
          />
        )}
      </Dialog>
    </div>
  );
}
