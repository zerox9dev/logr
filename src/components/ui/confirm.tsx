import { createContext, useContext, useState, useCallback } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Button } from "@/components/ui/button";
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
          <AlertDialog.Overlay className="app-portal fixed inset-0 z-40 bg-black/35" />
          <AlertDialog.Content className="app-portal fixed left-1/2 top-1/2 z-50 w-full max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card p-6 shadow-dropdown focus:outline-none">
            <AlertDialog.Title className="text-base font-semibold text-heading">{state.options.title}</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-md text-tertiary">{state.options.message}</AlertDialog.Description>
            <div className="mt-6 flex justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <Button variant="outline" size="lg">{t("confirm.cancel")}</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button
                  variant={state.options.destructive ? "danger" : "default"}
                  size="lg"
                  onClick={() => handleClose(true)}
                >
                  {state.options.confirmLabel || t("confirm.confirm")}
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </ConfirmContext.Provider>
  );
}
