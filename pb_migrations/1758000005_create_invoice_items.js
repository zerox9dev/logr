/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const invoices = app.findCollectionByNameOrId("invoices");
    const sessions = app.findCollectionByNameOrId("sessions");

    const collection = new Collection({
      type: "base",
      name: "invoice_items",
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
        {
          type: "relation",
          name: "session",
          required: false,
          collectionId: sessions.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { type: "text", name: "description", required: true },
        // PocketBase treats 0 as blank on a required number field, so these
        // stay optional to keep zero-amount line items saveable.
        { type: "number", name: "quantity", required: false },
        { type: "number", name: "rate", required: false },
        { type: "number", name: "amount", required: false },
        { type: "text", name: "legacy_id", required: false },
        { type: "autodate", name: "created", onCreate: true, onUpdate: false },
        { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
      ],
      indexes: ["CREATE INDEX idx_invoice_items_invoice ON invoice_items (invoice)"],
    });

    app.save(collection);
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId("invoice_items"));
  },
);
