import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  wide?: boolean;
  children: React.ReactNode;
}

/** Centered modal — Radix Dialog (focus trap, Esc, scroll lock, a11y).
 *  Square card, hairline border, soft shadow (shadows only on overlays). */
export function Dialog({ open, onClose, title, wide, children }: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/35" />
        <RadixDialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 border border-line bg-card shadow-[0px_8px_30px_0px_rgba(0,0,0,0.12)] focus:outline-none",
            wide ? "max-w-[720px]" : "max-w-[480px]",
          )}
        >
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <RadixDialog.Title className="text-base font-semibold text-heading">{title}</RadixDialog.Title>
            <RadixDialog.Close aria-label="Close" className="flex size-8 items-center justify-center text-tertiary transition-colors hover:bg-wash hover:text-ink">
              <X className="size-4" />
            </RadixDialog.Close>
          </div>
          <div className="p-6">{children}</div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
