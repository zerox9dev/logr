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
  const item = "cursor-pointer truncate px-3 py-2 text-md text-ink outline-none data-[highlighted]:bg-wash";
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className="z-[60] max-h-[240px] min-w-[220px] max-w-[320px] overflow-auto border border-line bg-card py-1 shadow-[0px_8px_30px_0px_rgba(0,0,0,0.12)]"
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
