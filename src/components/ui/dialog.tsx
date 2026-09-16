import * as RadixDialog from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const dialogVariants = cva(
  "app-portal app-enter fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 rounded-lg bg-card shadow-lg focus:outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
  {
    variants: {
      size: {
        sm: "max-w-[420px]",
        default: "max-w-[480px]",
        md: "max-w-[640px]",
        lg: "max-w-[720px]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

interface DialogProps extends VariantProps<typeof dialogVariants> {
  open: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  children: React.ReactNode;
}

/** Centered modal — Radix Dialog (focus trap, Esc, scroll lock, a11y).
 *  Rounded card, hairline border, soft shadow (shadows only on overlays). */
export function Dialog({ open, onClose, title, size, className, children }: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="app-portal fixed inset-0 z-40 bg-black/35 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <RadixDialog.Content className={cn(dialogVariants({ size, className }))}>
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <RadixDialog.Title className="text-base font-semibold text-heading">{title}</RadixDialog.Title>
            <RadixDialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close">
                <X />
              </Button>
            </RadixDialog.Close>
          </div>
          <div className="p-6">{children}</div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

export { dialogVariants };
