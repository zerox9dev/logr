import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import PipelineColumn from "./PipelineColumn";
import LeadCard from "./LeadCard";
import LeadModal from "./LeadModal";

function getLocalizedStageLabel(stage, funnelType, t) {
  if (funnelType === "custom") return stage.title;

  if (funnelType === "freelancer") {
    return t(`pipeline.stages.${stage.key}`, { defaultValue: stage.title });
  }

  const jobStageKeyMap = {
    saved: "saved",
    applied: "applied",
    response: "response",
    interview: "interview",
    offer: "offer",
    rejected: "rejected",
    lead: "saved",
    negotiation: "applied",
    contract: "response",
    active: "interview",
    done: "offer",
  };

  const fallbackByPosition = ["saved", "applied", "response", "interview", "offer", "rejected"];
  const jobStageKey = jobStageKeyMap[stage.key] || fallbackByPosition[stage.position] || "saved";
  return t(`pipeline.jobStages.${jobStageKey}`, { defaultValue: stage.title });
}

function leadInStage(lead, stage, activeFunnelId) {
  return lead.funnel_id === activeFunnelId && lead.stage_id === stage.id;
}

function FunnelGraph({
  theme,
  leads,
  stages,
  stageLabels,
  totalLabel,
  finalLabel,
  rejectionLabel,
  successStageId,
  rejectedStageId,
  t,
}) {
  const inStage = (lead, stage) => lead.stage_id === stage.id;

  const stageData = stages.map((stage, index) => {
    const count = leads.filter((lead) => inStage(lead, stage)).length;
    const prevStage = index > 0 ? stages[index - 1] : stage;
    const prevCount = leads.filter((lead) => inStage(lead, prevStage)).length;
    const conversionFromPrev = index > 0 && prevCount > 0 ? (count / prevCount) * 100 : 100;
    return { stage, count, conversionFromPrev };
  });

  const maxCount = stageData.reduce((max, item) => Math.max(max, item.count), 0) || 1;
  const totalItemsCount = leads.length;
  const firstStageCount = stageData[0]?.count || 0;
  const conversionBaseCount = rejectedStageId ? totalItemsCount : firstStageCount;
  const successCount = successStageId
    ? (stageData.find((item) => item.stage.id === successStageId)?.count || 0)
    : (stageData[stageData.length - 1]?.count || 0);
  const rejectedCount = rejectedStageId
    ? (stageData.find((item) => item.stage.id === rejectedStageId)?.count || 0)
    : 0;
  const finalConversion = conversionBaseCount > 0 ? (successCount / conversionBaseCount) * 100 : 0;
  const rejectionConversion = conversionBaseCount > 0 ? (rejectedCount / conversionBaseCount) * 100 : 0;

  return (
    <div style={{ border: `1px solid ${theme.border}`, padding: 14, marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 10, color: theme.muted, letterSpacing: "0.16em", marginBottom: 4 }}>{t("pipeline.funnelTitle")}</div>
          <div style={{ fontSize: 12, color: theme.sessionText }}>{t("pipeline.funnelSubtitle")}</div>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.12em" }}>{totalLabel}</div>
            <div style={{ fontSize: 16, color: theme.text }}>{totalItemsCount}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.12em" }}>{finalLabel}</div>
            <div style={{ fontSize: 16, color: theme.tabActive }}>{finalConversion.toFixed(1)}%</div>
          </div>
          {rejectedStageId ? (
            <div>
              <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.12em" }}>{rejectionLabel}</div>
              <div style={{ fontSize: 16, color: "#dc2626" }}>{rejectionConversion.toFixed(1)}%</div>
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ width: "100%", paddingBottom: 2 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, width: "100%" }}>
          {stageData.map((item, index) => (
            <div key={item.stage.id} style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ height: 136, border: `1px solid ${theme.border}`, background: theme.faint, display: "flex", alignItems: "flex-end", padding: "0 8px 8px" }}>
                  <div
                    style={{
                      width: "100%",
                      height: `${Math.max(8, (item.count / maxCount) * 100)}%`,
                      background: item.stage.key === "rejected"
                        ? "linear-gradient(180deg, rgba(239,68,68,0.78), rgba(185,28,28,0.95))"
                        : "linear-gradient(180deg, rgba(78,174,108,0.75), rgba(36,123,70,0.92))",
                    }}
                  />
                </div>
                <div style={{ marginTop: 8, fontSize: 10, color: theme.muted, textAlign: "center" }}>
                  {stageLabels[item.stage.id] || item.stage.title}
                </div>
                <div style={{ marginTop: 3, fontSize: 13, color: theme.text, textAlign: "center" }}>{item.count}</div>
              </div>

              {index < stageData.length - 1 && (
                <div style={{ width: 40, flexShrink: 0, textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: theme.muted, marginBottom: 4 }}>{stageData[index + 1].conversionFromPrev.toFixed(1)}%</div>
                  <div style={{ fontSize: 14, color: theme.tabActive }}>→</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Pipeline({
  theme,
  funnels,
  activeFunnelId,
  leads,
  onSelectFunnel,
  onCreateFunnel,
  onDeleteFunnel,
  onUpdateFunnelStages,
  onCreateLead,
  onUpdateLead,
  onDeleteLead,
}) {
  const { t } = useTranslation();
  const [activeDragLead, setActiveDragLead] = useState(null);
  const [modal, setModal] = useState(null);
  const [isMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 640);
  const [customStageTitles, setCustomStageTitles] = useState({});

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const activeFunnel = useMemo(
    () => funnels.find((funnel) => funnel.id === activeFunnelId) || funnels[0] || null,
    [funnels, activeFunnelId]
  );

  const stages = useMemo(
    () => (activeFunnel?.stages || []).slice().sort((a, b) => a.position - b.position),
    [activeFunnel]
  );

  const stageLabels = useMemo(
    () => Object.fromEntries(stages.map((stage) => [stage.id, getLocalizedStageLabel(stage, activeFunnel?.type, t)])),
    [stages, activeFunnel?.type, t]
  );

  const scopedLeads = useMemo(() => {
    if (!activeFunnel) return [];
    return leads.filter((lead) => lead.funnel_id === activeFunnel.id);
  }, [activeFunnel, leads]);
  const newItemLabel = activeFunnel
    ? t(`pipeline.newItemByType.${activeFunnel.type}`)
    : t("pipeline.newLead");
  const totalLabel = activeFunnel
    ? t(`pipeline.totalByType.${activeFunnel.type}`)
    : t("pipeline.totalLeads");
  const finalLabel = activeFunnel
    ? t(`pipeline.finalConversionByType.${activeFunnel.type}`)
    : t("pipeline.finalConversion");
  const rejectionLabel = activeFunnel?.type === "jobseeker"
    ? t("pipeline.rejectionConversionByType.jobseeker")
    : "";
  const showCardValue = true;
  const showColumnValue = activeFunnel?.type !== "jobseeker";
  const successStageId = useMemo(() => {
    if (!activeFunnel || stages.length === 0) return null;
    if (activeFunnel.type === "jobseeker") {
      return stages.find((stage) => stage.key === "offer")?.id
        || stages.find((stage) => stage.key === "done")?.id
        || null;
    }
    if (activeFunnel.type === "freelancer") {
      return stages.find((stage) => stage.key === "done")?.id || null;
    }
    return stages[stages.length - 1]?.id || null;
  }, [activeFunnel, stages]);
  const rejectedStageId = useMemo(() => {
    if (!activeFunnel || activeFunnel.type !== "jobseeker") return null;
    return stages.find((stage) => stage.key === "rejected")?.id || null;
  }, [activeFunnel, stages]);

  if (!activeFunnel) {
    const templateCards = [
      { type: "freelancer", icon: "◈" },
      { type: "jobseeker", icon: "◎" },
      { type: "custom", icon: "✦" },
    ];

    return (
      <div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.2em", marginBottom: 10 }}>{t("pipeline.title")}</div>
          <div style={{ fontSize: 13, color: theme.sessionText }}>{t("pipeline.chooseType")}</div>
        </div>

        <div style={{ minHeight: "52vh", display: "grid", placeItems: "center" }}>
          <div style={{ width: "100%", maxWidth: 980 }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: 12 }}>
              {templateCards.map(({ type, icon }) => (
                <button
                  key={type}
                  onClick={() => onCreateFunnel(type)}
                  style={{
                    border: `1px solid ${theme.border}`,
                    background: "none",
                    cursor: "pointer",
                    color: theme.text,
                    textAlign: "left",
                    padding: 16,
                    minHeight: 132,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontSize: 10, color: theme.muted, letterSpacing: "0.14em" }}>
                      {t(`pipeline.templates.${type}`)}
                    </div>
                    <div
                      aria-hidden
                      style={{
                        width: 24,
                        height: 24,
                        border: `1px solid ${theme.border}`,
                        display: "grid",
                        placeItems: "center",
                        fontSize: 13,
                        color: theme.tabActive,
                      }}
                    >
                      {icon}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: theme.sessionText, lineHeight: 1.35 }}>
                    {t(`pipeline.templateSubtitle.${type}`)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  async function handleSaveCustomStages() {
    const nextStages = stages.map((stage, position) => ({
      id: stage.id,
      key: stage.key,
      position,
      title: (customStageTitles[stage.id] || "").trim() || stage.title,
    }));
    await onUpdateFunnelStages(activeFunnel.id, nextStages);
  }

  async function handleDeleteActiveFunnel() {
    if (!activeFunnel) return;
    if (!window.confirm(t("pipeline.confirmDeleteFunnel"))) return;
    await onDeleteFunnel(activeFunnel.id);
  }

  function handleDragStart({ active }) {
    const lead = scopedLeads.find((l) => l.id === active.id);
    if (lead) setActiveDragLead(lead);
  }

  function handleDragEnd({ active, over }) {
    setActiveDragLead(null);
    if (!over) return;
    const lead = scopedLeads.find((l) => l.id === active.id);
    if (!lead || lead.stage_id === over.id) return;
    onUpdateLead(lead.id, { stage_id: over.id });
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

  function renderHeader() {
    return (
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.2em" }}>{t("pipeline.title")}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {funnels.map((funnel) => (
              <div key={funnel.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button
                  onClick={() => onSelectFunnel(funnel.id)}
                  style={{
                    padding: "6px 10px",
                    background: activeFunnel.id === funnel.id ? theme.tabActiveBg : "transparent",
                    border: `1px solid ${theme.border}`,
                    color: activeFunnel.id === funnel.id ? theme.tabActive : theme.muted,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 10,
                    letterSpacing: "0.08em",
                  }}
                >
                  {funnel.name}
                </button>
                {activeFunnel.id === funnel.id ? (
                  <button
                    onClick={handleDeleteActiveFunnel}
                    style={{
                      padding: "6px 8px",
                      background: "none",
                      border: `1px solid ${theme.border}`,
                      color: theme.muted,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: 10,
                      letterSpacing: "0.08em",
                    }}
                    title={t("pipeline.deleteFunnel")}
                    aria-label={t("pipeline.deleteFunnel")}
                  >
                    ×
                  </button>
                ) : null}
              </div>
            ))}
            {["freelancer", "jobseeker", "custom"].map((type) => (
              <button
                key={type}
                onClick={() => onCreateFunnel(type)}
                style={{
                  padding: "6px 10px",
                  background: "none",
                  border: `1px dashed ${theme.border}`,
                  color: theme.muted,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 10,
                  letterSpacing: "0.08em",
                }}
              >
                + {t(`pipeline.templates.${type}`)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 12, color: theme.sessionText, marginBottom: activeFunnel.type === "custom" ? 10 : 0 }}>
          {t(`pipeline.templateSubtitle.${activeFunnel.type || "custom"}`)}
        </div>

        {activeFunnel.type === "custom" ? (
          <div style={{ border: `1px solid ${theme.border}`, padding: 12, display: "grid", gap: 8 }}>
            <div style={{ fontSize: 10, color: theme.muted, letterSpacing: "0.12em" }}>{t("pipeline.customizeStages")}</div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(5, minmax(0, 1fr))", gap: 8 }}>
              {stages.map((stage) => (
                <input
                  key={stage.id}
                  value={customStageTitles[stage.id] ?? stage.title}
                  onChange={(e) => setCustomStageTitles((prev) => ({ ...prev, [stage.id]: e.target.value }))}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: `1px solid ${theme.border}`,
                    color: theme.text,
                    fontFamily: "inherit",
                    fontSize: 12,
                    padding: "7px 8px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              ))}
            </div>
            <div>
              <button
                onClick={handleSaveCustomStages}
                style={{
                  padding: "6px 10px",
                  background: theme.tabActiveBg,
                  border: `1px solid ${theme.tabActive}`,
                  color: theme.tabActive,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 10,
                  letterSpacing: "0.08em",
                }}
              >
                {t("common.save")}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  if (isMobile) {
    return (
      <div>
        {renderHeader()}

        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 20 }}>
          <button
            onClick={() => setModal({ defaultStage: stages[0]?.id })}
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
            {newItemLabel}
          </button>
        </div>

        <FunnelGraph
          theme={theme}
          leads={scopedLeads}
          stages={stages}
          stageLabels={stageLabels}
          totalLabel={totalLabel}
          finalLabel={finalLabel}
          rejectionLabel={rejectionLabel}
          successStageId={successStageId}
          rejectedStageId={rejectedStageId}
          t={t}
        />

        {stages.map((stage) => {
          const stageLeads = scopedLeads.filter((lead) => leadInStage(lead, stage, activeFunnel.id));
          if (stageLeads.length === 0) return null;
          return (
            <div key={stage.id} style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 9, color: theme.muted, letterSpacing: "0.2em", marginBottom: 8 }}>
                {stageLabels[stage.id] || stage.title} · {stageLeads.length}
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
            stageOrder={stages.map((stage) => stage.id)}
            stageLabels={stageLabels}
            allowEstimatedValue={showCardValue}
            onSave={handleSave}
            onClose={() => setModal(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      {renderHeader()}

      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 24 }}>
        <button
          onClick={() => setModal({ defaultStage: stages[0]?.id })}
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
          + {newItemLabel}
        </button>
      </div>

      <FunnelGraph
        theme={theme}
        leads={scopedLeads}
        stages={stages}
        stageLabels={stageLabels}
        totalLabel={totalLabel}
        finalLabel={finalLabel}
        rejectionLabel={rejectionLabel}
        successStageId={successStageId}
        rejectedStageId={rejectedStageId}
        t={t}
      />

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))`,
            gap: 16,
            width: "100%",
            paddingBottom: 8,
          }}
        >
          {stages.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage.id}
              stageLabel={stageLabels[stage.id] || stage.title}
              leads={scopedLeads.filter((lead) => leadInStage(lead, stage, activeFunnel.id))}
              theme={theme}
              onEdit={(lead) => setModal({ lead })}
              onDelete={handleDelete}
              showColumnValue={showColumnValue}
              showCardValue={showCardValue}
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
              showEstimatedValue={showCardValue}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {modal && (
        <LeadModal
          theme={theme}
          lead={modal.lead}
          defaultStage={modal.defaultStage}
          stageOrder={stages.map((stage) => stage.id)}
          stageLabels={stageLabels}
          allowEstimatedValue={showCardValue}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
