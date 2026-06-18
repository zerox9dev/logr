import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { DashboardApp } from "./dashboard-app";

export default async function AppPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <DashboardApp />;
}
