"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  FileText,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/auth-context";
import { useAppData } from "@/contexts/data-context";
import { LANG_LABELS, LANGS, useLang, useT } from "@/i18n";
import { initials } from "@/lib/format";
import { useTheme, type ThemePref } from "@/lib/theme";

export const NAV: readonly { href: string; labelKey: string; icon: LucideIcon }[] = [
  { href: "/app", labelKey: "nav.calendar", icon: CalendarDays },
  { href: "/app/overview", labelKey: "nav.overview", icon: LayoutDashboard },
  { href: "/app/sessions", labelKey: "sidebar.sessions", icon: ListChecks },
  { href: "/app/projects", labelKey: "sidebar.projects", icon: FolderKanban },
  { href: "/app/clients", labelKey: "sidebar.clients", icon: Users },
  { href: "/app/invoices", labelKey: "sidebar.invoices", icon: FileText },
  { href: "/app/reports", labelKey: "sidebar.reports", icon: BarChart3 },
];

export function isActive(pathname: string, href: string) {
  return href === "/app" ? pathname === "/app" : pathname.startsWith(href);
}

const THEMES = [
  { value: "light", labelKey: "nav.themeLight" },
  { value: "dark", labelKey: "nav.themeDark" },
  { value: "system", labelKey: "nav.themeSystem" },
] as const satisfies readonly { value: ThemePref; labelKey: string }[];

const railButton =
  "app-focus flex size-9 items-center justify-center rounded-lg text-tertiary transition-colors hover:bg-wash hover:text-heading aria-[current=page]:bg-sidebar-accent aria-[current=page]:text-heading [&_svg]:size-[18px]";

function RailLink({ href, label, icon: Icon, current }: { href: string; label: string; icon: LucideIcon; current: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={href} aria-label={label} aria-current={current ? "page" : undefined} className={railButton}>
          <Icon aria-hidden="true" />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

/** Account menu: language, theme, sign out. Shared by the rail and the mobile sheet. */
export function AccountMenu({ trigger, side = "right" }: { trigger: React.ReactNode; side?: "right" | "top" }) {
  const t = useT();
  const { lang, setLang } = useLang();
  const { signOut } = useAuth();
  const { pref, setPref } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent side={side} align="end" sideOffset={8}>
        {LANGS.map((l) => (
          <DropdownMenuCheckboxItem
            key={l}
            checked={lang === l}
            onSelect={(e) => {
              e.preventDefault();
              setLang(l);
            }}
          >
            {LANG_LABELS[l]}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t("nav.theme")}</DropdownMenuLabel>
        {THEMES.map(({ value, labelKey }) => (
          <DropdownMenuCheckboxItem
            key={value}
            checked={pref === value}
            onSelect={(e) => {
              e.preventDefault();
              setPref(value);
            }}
          >
            {t(labelKey)}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => signOut()}>{t("nav.signOut")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UserAvatar() {
  const { user } = useAuth();
  const { settings } = useAppData();
  return (
    <Avatar size="sm">
      <AvatarFallback className="bg-(--cal-accent) text-[11px] font-semibold text-white">
        {initials(settings?.full_name || user?.email || "")}
      </AvatarFallback>
    </Avatar>
  );
}

/** The 48px icon column down the left edge — every section one click away. */
export function AppRail() {
  const pathname = usePathname();
  const t = useT();
  return (
    <nav
      aria-label={t("nav.sections")}
      className="app-chrome flex w-12 shrink-0 flex-col items-center gap-1 border-r border-line py-2.5 max-md:hidden"
    >
      <Link href="/app" aria-label="logr.work" className="mb-2 flex size-9 items-center justify-center">
        <span aria-hidden="true" className="flex items-end gap-[2px]">
          <span className="h-[6px] w-[3px] rounded-[1px] bg-heading" />
          <span className="h-[10px] w-[3px] rounded-[1px] bg-heading" />
          <span className="h-[7px] w-[3px] rounded-[1px] bg-heading" />
          <span className="h-[13px] w-[3px] rounded-[1px] bg-heading" />
        </span>
      </Link>
      {NAV.map(({ href, labelKey, icon }) => (
        <RailLink key={href} href={href} label={t(labelKey)} icon={icon} current={isActive(pathname, href)} />
      ))}
      <div className="mt-auto flex flex-col items-center gap-1">
        <RailLink
          href="/app/settings"
          label={t("sidebar.settings")}
          icon={Settings}
          current={isActive(pathname, "/app/settings")}
        />
        <AccountMenu
          trigger={
            <button type="button" aria-label={t("nav.accountMenu")} className={railButton}>
              <UserAvatar />
            </button>
          }
        />
      </div>
    </nav>
  );
}
