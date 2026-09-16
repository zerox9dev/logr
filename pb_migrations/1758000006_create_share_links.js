/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const invoices = app.findCollectionByNameOrId("invoices");

    const collection = new Collection({
      type: "base",
      name: "share_links",
      listRule: "invoice.user = @request.auth.id",
      viewRule: "invoice.user = @request.auth.id",
      createRule: '@request.auth.id != "" && invoice.user = @request.auth.id',
      updateRule: "invoice.user = @request.auth.id",
      deleteRule: "invoice.user = @request.auth.id",
      fields: [
        {
          type: "relation",
          name: "invoice",
          required: true,
          collectionId: invoices.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { type: "text", name: "token", required: true },
        { type: "date", name: "expires_at", required: false },
        { type: "text", name: "legacy_id", required: false },
        { type: "date", name: "original_created_at", required: false },
        { type: "autodate", name: "created", onCreate: true, onUpdate: false },
        { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_share_links_token ON share_links (token)",
        "CREATE INDEX idx_share_links_invoice ON share_links (invoice)",
      ],
    });

    app.save(collection);
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId("share_links"));
  },
);
