/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    const clients = app.findCollectionByNameOrId("clients");
    const projects = app.findCollectionByNameOrId("projects");

    const collection = new Collection({
      type: "base",
      name: "sessions",
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
        { type: "text", name: "name", required: false },
        { type: "text", name: "notes", required: false },
        { type: "date", name: "started_at", required: true },
        // PocketBase treats 0 as blank on a required number field, so marking
        // this required would reject a timer stopped within the same second.
        { type: "number", name: "duration_seconds", required: false },
        { type: "number", name: "rate", required: false },
        {
          type: "select",
          name: "billing_type",
          required: true,
          maxSelect: 1,
          values: ["hourly", "fixed"],
        },
        {
          type: "select",
          name: "payment_status",
          required: true,
          maxSelect: 1,
          values: ["unpaid", "paid"],
        },
        { type: "json", name: "tags", required: false, maxSize: 200000 },
        { type: "text", name: "legacy_id", required: false },
        { type: "date", name: "original_created_at", required: false },
        { type: "autodate", name: "created", onCreate: true, onUpdate: false },
        { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE INDEX idx_sessions_user ON sessions (user)",
        "CREATE INDEX idx_sessions_project ON sessions (project)",
        "CREATE INDEX idx_sessions_started_at ON sessions (started_at)",
      ],
    });

    app.save(collection);
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId("sessions"));
  },
);
