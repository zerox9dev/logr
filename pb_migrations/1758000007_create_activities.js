/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    const clients = app.findCollectionByNameOrId("clients");

    const collection = new Collection({
      type: "base",
      name: "activities",
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
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          type: "select",
          name: "type",
          required: true,
          maxSelect: 1,
          values: ["call", "email", "meeting", "note", "payment"],
        },
        { type: "text", name: "description", required: true },
        { type: "text", name: "legacy_id", required: false },
        { type: "date", name: "original_created_at", required: false },
        { type: "autodate", name: "created", onCreate: true, onUpdate: false },
        { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE INDEX idx_activities_user ON activities (user)",
        "CREATE INDEX idx_activities_client ON activities (client)",
      ],
    });

    app.save(collection);
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId("activities"));
  },
);
