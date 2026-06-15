import { useState, createContext, useContext, useCallback } from "react";
import * as RadixToast from "@radix-ui/react-toast";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  toast: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with its provider by design
export function useToast() {
  return useContext(ToastContext);
}

// Monochrome toasts; a thin left accent bar marks error (red) / success (green).
const accentMap: Record<Toast["type"], string> = {
  success: "border-l-accent",
  error: "border-l-red-600",
  info: "border-l-ink",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      <RadixToast.Provider swipeDirection="right" duration={3000}>
        {children}
        {toasts.map((t) => (
          <RadixToast.Root
            key={t.id}
            onOpenChange={(open) => { if (!open) removeToast(t.id); }}
            className={cn(
              "flex items-center justify-between gap-4 border border-line border-l-2 bg-card px-4 py-3 shadow-[0px_8px_30px_0px_rgba(0,0,0,0.12)] data-[state=open]:animate-slide-in-right",
              accentMap[t.type],
            )}
          >
            <RadixToast.Description className="text-md text-ink">{t.message}</RadixToast.Description>
            <RadixToast.Close aria-label="Dismiss" className="text-tertiary transition-colors hover:text-ink">
              <X className="size-3.5" />
            </RadixToast.Close>
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport className="fixed bottom-4 right-4 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2 outline-none" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}
