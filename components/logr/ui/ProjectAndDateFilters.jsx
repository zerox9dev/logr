export default function ProjectAndDateFilters({
  theme,
  activeProjects,
  activeProjectId,
  setActiveProjectId,
  showAddProject,
  setShowAddProject,
  newProjectName,
  setNewProjectName,
  onAddProject,
  dateFilter,
  setDateFilter,
  customMonth,
  setCustomMonth,
}) {
  const inputStyle = {
    background: "transparent",
    border: "none",
    outline: "none",
    fontFamily: "inherit",
    color: theme.inputColor,
  };

  return (
    <>
      <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {[{ id: "all", name: "ALL" }, ...activeProjects].map((project) => (
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
          <input
            autoFocus
            value={newProjectName}
            onChange={(event) => setNewProjectName(event.target.value)}
            placeholder="project name"
            onKeyDown={(event) => {
              if (event.key === "Enter") onAddProject();
              if (event.key === "Escape") setShowAddProject(false);
            }}
            style={{ ...inputStyle, fontSize: 11, borderBottom: `1px solid ${theme.border}`, paddingBottom: 2, width: 120 }}
          />
        ) : (
          <button
            onClick={() => setShowAddProject(true)}
            style={{ padding: "5px 10px", background: "none", border: `1px dashed ${theme.border}`, color: theme.muted, cursor: "pointer", fontFamily: "inherit", fontSize: 10, letterSpacing: "0.1em" }}
          >
            + PROJECT
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        {[["all", "ALL"], ["week", "7D"], ["month", "THIS MONTH"], ["custom", "MONTH ▾"]].map(([value, label]) => (
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
    </>
  );
}
