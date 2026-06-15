import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { NewMenu } from "@/components/dashboard/new-menu";
import { useAuth } from "@/lib/auth-context";
import { useAppData } from "@/lib/data-context";

/** Initials from a name ("Vitaly Mirvald" → "VM") or email ("v@x" → "V"). */
function initials(name: string): string {
  const parts = name.trim().split(/[\s.@]+/).filter(Boolean);
  return (parts.slice(0, 2).map((p) => p[0]).join("") || "?").toUpperCase();
}

/** Top bar — 56px, full width, white, bottom hairline. Replaces the sidebar.
 *  Figma node 18:302. Logo · Search ⌘K · + New · account avatar. */
export function TopBar() {
  const { user, signOut } = useAuth();
  const { settings } = useAppData();

  const label = settings?.full_name || user?.email || "";
  const email = user?.email ?? "";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-card px-35">
      {/* Left: logo + wordmark */}
      <div className="flex items-center gap-2.5">
        <div className="relative size-6 bg-black">
          <span className="absolute left-2 top-[5px] h-2.5 w-[2px] bg-card" />
          <span className="absolute left-[12.5px] top-[5px] h-2.5 w-[2px] bg-card" />
        </div>
        <span className="text-lg font-semibold tracking-[-0.16px] text-ink">logr.work</span>
      </div>

      {/* Right cluster: search · + New · avatar */}
      <div className="flex items-center gap-3.5">
        <Button
          variant="unstyled"
          size="unstyled"
          disabled
          title="Search — coming soon"
          aria-label="Search (coming soon)"
          className="flex items-center gap-5 bg-wash px-3 py-2 text-tertiary disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span className="text-md-minus">Search</span>
          <span className="text-sm font-medium tnum">⌘K</span>
        </Button>

        <NewMenu />

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="unstyled"
              size="unstyled"
              aria-label="Account menu"
              className="flex size-[30px] items-center justify-center bg-ink text-sm-minus font-semibold text-card"
            >
              {initials(label)}
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="z-50 min-w-[220px] border border-line bg-card py-1 shadow-[0px_8px_30px_0px_rgba(0,0,0,0.12)]"
            >
              <div className="flex flex-col gap-0.5 px-3 py-2">
                {settings?.full_name && <span className="text-md font-medium text-heading">{settings.full_name}</span>}
                <span className="text-md-minus text-muted">{email}</span>
              </div>
              <DropdownMenu.Separator className="my-1 h-px bg-line" />
              <DropdownMenu.Item
                className="cursor-pointer px-3 py-2 text-md text-ink outline-none data-[highlighted]:bg-wash"
                onSelect={() => signOut()}
              >
                Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
