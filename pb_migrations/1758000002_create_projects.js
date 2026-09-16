/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    const clients = app.findCollectionByNameOrId("clients");

    const collection = new Collection({
      type: "base",
      name: "projects",
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
        {
          type: "relation",
          name: "client",
          required: true,
          collectionId: clients.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { type: "text", name: "name", required: true },
        {
          type: "select",
          name: "billing_type",
          required: true,
          maxSelect: 1,
          values: ["hourly", "fixed"],
        },
        { type: "number", name: "rate", required: false },
        { type: "number", name: "fixed_budget", required: false },
        {
          type: "select",
          name: "status",
          required: true,
          maxSelect: 1,
          values: ["active", "paused", "completed", "cancelled"],
        },
        { type: "text", name: "legacy_id", required: false },
        { type: "date", name: "original_created_at", required: false },
        { type: "autodate", name: "created", onCreate: true, onUpdate: false },
        { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE INDEX idx_projects_user ON projects (user)",
        "CREATE INDEX idx_projects_client ON projects (client)",
      ],
    });

    app.save(collection);
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId("projects"));
  },
);
