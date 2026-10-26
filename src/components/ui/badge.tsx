import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex h-5 items-center gap-1 rounded-[5px] px-1.5 text-[11.5px] font-medium",
  {
    variants: {
      variant: {
        default: "bg-heading text-card",
        secondary: "bg-wash text-tertiary",
        destructive: "bg-[color-mix(in_srgb,var(--cal-accent)_12%,transparent)] text-(--cal-accent-strong)",
        outline: "border border-line text-ink",
        chip: "bg-wash text-[11px] font-semibold text-ink tnum",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type BadgeProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
