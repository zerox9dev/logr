import { useDroppable } from "@dnd-kit/core";
import { useTranslation } from "react-i18next";
import LeadCard from "./LeadCard";
import { formatMoney } from "../lib/utils";

export default function PipelineColumn({ stage, stageLabel, leads, theme, onEdit, onDelete }) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  const columnValue = leads.reduce((sum, lead) => {
    return sum + (lead.estimated_value != null ? parseFloat(lead.estimated_value) : 0);
  }, 0);

  return (
    <div
      style={{
        width: 220,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ marginBottom: 10, padding: "0 2px" }}>
        <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.2em", marginBottom: 2 }}>
          {stageLabel}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: theme.muted }}>
            {leads.length} {t("pipeline.cards")}
          </span>
          {columnValue > 0 && (
            <span style={{ fontSize: 11, color: theme.text }}>
              {formatMoney(columnValue, leads[0]?.currency || "USD")}
            </span>
          )}
        </div>
      </div>

      <div
        ref={setNodeRef}
        style={{
          flex: 1,
          minHeight: 120,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          padding: 8,
          background: isOver ? theme.tabActiveBg : "transparent",
          border: `1px dashed ${isOver ? theme.tabActive : theme.border}`,
          transition: "background 0.15s, border-color 0.15s",
        }}
      >
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} theme={theme} onEdit={onEdit} onDelete={onDelete} />
        ))}
        {leads.length === 0 && (
          <div style={{ fontSize: 10, color: theme.muted, textAlign: "center", padding: "20px 0" }}>
            {t("pipeline.dropHere")}
          </div>
        )}
      </div>
    </div>
  );
}
