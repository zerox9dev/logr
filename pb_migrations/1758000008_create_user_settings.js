/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");

    const collection = new Collection({
      type: "base",
      name: "user_settings",
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
        { type: "text", name: "full_name", required: false },
        { type: "text", name: "company", required: false },
        { type: "email", name: "email", required: false },
        { type: "text", name: "phone", required: false },
        { type: "text", name: "address", required: false },
        { type: "text", name: "default_currency", required: false },
        { type: "number", name: "default_rate", required: false },
        { type: "text", name: "logo_url", required: false },
        { type: "number", name: "weekly_goal_hours", required: false },
        { type: "text", name: "legacy_id", required: false },
        { type: "date", name: "original_created_at", required: false },
        { type: "date", name: "original_updated_at", required: false },
        { type: "autodate", name: "created", onCreate: true, onUpdate: false },
        { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
      ],
      indexes: ["CREATE UNIQUE INDEX idx_user_settings_user ON user_settings (user)"],
    });

    app.save(collection);
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId("user_settings"));
  },
);
