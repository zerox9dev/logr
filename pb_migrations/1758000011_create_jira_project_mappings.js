/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    const clients = app.findCollectionByNameOrId("clients");
    const projects = app.findCollectionByNameOrId("projects");

    const collection = new Collection({
      type: "base",
      name: "jira_project_mappings",
      listRule: "user = @request.auth.id",
      viewRule: "user = @request.auth.id",
      createRule: '@request.auth.id != "" && user = @request.auth.id',
      updateRule: "user = @request.auth.id",
      deleteRule: "user = @request.auth.id",
      fields: [
        {
          type: "relation",
          name: "user",
          required: true,
          collectionId: users.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { type: "text", name: "jira_project_key", required: true },
        { type: "text", name: "jira_project_name", required: false },
        // At least one of the two must be set; enforced in the Server Action
        // so a mapping can target a client, a project, or both.
        {
          type: "relation",
          name: "client",
          required: false,
          collectionId: clients.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          type: "relation",
          name: "project",
          required: false,
          collectionId: projects.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { type: "autodate", name: "created", onCreate: true, onUpdate: false },
        { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_jira_project_mappings_user_key ON jira_project_mappings (user, jira_project_key)",
      ],
    });

    app.save(collection);
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId("jira_project_mappings"));
  },
);
