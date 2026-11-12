/// <reference path="../pb_data/types.d.ts" />
// The create migrations declare `legacy_id` optional, but the production
// instance had it flipped to required, so every record created in the app
// (no legacy id) failed with "legacy_id cannot be blank". Bring every
// collection back in line with the declared schema.
const COLLECTIONS = [
  "clients",
  "projects",
  "sessions",
  "invoices",
  "invoice_items",
  "share_links",
  "activities",
  "user_settings",
];

migrate(
  (app) => {
    for (const name of COLLECTIONS) {
      const collection = app.findCollectionByNameOrId(name);
      const field = collection.fields.getByName("legacy_id");
      if (!field || !field.required) continue;
      field.required = false;
      app.save(collection);
    }
  },
  // No down step: optional is the declared schema, and making the field
  // required again would break record creation.
  () => {},
);
