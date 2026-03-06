import { useState } from "react";
import { Plus, Pencil, Trash2, GripVertical, ExternalLink, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { FunnelStage, FunnelDeal, FunnelType } from "@/types";

interface FunnelsPageProps {
  freelanceStages: FunnelStage[];
  jobsearchStages: FunnelStage[];
  deals: FunnelDeal[];
  onAddDeal: (data: Omit<FunnelDeal, "id" | "createdAt" | "updatedAt">) => void;
  onUpdateDeal: (id: string, data: Partial<FunnelDeal>) => void;
  onDeleteDeal: (id: string) => void;
  onMoveDeal: (id: string, stageId: string) => void;
}

function DealForm({
  initial,
  stages,
  funnelType,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial?: Partial<FunnelDeal>;
  stages: FunnelStage[];
  funnelType: FunnelType;
  onSubmit: (data: Omit<FunnelDeal, "id" | "createdAt" | "updatedAt">) => void;
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
    onSubmit({
      funnelType,
      stageId,
      title: title.trim(),
      company,
      value: value ? Number(value) : null,
      currency: "USD",
      contactName,
      contactEmail,
      url,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {funnelType === "freelance" ? "Project / Deal" : "Position"}
          </label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={funnelType === "freelance" ? "Website redesign" : "Senior Designer"} autoFocus />
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
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{funnelType === "freelance" ? "Value ($)" : "Salary ($)"}</label>
          <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Contact Name</label>
          <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="John Doe" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Contact Email</label>
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
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}

function DealCard({
  deal,
  stages,
  onEdit,
  onDelete,
  onMove,
}: {
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
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit}>
              <Pencil className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {deal.value && (
            <span className="text-xs font-medium flex items-center gap-0.5">
              <DollarSign className="h-3 w-3" />{deal.value.toLocaleString()}
            </span>
          )}
          {deal.url && (
            <a href={deal.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-0.5">
              <ExternalLink className="h-3 w-3" /> Link
            </a>
          )}
          {deal.contactName && (
            <span className="text-xs text-muted-foreground">{deal.contactName}</span>
          )}
        </div>

        {deal.notes && <p className="text-xs text-muted-foreground line-clamp-2">{deal.notes}</p>}

        {/* Move buttons */}
        <div className="flex gap-1 pt-1">
          {prevStage && (
            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => onMove(prevStage.id)}>
              ← {prevStage.name}
            </Button>
          )}
          {nextStage && (
            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 ml-auto" onClick={() => onMove(nextStage.id)}>
              {nextStage.name} →
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function FunnelsPage({ freelanceStages, jobsearchStages, deals, onAddDeal, onUpdateDeal, onDeleteDeal, onMoveDeal }: FunnelsPageProps) {
  const [activeTab, setActiveTab] = useState<FunnelType>("freelance");
  const [showCreate, setShowCreate] = useState(false);
  const [editingDeal, setEditingDeal] = useState<FunnelDeal | null>(null);

  const stages = activeTab === "freelance" ? freelanceStages : jobsearchStages;
  const filteredDeals = deals.filter((d) => d.funnelType === activeTab);

  // Summary
  const totalValue = filteredDeals.reduce((s, d) => s + (d.value || 0), 0);
  const wonStage = stages.find((s) => s.name === "Won" || s.name === "Accepted");
  const wonDeals = wonStage ? filteredDeals.filter((d) => d.stageId === wonStage.id) : [];
  const wonValue = wonDeals.reduce((s, d) => s + (d.value || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Funnels</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredDeals.length} deal{filteredDeals.length !== 1 ? "s" : ""} · ${totalValue.toLocaleString()} pipeline
            {wonValue > 0 && <span className="text-emerald-600"> · ${wonValue.toLocaleString()} won</span>}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> New Deal
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        <Button variant={activeTab === "freelance" ? "default" : "ghost"} size="sm"
          onClick={() => setActiveTab("freelance")}>
          🎯 Freelance
        </Button>
        <Button variant={activeTab === "jobsearch" ? "default" : "ghost"} size="sm"
          onClick={() => setActiveTab("jobsearch")}>
          💼 Job Search
        </Button>
      </div>

      {/* Kanban board */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageDeals = filteredDeals.filter((d) => d.stageId === stage.id);
          const stageValue = stageDeals.reduce((s, d) => s + (d.value || 0), 0);

          return (
            <div key={stage.id} className="flex-shrink-0 w-64">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                  <span className="text-sm font-medium">{stage.name}</span>
                  <Badge variant="secondary" className="text-[10px]">{stageDeals.length}</Badge>
                </div>
                {stageValue > 0 && (
                  <span className="text-xs text-muted-foreground">${stageValue.toLocaleString()}</span>
                )}
              </div>

              <div className="space-y-2 min-h-[100px]">
                {stageDeals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    stages={stages}
                    onEdit={() => setEditingDeal(deal)}
                    onDelete={() => onDeleteDeal(deal.id)}
                    onMove={(stageId) => onMoveDeal(deal.id, stageId)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create dialog */}
      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title={`New ${activeTab === "freelance" ? "Freelance Deal" : "Job Application"}`}>
        <DealForm
          stages={stages}
          funnelType={activeTab}
          onCancel={() => setShowCreate(false)}
          submitLabel="Create"
          onSubmit={(data) => {
            onAddDeal(data);
            setShowCreate(false);
          }}
        />
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editingDeal} onClose={() => setEditingDeal(null)} title="Edit Deal">
        {editingDeal && (
          <DealForm
            initial={editingDeal}
            stages={stages}
            funnelType={editingDeal.funnelType}
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
