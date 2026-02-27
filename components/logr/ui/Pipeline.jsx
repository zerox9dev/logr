import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import PipelineColumn from "./PipelineColumn";
import LeadCard from "./LeadCard";
import LeadModal from "./LeadModal";

const STAGES = ["lead", "negotiation", "contract", "active", "done"];

export default function Pipeline({ theme, leads, onCreateLead, onUpdateLead, onDeleteLead }) {
  const { t } = useTranslation();
  const [activeDragLead, setActiveDragLead] = useState(null);
  const [modal, setModal] = useState(null); // null | { lead?: lead, defaultStage?: string }
  const [isMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 640);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragStart({ active }) {
    const lead = leads.find((l) => l.id === active.id);
    if (lead) setActiveDragLead(lead);
  }

  function handleDragEnd({ active, over }) {
    setActiveDragLead(null);
    if (!over) return;
    const lead = leads.find((l) => l.id === active.id);
    if (!lead || lead.stage === over.id) return;
    onUpdateLead(lead.id, { stage: over.id });
  }

  async function handleSave(data) {
    if (modal?.lead) {
      await onUpdateLead(modal.lead.id, data);
    } else {
      await onCreateLead(data);
    }
    setModal(null);
  }

  async function handleDelete(leadId) {
    if (!window.confirm(t("pipeline.confirmDelete"))) return;
    await onDeleteLead(leadId);
  }

  const stageLabels = {
    lead: t("pipeline.stages.lead"),
    negotiation: t("pipeline.stages.negotiation"),
    contract: t("pipeline.stages.contract"),
    active: t("pipeline.stages.active"),
    done: t("pipeline.stages.done"),
  };

  // Mobile: stacked list by stage
  if (isMobile) {
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.2em" }}>{t("pipeline.title")}</div>
          <button
            onClick={() => setModal({})}
            style={{
              padding: "6px 14px",
              background: "none",
              border: `1px dashed ${theme.border}`,
              color: theme.muted,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 11,
              letterSpacing: "0.1em",
            }}
          >
            {t("pipeline.newLead")}
          </button>
        </div>
        {STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage);
          if (stageLeads.length === 0) return null;
          return (
            <div key={stage} style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.2em", marginBottom: 8 }}>
                {stageLabels[stage]} · {stageLeads.length}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    style={{
                      background: theme.statBg,
                      border: `1px solid ${theme.border}`,
                      padding: "12px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, color: theme.text }}>{lead.name}</div>
                      {lead.company && <div style={{ fontSize: 11, color: theme.muted }}>{lead.company}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        onClick={() => setModal({ lead })}
                        style={{ background: "none", border: "none", color: theme.muted, cursor: "pointer", fontSize: 12 }}
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDelete(lead.id)}
                        style={{ background: "none", border: "none", color: theme.muted, cursor: "pointer", fontSize: 14 }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {modal && (
          <LeadModal
            theme={theme}
            lead={modal.lead}
            defaultStage={modal.defaultStage}
            onSave={handleSave}
            onClose={() => setModal(null)}
          />
        )}
      </div>
    );
  }

  // Desktop: Kanban
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.2em" }}>{t("pipeline.title")}</div>
        <button
          onClick={() => setModal({})}
          style={{
            padding: "6px 14px",
            background: "none",
            border: `1px dashed ${theme.border}`,
            color: theme.muted,
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 11,
            letterSpacing: "0.1em",
          }}
        >
          + {t("pipeline.newLead")}
        </button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
          {STAGES.map((stage) => (
            <PipelineColumn
              key={stage}
              stage={stage}
              stageLabel={stageLabels[stage]}
              leads={leads.filter((l) => l.stage === stage)}
              theme={theme}
              onEdit={(lead) => setModal({ lead })}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <DragOverlay>
          {activeDragLead ? (
            <LeadCard
              lead={activeDragLead}
              theme={theme}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {modal && (
        <LeadModal
          theme={theme}
          lead={modal.lead}
          defaultStage={modal.defaultStage}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
