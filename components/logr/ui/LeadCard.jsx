import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { formatMoney } from "../lib/utils";

const STAGE_COLORS = {
  lead: "#6b7280",
  negotiation: "#d97706",
  contract: "#2563eb",
  active: "#059669",
  done: "#7c3aed",
  rejected: "#dc2626",
};

export default function LeadCard({ lead, theme, onEdit, onDelete, showEstimatedValue = true }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { lead },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    background: theme.statBg,
    border: `1px solid ${theme.border}`,
    padding: "12px 14px",
    cursor: "grab",
    userSelect: "none",
    position: "relative",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: theme.text,
            }}
          >
            {lead.name}
          </div>
          {lead.company && (
            <div style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>{lead.company}</div>
          )}
        </div>
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onEdit(lead); }}
            style={{ background: "none", border: "none", color: theme.muted, cursor: "pointer", fontSize: 12, padding: "2px 4px" }}
          >
            ✎
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onDelete(lead.id); }}
            style={{ background: "none", border: "none", color: theme.muted, cursor: "pointer", fontSize: 14, padding: "2px 4px" }}
          >
            ×
          </button>
        </div>
      </div>

      {showEstimatedValue && lead.estimated_value != null && (
        <div style={{ marginTop: 8, fontSize: 12, color: STAGE_COLORS[lead.stage] || theme.muted }}>
          {formatMoney(lead.estimated_value, lead.currency || "USD")}
        </div>
      )}

      {lead.tags && lead.tags.length > 0 && (
        <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
          {lead.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 9,
                padding: "2px 6px",
                background: theme.border,
                color: theme.muted,
                letterSpacing: "0.1em",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
