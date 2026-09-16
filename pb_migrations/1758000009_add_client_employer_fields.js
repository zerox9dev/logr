/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("clients");

    // Optional so the rows that predate this migration stay valid; readers
    // default a blank `client_type` to "client".
    collection.fields.add(
      new Field({
        type: "select",
        name: "client_type",
        required: false,
        maxSelect: 1,
        values: ["client", "employer"],
      }),
    );
    collection.fields.add(new Field({ type: "number", name: "salary_amount", required: false }));
    collection.fields.add(
      new Field({
        type: "select",
        name: "salary_period",
        required: false,
        maxSelect: 1,
        values: ["hourly", "monthly", "annual"],
      }),
    );

    app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("clients");
    collection.fields.removeByName("client_type");
    collection.fields.removeByName("salary_amount");
    collection.fields.removeByName("salary_period");
    app.save(collection);
  },
);
