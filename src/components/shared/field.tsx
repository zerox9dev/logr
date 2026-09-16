/** Labelled form field — stacked label + control, used by the create dialogs. */
export function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-md-minus text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
