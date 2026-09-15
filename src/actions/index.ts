// Data layer barrel. Each namespace is a "use server" module, so client code
// calls these as Server Actions — PocketBase itself is never reachable from
// the browser (it may live on an internal-only host).

export * as settingsApi from "./settings";
export * as clientsApi from "./clients";
export * as projectsApi from "./projects";
export * as sessionsApi from "./sessions";
export * as invoicesApi from "./invoices";
export * as invoiceItemsApi from "./invoice-items";
export * as activitiesApi from "./activities";
