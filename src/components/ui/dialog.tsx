import { X } from "lucide-react";
import { Button } from "./button";
import s from "./dialog.module.css";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  wide?: boolean;
  children: React.ReactNode;
}

export function Dialog({ open, onClose, title, wide, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className={s.overlay}>
      <div className={s.backdrop} onClick={onClose} />
      <div className={[s.panel, wide ? s.panelWide : ""].filter(Boolean).join(" ")}>
        <div className={s.header}>
          <h2 className={s.title}>{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X style={{ width: 16, height: 16 }} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
