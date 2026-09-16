"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FormFieldProps = {
  label: React.ReactNode;
  children: React.ReactNode;
  /** Explicit control id. Omit it and one is generated and injected. */
  id?: string;
  required?: boolean;
  error?: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
};

/** Label + control + error/hint. Replaces the ad-hoc label/input pairs the
 *  dialogs used to hand-roll. Not react-hook-form bound — every form in /app
 *  is plain controlled state. */
function FormField({ label, children, id, required, error, hint, className }: FormFieldProps) {
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;

  // The control arrives as a child, so `htmlFor` can only be wired up by
  // injecting the id here — otherwise every call site has to invent one, which
  // is exactly the boilerplate this wrapper exists to remove.
  const control =
    React.isValidElement<{ id?: string }>(children) && children.props.id === undefined
      ? React.cloneElement(children, { id: fieldId })
      : children;

  return (
    <div data-slot="form-field" className={cn("space-y-2", className)}>
      <Label htmlFor={fieldId} className="gap-1 text-md-minus text-muted-foreground">
        {label}
        {required && (
          <span aria-hidden="true" className="font-medium">
            *
          </span>
        )}
      </Label>
      {control}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {hint && !error && <p className="text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

export { FormField };
