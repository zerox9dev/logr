import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-xs px-2 py-0.5 text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-ink text-card",
        secondary: "bg-wash text-tertiary",
        destructive: "bg-red-50 text-red-700",
        outline: "border border-line text-ink",
        chip: "bg-page text-sm-minus font-semibold text-brand-ink tnum",
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
