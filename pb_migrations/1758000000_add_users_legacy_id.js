/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");

    users.fields.add(
      new TextField({
        name: "legacy_id",
        required: false,
      }),
    );

    app.save(users);
  },
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    users.fields.removeByName("legacy_id");
    app.save(users);
  },
);
