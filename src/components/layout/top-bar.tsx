import { useEffect, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewMenu } from "@/components/dashboard/new-menu";
import { CommandPalette } from "@/components/layout/command-palette";
import { ImportDialog } from "@/components/dashboard/import-dialog";
import { useAuth } from "@/lib/auth-context";
import { useAppData } from "@/lib/data-context";
import { useLang, useT, LANGS, LANG_LABELS } from "@/lib/i18n";

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
  const { lang, setLang } = useLang();
  const t = useT();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const label = settings?.full_name || user?.email || "";
  const email = user?.email ?? "";

  // Detect macOS to show ⌘K vs Ctrl K.
  const isMac = /Mac/i.test(
    typeof navigator !== "undefined" ? (navigator.platform || navigator.userAgent) : "",
  );
  const shortcutHint = isMac ? "⌘K" : "Ctrl K";

  // Global ⌘K / Ctrl-K opens the command palette.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-card px-3 sm:px-8 lg:px-35">
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
          aria-label={t("nav.search")}
          onClick={() => setPaletteOpen(true)}
          className="flex items-center gap-5 bg-wash px-3 py-2 text-tertiary hover:bg-wash"
        >
          {/* Mobile (<sm): show a Search icon instead of the shortcut hint */}
          <Search className="size-4 sm:hidden" aria-hidden="true" />
          <span className="hidden text-md-minus sm:inline">{t("nav.search")}</span>
          <span className="hidden text-sm font-medium sm:inline tnum">{shortcutHint}</span>
        </Button>

        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

        <NewMenu />

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="unstyled"
              size="unstyled"
              aria-label={t("nav.accountMenu")}
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
              {LANGS.map((l) => (
                <DropdownMenu.Item
                  key={l}
                  className="flex cursor-pointer items-center justify-between px-3 py-2 text-md text-ink outline-none data-[highlighted]:bg-wash"
                  onSelect={(e) => { e.preventDefault(); setLang(l); }}
                >
                  {LANG_LABELS[l]}
                  {lang === l && <Check className="size-4 text-ink" />}
                </DropdownMenu.Item>
              ))}
              <DropdownMenu.Separator className="my-1 h-px bg-line" />
              <DropdownMenu.Item
                className="cursor-pointer px-3 py-2 text-md text-ink outline-none data-[highlighted]:bg-wash"
                onSelect={() => setImportOpen(true)}
              >
                {t("import.menuItem")}
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-line" />
              <DropdownMenu.Item
                className="cursor-pointer px-3 py-2 text-md text-ink outline-none data-[highlighted]:bg-wash"
                onSelect={() => signOut()}
              >
                {t("nav.signOut")}
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
    <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
    </>
  );
}
