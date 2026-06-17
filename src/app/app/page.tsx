import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";

// Auth-gated. The full dashboard is ported here in Phase 5; for now this
// proves the server-side session check + redirect work.
export default async function AppPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto flex min-h-screen max-w-[760px] flex-col items-start justify-center gap-4 px-6">
      <h1 className="text-4xl font-bold tracking-tight text-heading">Dashboard</h1>
      <p className="text-base text-tertiary">
        Signed in as <span className="font-medium text-ink">{user.email}</span>.
      </p>
      <p className="text-md text-muted-foreground">
        The full dashboard moves here in the next phase.
      </p>
    </main>
  );
}
