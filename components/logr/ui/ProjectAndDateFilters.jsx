import { useTranslation } from "react-i18next";

export default function ProjectAndDateFilters({
  theme,
  currency,
  activeProjects,
  activeProjectId,
  setActiveProjectId,
  showAddProject,
  setShowAddProject,
  newProjectName,
  setNewProjectName,
  newProjectBillingType,
  setNewProjectBillingType,
  newProjectRate,
  setNewProjectRate,
  newProjectBudget,
  setNewProjectBudget,
  onAddProject,
  dateFilter,
  setDateFilter,
  customMonth,
  setCustomMonth,
}) {
  const { t } = useTranslation();
  const inputStyle = {
    background: "transparent",
    border: "none",
    outline: "none",
    fontFamily: "inherit",
    color: theme.inputColor,
  };

  return (
    <>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap", flex: 1, minWidth: 260 }}>
          {[{ id: "all", name: t("filters.all") }, ...activeProjects].map((project) => (
            <button
              key={project.id}
              onClick={() => setActiveProjectId(project.id)}
              style={{
                padding: "5px 12px",
                background: activeProjectId === project.id ? theme.tabActiveBg : "transparent",
                border: `1px solid ${theme.border}`,
                color: activeProjectId === project.id ? theme.tabActive : theme.tabInactive,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 10,
                letterSpacing: "0.1em",
              }}
            >
              {project.name}
            </button>
          ))}
          {showAddProject ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input
                autoFocus
                value={newProjectName}
                onChange={(event) => setNewProjectName(event.target.value)}
                placeholder={t("filters.projectPlaceholder")}
                onKeyDown={(event) => {
                  if (event.key === "Enter") onAddProject();
                  if (event.key === "Escape") setShowAddProject(false);
                }}
                style={{ ...inputStyle, fontSize: 11, borderBottom: `1px solid ${theme.border}`, paddingBottom: 2, width: 120 }}
              />
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {[["hourly", t("common.hourly")], ["fixed_project", t("common.fixedUpper")]].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => {
                      setNewProjectBillingType(value);
                      if (value === "hourly") {
                        setNewProjectBudget("");
                      } else {
                        setNewProjectRate("");
                      }
                    }}
                    style={{
                      padding: "4px 8px",
                      background: newProjectBillingType === value ? theme.tabActiveBg : "transparent",
                      border: `1px solid ${theme.border}`,
                      color: newProjectBillingType === value ? theme.tabActive : theme.tabInactive,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: 10,
                      letterSpacing: "0.1em",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newProjectBillingType === "hourly" ? newProjectRate : newProjectBudget}
                onChange={(event) => {
                  if (newProjectBillingType === "hourly") {
                    setNewProjectRate(event.target.value);
                  } else {
                    setNewProjectBudget(event.target.value);
                  }
                }}
                placeholder={newProjectBillingType === "hourly" ? t("filters.hourlyPlaceholder", { currency }) : t("filters.fixedPlaceholder", { currency })}
                onKeyDown={(event) => {
                  if (event.key === "Enter") onAddProject();
                  if (event.key === "Escape") setShowAddProject(false);
                }}
                style={{ ...inputStyle, fontSize: 11, borderBottom: `1px solid ${theme.border}`, paddingBottom: 2, width: 90 }}
              />
            </div>
          ) : (
            <button
              data-tour="add-project-btn"
              onClick={() => setShowAddProject(true)}
              style={{ padding: "5px 10px", background: "none", border: `1px dashed ${theme.border}`, color: theme.muted, cursor: "pointer", fontFamily: "inherit", fontSize: 10, letterSpacing: "0.1em" }}
            >
              {t("filters.addProject")}
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap", marginLeft: "auto", justifyContent: "flex-end" }}>
          {[["all", t("filters.all")], ["week", t("filters.week7")], ["month", t("filters.month")], ["custom", t("filters.monthCustom")]].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setDateFilter(value)}
              style={{
                padding: "5px 10px",
                background: dateFilter === value ? theme.tabActiveBg : "transparent",
                border: `1px solid ${theme.border}`,
                color: dateFilter === value ? theme.tabActive : theme.tabInactive,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 10,
                letterSpacing: "0.1em",
              }}
            >
              {label}
            </button>
          ))}
          {dateFilter === "custom" && (
            <input
              type="month"
              value={customMonth}
              onChange={(event) => setCustomMonth(event.target.value)}
              style={{ ...inputStyle, border: `1px solid ${theme.border}`, padding: "4px 8px", fontSize: 10, colorScheme: theme.colorScheme, color: theme.tabActive }}
            />
          )}
        </div>
      </div>
    </>
  );
}
