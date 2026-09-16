"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Check,
  ChevronsUpDown,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Timer,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { useAppData } from "@/contexts/data-context";
import { useLang, useT, LANGS, LANG_LABELS } from "@/i18n";

const NAV = [
  { href: "/app", labelKey: "sidebar.dashboard", icon: LayoutDashboard },
  { href: "/app/projects", labelKey: "sidebar.projects", icon: FolderKanban },
  { href: "/app/sessions", labelKey: "sidebar.sessions", icon: Timer },
  { href: "/app/clients", labelKey: "sidebar.clients", icon: Users },
  { href: "/app/invoices", labelKey: "sidebar.invoices", icon: FileText },
  { href: "/app/reports", labelKey: "sidebar.reports", icon: FileText },
  { href: "/app/settings", labelKey: "sidebar.settings", icon: Settings },
] as const;

/** Initials from a name ("Ada Lovelace" → "AL") or email ("a@x" → "A"). */
function initials(name: string): string {
  const parts = name.trim().split(/[\s.@]+/).filter(Boolean);
  return (parts.slice(0, 2).map((p) => p[0]).join("") || "?").toUpperCase();
}

export function AppSidebar() {
  const pathname = usePathname();
  const t = useT();
  const { lang, setLang } = useLang();
  const { user, signOut } = useAuth();
  const { settings } = useAppData();
  const { setOpenMobile } = useSidebar();

  const label = settings?.full_name || user?.email || "";
  const email = user?.email ?? "";

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <span aria-hidden="true" className="flex items-end gap-[2px]">
            <span className="h-[7px] w-[3px] bg-sidebar-foreground" />
            <span className="h-[11px] w-[3px] bg-sidebar-foreground" />
            <span className="h-[8px] w-[3px] bg-sidebar-foreground" />
            <span className="h-[15px] w-[3px] bg-sidebar-foreground" />
          </span>
          <span className="text-lg font-bold tracking-[-0.3px] text-sidebar-foreground">logr.work</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map(({ href, labelKey, icon: Icon }) => {
                const active = href === "/app" ? pathname === "/app" : pathname.startsWith(href);
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={t(labelKey)}
                      className="app-press! app-focus-invert h-10 rounded-sm"
                    >
                      {/* The off-canvas sheet has no route awareness of its own,
                          so a tap would navigate and leave the menu covering the
                          page it just opened. */}
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpenMobile(false)}
                      >
                        <Icon aria-hidden="true" />
                        <span>{t(labelKey)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <SidebarMenuButton
                  size="lg"
                  aria-label={t("nav.accountMenu")}
                  className="app-press! app-focus-invert rounded-sm"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-purple-dark text-md-minus font-semibold text-card">
                    {initials(label)}
                  </span>
                  <span className="grid flex-1 text-left leading-tight">
                    {settings?.full_name && (
                      <span className="truncate text-md font-medium text-sidebar-foreground">
                        {settings.full_name}
                      </span>
                    )}
                    <span className="truncate text-md-minus text-muted-foreground">{email}</span>
                  </span>
                  <ChevronsUpDown className="ml-auto" aria-hidden="true" />
                </SidebarMenuButton>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  side="top"
                  align="start"
                  sideOffset={8}
                  className="app-portal z-50 min-w-[220px] rounded-md bg-card p-1 shadow-md"
                >
                  {LANGS.map((l) => (
                    <DropdownMenu.Item
                      key={l}
                      className="app-motion flex min-h-9 cursor-pointer items-center justify-between rounded-xs px-3 py-2 text-md text-ink outline-none data-[highlighted]:bg-wash"
                      onSelect={(e) => {
                        e.preventDefault();
                        setLang(l);
                      }}
                    >
                      {LANG_LABELS[l]}
                      {lang === l && <Check className="size-4 text-ink" />}
                    </DropdownMenu.Item>
                  ))}
                  <DropdownMenu.Separator className="my-1 h-px bg-line" />
                  <DropdownMenu.Item
                    className="app-motion flex min-h-9 cursor-pointer items-center rounded-xs px-3 py-2 text-md text-ink outline-none data-[highlighted]:bg-wash"
                    onSelect={() => signOut()}
                  >
                    {t("nav.signOut")}
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
