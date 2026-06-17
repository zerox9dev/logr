import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useT } from "@/i18n";
import type { Project } from "@/types/database";

/** Project picker — Radix DropdownMenu listing all projects (+ "No project"). */
export function ProjectPicker({
  onChange, projects, trigger,
}: {
  onChange: (id: string | null) => void;
  projects: Project[];
  trigger: React.ReactNode;
}) {
  const t = useT();
  const item = "cursor-pointer truncate px-3 py-2 text-md text-ink outline-none data-[highlighted]:bg-wash";
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className="z-50 max-h-[260px] min-w-[200px] max-w-[280px] overflow-auto border border-line bg-card py-1 shadow-[0px_8px_30px_0px_rgba(0,0,0,0.12)]"
        >
          <DropdownMenu.Item className={item} onSelect={() => onChange(null)}>
            {t("track.noProject")}
          </DropdownMenu.Item>
          {projects.map((p) => (
            <DropdownMenu.Item key={p.id} className={item} onSelect={() => onChange(p.id)}>
              {p.name}
            </DropdownMenu.Item>
          ))}
          {projects.length === 0 && (
            <div className="px-3 py-2">
              <span className="block text-md text-muted">{t("track.noProjectsYet")}</span>
              <span className="block text-md-minus text-muted/70">{t("track.noProjectsHint")}</span>
            </div>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
