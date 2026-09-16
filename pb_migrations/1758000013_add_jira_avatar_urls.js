/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const mappings = app.findCollectionByNameOrId("jira_project_mappings");
    mappings.fields.add(
      new Field({ type: "text", name: "jira_project_avatar_url", required: false }),
    );
    app.save(mappings);

    // Kept on the project itself rather than joined through the mapping: a
    // project renamed in logr no longer matches its Jira project by name.
    const projects = app.findCollectionByNameOrId("projects");
    projects.fields.add(new Field({ type: "text", name: "jira_avatar_url", required: false }));
    app.save(projects);
  },
  (app) => {
    const mappings = app.findCollectionByNameOrId("jira_project_mappings");
    mappings.fields.removeByName("jira_project_avatar_url");
    app.save(mappings);

    const projects = app.findCollectionByNameOrId("projects");
    projects.fields.removeByName("jira_avatar_url");
    app.save(projects);
  },
);
