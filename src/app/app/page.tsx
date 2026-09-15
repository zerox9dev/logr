import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/pocketbase-server";
import { DashboardApp } from "./dashboard-app";

export default async function AppPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <DashboardApp />;
}
