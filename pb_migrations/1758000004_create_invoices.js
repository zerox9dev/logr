/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    const clients = app.findCollectionByNameOrId("clients");

    const collection = new Collection({
      type: "base",
      name: "invoices",
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
          cascadeDelete: false,
          maxSelect: 1,
        },
        { type: "text", name: "invoice_number", required: true },
        // PocketBase treats 0 as blank on a required number field, so these
        // stay optional to keep zero-total drafts saveable.
        { type: "number", name: "subtotal", required: false },
        { type: "number", name: "tax_rate", required: false },
        { type: "number", name: "tax_amount", required: false },
        { type: "number", name: "total", required: false },
        { type: "text", name: "currency", required: true },
        {
          type: "select",
          name: "status",
          required: true,
          maxSelect: 1,
          values: ["draft", "sent", "paid", "overdue"],
        },
        { type: "date", name: "due_date", required: false },
        { type: "date", name: "sent_at", required: false },
        { type: "date", name: "paid_at", required: false },
        { type: "text", name: "notes", required: false },
        { type: "text", name: "legacy_id", required: false },
        { type: "date", name: "original_created_at", required: false },
        { type: "autodate", name: "created", onCreate: true, onUpdate: false },
        { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE INDEX idx_invoices_user ON invoices (user)",
        "CREATE INDEX idx_invoices_client ON invoices (client)",
      ],
    });

    app.save(collection);
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId("invoices"));
  },
);
