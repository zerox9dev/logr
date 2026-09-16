"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/format";
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  aria-label={t("nav.accountMenu")}
                  className="app-press! app-focus-invert rounded-sm"
                >
                  <Avatar size="md">
                    <AvatarFallback className="bg-purple-dark text-card">{initials(label)}</AvatarFallback>
                  </Avatar>
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
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" sideOffset={8}>
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
                <DropdownMenuItem onSelect={() => signOut()}>{t("nav.signOut")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
