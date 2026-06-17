import { Button } from "@/components/ui/button";

// Phase 1 placeholder landing — proves Next SSR + shadcn (skinned) render.
// Replaced by the real SSR marketing landing in Phase 3.
export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[760px] flex-col items-start justify-center gap-6 px-6">
      <h1 className="text-hero font-extrabold tracking-tight text-heading">Logr</h1>
      <p className="text-lg text-tertiary">
        Open-source, self-hostable time tracking with built-in invoicing.
      </p>
      <div className="flex gap-3">
        <Button>Get started</Button>
        <Button variant="outline">View on GitHub</Button>
      </div>
    </main>
  );
}
