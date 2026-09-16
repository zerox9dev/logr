/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");

    const collection = new Collection({
      type: "base",
      name: "clients",
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
        { type: "text", name: "name", required: true },
        { type: "email", name: "email", required: false },
        { type: "text", name: "phone", required: false },
        { type: "text", name: "company", required: false },
        { type: "text", name: "address", required: false },
        { type: "text", name: "country", required: false },
        { type: "text", name: "website", required: false },
        { type: "json", name: "tags", required: false, maxSize: 200000 },
        { type: "text", name: "notes", required: false },
        { type: "text", name: "legacy_id", required: false },
        { type: "date", name: "original_created_at", required: false },
        { type: "date", name: "original_updated_at", required: false },
        { type: "autodate", name: "created", onCreate: true, onUpdate: false },
        { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
      ],
      indexes: ["CREATE INDEX idx_clients_user ON clients (user)"],
    });

    app.save(collection);
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId("clients"));
  },
);
