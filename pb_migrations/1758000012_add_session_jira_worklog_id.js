/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("sessions");

    collection.fields.add(new Field({ type: "text", name: "jira_worklog_id", required: false }));
    // Partial index: PocketBase stores a blank text field as "" rather than
    // NULL, so an unfiltered unique index would let only one non-Jira session
    // exist per user. The WHERE clause keeps the constraint on imported rows.
    collection.indexes = [
      ...collection.indexes,
      "CREATE UNIQUE INDEX idx_sessions_jira_worklog ON sessions (user, jira_worklog_id) WHERE jira_worklog_id != ''",
    ];

    app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("sessions");
    collection.indexes = collection.indexes.filter((idx) => !idx.includes("idx_sessions_jira_worklog"));
    collection.fields.removeByName("jira_worklog_id");
    app.save(collection);
  },
);
