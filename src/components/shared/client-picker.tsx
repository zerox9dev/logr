import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useT } from "@/i18n";
import type { Client } from "@/types/database";

/** Client picker — Radix DropdownMenu over existing clients. */
export function ClientPicker({
  clients, onChange, trigger,
}: {
  clients: Client[];
  onChange: (id: string) => void;
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
          className="app-portal z-[60] max-h-[240px] min-w-[220px] max-w-[320px] overflow-auto rounded-lg border border-(--cal-raised-line) bg-popover p-1 shadow-dropdown"
        >
          {clients.map((c) => (
            <DropdownMenu.Item key={c.id} className={item} onSelect={() => onChange(c.id)}>
              {c.name}
            </DropdownMenu.Item>
          ))}
          {clients.length === 0 && (
            <span className="block px-3 py-2 text-md text-muted-foreground">{t("new.noClientsYet")}</span>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
