/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");

    const collection = new Collection({
      type: "base",
      name: "jira_connections",
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
        { type: "text", name: "cloud_id", required: true },
        { type: "text", name: "site_name", required: false },
        { type: "text", name: "site_url", required: false },
        { type: "email", name: "atlassian_email", required: false },
        // Worklog listing is site-wide, so the sync keeps only the worklogs
        // authored by this account.
        { type: "text", name: "atlassian_account_id", required: false },
        { type: "text", name: "access_token", required: false },
        { type: "text", name: "refresh_token", required: false },
        { type: "date", name: "token_expires_at", required: false },
        { type: "date", name: "last_synced_at", required: false },
        { type: "autodate", name: "created", onCreate: true, onUpdate: false },
        { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
      ],
      indexes: ["CREATE UNIQUE INDEX idx_jira_connections_user ON jira_connections (user)"],
    });

    app.save(collection);
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId("jira_connections"));
  },
);
