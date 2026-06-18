import { createContext, useContext, useState, useCallback } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType>({
  confirm: () => Promise.resolve(false),
});

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const t = useT();
  const [state, setState] = useState<{
    open: boolean;
    options: ConfirmOptions;
    resolve: ((value: boolean) => void) | null;
  }>({ open: false, options: { title: "", message: "" }, resolve: null });

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ open: true, options, resolve });
    });
  }, []);

  const handleClose = (result: boolean) => {
    state.resolve?.(result);
    setState((prev) => ({ ...prev, open: false, resolve: null }));
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AlertDialog.Root open={state.open} onOpenChange={(o) => { if (!o) handleClose(false); }}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-40 bg-black/35" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-[420px] -translate-x-1/2 -translate-y-1/2 border border-line bg-card p-6 shadow-[0px_8px_30px_0px_rgba(0,0,0,0.12)] focus:outline-none">
            <AlertDialog.Title className="text-base font-semibold text-heading">{state.options.title}</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-md text-tertiary">{state.options.message}</AlertDialog.Description>
            <div className="mt-6 flex justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <button className="h-9 border border-line bg-card px-4 text-md font-medium text-ink transition-colors hover:bg-wash">
                  {t("confirm.cancel")}
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  onClick={() => handleClose(true)}
                  className={cn(
                    "h-9 px-4 text-md font-medium text-card transition-colors",
                    state.options.destructive ? "bg-red-600 hover:bg-red-700" : "bg-black hover:bg-ink",
                  )}
                >
                  {state.options.confirmLabel || t("confirm.confirm")}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </ConfirmContext.Provider>
  );
}
