import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useT } from "@/i18n";
import { projectToneStyle } from "@/lib/project-tone";
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
  const item = "flex min-h-7 cursor-pointer items-center truncate rounded-md px-2 py-1 text-[13px] text-ink outline-none data-[highlighted]:bg-wash";
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className="app-portal z-50 max-h-[260px] min-w-[200px] max-w-[280px] overflow-auto rounded-lg border border-(--cal-raised-line) bg-popover p-1 shadow-dropdown"
        >
          <DropdownMenu.Item className={item} onSelect={() => onChange(null)}>
            {t("track.noProject")}
          </DropdownMenu.Item>
          {projects.map((p) => (
            <DropdownMenu.Item key={p.id} className={`${item} gap-2`} onSelect={() => onChange(p.id)}>
              <span aria-hidden="true" style={projectToneStyle(p.id)} className="size-2 shrink-0 rounded-full bg-(--bar)" />
              <span className="truncate">{p.name}</span>
            </DropdownMenu.Item>
          ))}
          {projects.length === 0 && (
            <div className="px-3 py-2">
              <span className="block text-md text-muted-foreground">{t("track.noProjectsYet")}</span>
              <span className="block text-md-minus text-muted-foreground/70">{t("track.noProjectsHint")}</span>
            </div>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
