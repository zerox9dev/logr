"use client";

import { toast as sonnerToast, Toaster } from "sonner";

// ─── Public API ──────────────────────────────────────────────────────────────
// Call sites do:  const { toast } = useToast(); toast("Saved", "success")
// Type must stay identical to the old implementation.

type ToastType = "success" | "error" | "info";

function toast(message: string, type?: ToastType) {
  switch (type) {
    case "error":
      sonnerToast.error(message);
      break;
    case "success":
      sonnerToast.success(message);
      break;
    default:
      sonnerToast(message);
  }
}

const toastApi = { toast } as const;

export function useToast() {
  return toastApi;
}

// ─── Provider ────────────────────────────────────────────────────────────────
// Monochrome logr look: white card, hairline border, soft shadow.
// A thin left accent bar marks type: green = success, red = error, muted = info/default.

const baseToast =
  "!rounded-none !bg-card !border !border-line !shadow-[0px_8px_30px_0px_rgba(0,0,0,0.12)] !text-ink !font-[inherit] !text-sm";

const successToast = `${baseToast} !border-l-2 !border-l-[color:var(--color-money,#22c55e)]`;
const errorToast   = `${baseToast} !border-l-2 !border-l-red-600`;
const infoToast    = `${baseToast} !border-l-2 !border-l-ink`;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        duration={3000}
        closeButton
        toastOptions={{
          unstyled: true,
          classNames: {
            toast: baseToast,
            title: "text-ink text-sm",
            description: "text-tertiary text-xs",
            closeButton:
              "!bg-transparent !border-none !text-tertiary hover:!text-ink",
            success: successToast,
            error:   errorToast,
            info:    infoToast,
          },
        }}
      />
    </>
  );
}
