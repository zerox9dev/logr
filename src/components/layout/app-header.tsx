"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Keyboard, Menu, PanelLeft, Plus, Search, X } from "lucide-react";
import { CommandPalette } from "@/components/layout/command-palette";
import { AccountMenu, isActive, NAV, UserAvatar } from "@/components/layout/app-rail";
import { useShell } from "@/components/layout/shell-context";
import { ProjectPicker } from "@/components/shared/project-picker";
import { Dialog } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/auth-context";
import { useAppData } from "@/contexts/data-context";
import { useTracker } from "@/contexts/tracker-context";
import { useSessionSuggestion } from "@/hooks/use-session-suggestion";
import { useT } from "@/i18n";
import { fmtClock } from "@/lib/format";
import { projectToneStyle } from "@/lib/project-tone";

const iconButton =
  "app-focus flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-tertiary transition-colors hover:bg-wash hover:text-heading [&_svg]:size-4";

/** Project chip · what you're doing · clock · Start/Stop — the timer, always in reach. */
function TimerControl() {
  const { projects } = useAppData();
  const tracker = useTracker();
  const t = useT();
  const name = tracker.project?.name ?? t("track.noProject");
  // Project guessed from what's typed: local history first, the LLM after.
  const { suggestion, dismiss } = useSessionSuggestion(tracker.description, tracker.projectId);

  return (
    <div className="relative min-w-0">
      <div
        className={`flex h-8 min-w-0 items-center gap-1 rounded-lg pr-0.5 pl-1 ring-1 transition-colors ${
          tracker.running ? "bg-[color-mix(in_srgb,var(--cal-accent)_7%,var(--cal-bg))] ring-(--cal-accent)/35" : "ring-line"
        }`}
      >
        <ProjectPicker
          onChange={tracker.setProjectId}
          projects={projects}
          trigger={
            <button
              type="button"
              aria-label={`${t("track.selectProject")}: ${name}`}
              className="app-focus flex h-6 max-w-[160px] min-w-0 cursor-pointer items-center gap-1.5 rounded-md px-1.5 text-[12.5px] font-medium text-heading transition-colors hover:bg-wash"
            >
              <span aria-hidden="true" style={projectToneStyle(tracker.projectId)} className="size-2 shrink-0 rounded-full bg-(--bar)" />
              <span className="truncate">{name}</span>
            </button>
          }
        />
        <input
          value={tracker.description}
          onChange={(e) => tracker.setDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !tracker.running) tracker.start();
          }}
          placeholder={t("track.workingPlaceholder")}
          aria-label={t("track.workingPlaceholder")}
          className="h-6 w-40 min-w-0 bg-transparent px-1.5 text-[12.5px] text-ink outline-none placeholder:text-placeholder max-xl:hidden"
        />
        <span
          role="timer"
          aria-label={t("track.timerAriaLabel").replace("{time}", fmtClock(tracker.seconds))}
          className={`px-1.5 text-[13px] font-semibold tnum ${tracker.running ? "text-heading" : "text-placeholder"}`}
        >
          {fmtClock(tracker.seconds)}
        </span>
        <button
          type="button"
          onClick={() => void tracker.toggle()}
          title={`${tracker.running ? t("track.stop") : t("track.start")} (S)`}
          className={`app-focus h-7 shrink-0 cursor-pointer rounded-md px-3 text-[12.5px] font-semibold text-white transition-colors ${
            tracker.running
              ? "bg-(--cal-accent-strong) hover:bg-[color-mix(in_srgb,var(--cal-accent-strong)_88%,#000)]"
              : "bg-money hover:bg-[color-mix(in_srgb,var(--color-money)_88%,#000)]"
          }`}
        >
          {tracker.running ? t("track.stop") : t("track.start")}
        </button>
      </div>
      {suggestion ? (
        <div className="app-pop-in absolute top-full left-0 z-40 mt-1.5 flex items-center gap-1 rounded-lg border border-(--cal-raised-line) bg-popover py-1 pr-1 pl-2 text-[12.5px] shadow-dropdown">
          <span aria-hidden="true">✨</span>
          <span className="text-tertiary">{t("track.suggestLabel")}:</span>
          <button
            type="button"
            onClick={() => {
              void tracker.setProjectId(suggestion.projectId);
              dismiss();
            }}
            aria-label={`${t("track.suggestApply")}: ${suggestion.projectName}`}
            className="app-focus flex h-6 cursor-pointer items-center gap-1.5 rounded-md px-1.5 font-medium text-heading hover:bg-wash"
          >
            <span aria-hidden="true" style={projectToneStyle(suggestion.projectId)} className="size-2 rounded-full bg-(--bar)" />
            {suggestion.projectName}
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label={t("track.suggestDismiss")}
            className="app-focus flex size-6 cursor-pointer items-center justify-center rounded-md text-tertiary hover:bg-wash hover:text-heading"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

const MOBILE_NAV = [...NAV, { href: "/app/settings", labelKey: "sidebar.settings", icon: NAV[0].icon }];

function MobileNav({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const pathname = usePathname();
  const t = useT();
  const { user } = useAuth();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="app-portal app-chrome w-64 gap-0 p-2">
        <SheetTitle className="px-2 py-2.5 text-[14px] font-semibold text-heading">logr.work</SheetTitle>
        <nav className="flex flex-col gap-0.5">
          {MOBILE_NAV.map(({ href, labelKey }) => (
            <Link
              key={href}
              href={href}
              onClick={() => onOpenChange(false)}
              aria-current={isActive(pathname, href) ? "page" : undefined}
              className="app-focus flex h-8 items-center rounded-md px-2 text-[13px] text-tertiary transition-colors hover:bg-wash hover:text-heading aria-[current=page]:bg-sidebar-accent aria-[current=page]:text-heading"
            >
              {t(labelKey)}
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <AccountMenu
            side="top"
            trigger={
              <button
                type="button"
                className="app-focus flex h-10 w-full items-center gap-2 rounded-md px-2 text-left text-[12.5px] text-tertiary hover:bg-wash"
              >
                <UserAvatar />
                <span className="truncate">{user?.email ?? t("nav.accountMenu")}</span>
              </button>
            }
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ShortcutsDialog() {
  const { shortcutsOpen, setShortcutsOpen } = useShell();
  const t = useT();
  const rows: [string[], string][] = [
    [["S"], t("keys.timer")],
    [["N"], t("keys.newEntry")],
    [["T"], t("keys.today")],
    [["←", "→"], t("keys.prevNext")],
    [["1", "3", "5", "7"], t("keys.days")],
    [["\\"], t("keys.panel")],
    [["⌘", "K"], t("keys.search")],
    [["?"], t("keys.help")],
  ];
  return (
    <Dialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} title={t("keys.title")}>
      <ul className="flex flex-col">
        {rows.map(([keys, label]) => (
          <li key={label} className="flex items-center justify-between border-b border-line py-2 text-[13px] last:border-b-0">
            <span className="text-ink">{label}</span>
            <span className="flex gap-1">
              {keys.map((k) => (
                <kbd
                  key={k}
                  className="flex h-6 min-w-6 items-center justify-center rounded-[5px] border border-line bg-wash px-1.5 font-sans text-[11.5px] font-medium text-ink"
                >
                  {k}
                </kbd>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </Dialog>
  );
}

/** Title bar over the main pane: panel toggle, the timer, new entry, search. */
export function AppHeader() {
  const t = useT();
  const shell = useShell();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  // Resolved after mount: `navigator` is server-unknown, and branching on it
  // during render makes the SSR markup disagree with hydration.
  const [isMac, setIsMac] = useState(false);
  const shortcutHint = isMac ? "⌘K" : "Ctrl K";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: the platform is unknown during SSR, so the sync happens after mount
    setIsMac(/Mac/i.test(navigator.platform || navigator.userAgent));
  }, []);

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
    <header className="sticky top-0 z-30 flex h-11 shrink-0 items-center gap-2 border-b border-line bg-card px-2.5">
      <button type="button" onClick={() => setNavOpen(true)} aria-label={t("nav.more")} className={`${iconButton} md:hidden`}>
        <Menu aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={shell.togglePanel}
        aria-label={t("panel.toggle")}
        aria-expanded={shell.panelOpen}
        title={`${t("panel.toggle")} (\\)`}
        className={`${iconButton} max-lg:hidden`}
      >
        <PanelLeft aria-hidden="true" />
      </button>

      <TimerControl />

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={() => shell.openNewEntry()}
          aria-label={t("cal.newEntry")}
          title={`${t("cal.newEntry")} (N)`}
          className={iconButton}
        >
          <Plus aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => shell.setShortcutsOpen(true)}
          aria-label={t("keys.title")}
          title={`${t("keys.title")} (?)`}
          className={`${iconButton} max-sm:hidden`}
        >
          <Keyboard aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={t("nav.search")}
          onClick={() => setPaletteOpen(true)}
          className="app-focus flex h-7 cursor-pointer items-center gap-2 rounded-md bg-wash pr-1.5 pl-2.5 text-[12.5px] text-tertiary transition-colors hover:bg-track hover:text-heading"
        >
          <Search className="size-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">{t("nav.search")}</span>
          <kbd className="hidden h-5 items-center rounded-[5px] border border-line bg-card px-1.5 font-sans text-[11px] font-medium text-tertiary sm:inline-flex tnum">
            {shortcutHint}
          </kbd>
        </button>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <MobileNav open={navOpen} onOpenChange={setNavOpen} />
      <ShortcutsDialog />
    </header>
  );
}
