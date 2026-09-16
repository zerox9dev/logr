import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const emptyStateVariants = cva(
  "flex flex-col items-center justify-center rounded-lg border border-dashed border-line",
  {
    variants: {
      size: {
        default: "p-7 lg:p-20",
        compact: "p-7",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

const emptyStateMediaVariants = cva(
  "flex shrink-0 items-center justify-center rounded-full bg-muted text-ink",
  {
    variants: {
      size: {
        default: "size-[72px] [&_svg]:size-10",
        compact: "size-14 [&_svg]:size-7",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

type EmptyStateProps = React.ComponentProps<"div"> &
  VariantProps<typeof emptyStateVariants> & {
    icon?: LucideIcon;
    avatar?: React.ReactNode;
    headline: string;
    description?: React.ReactNode;
    action?: React.ReactNode;
  };

/** The one empty-state treatment in /app: dashed frame, round icon tile,
 *  headline, optional description and a single action. */
function EmptyState({
  icon: Icon,
  avatar,
  headline,
  description,
  action,
  size,
  className,
  ...props
}: EmptyStateProps) {
  const media = avatar ?? (Icon ? <Icon strokeWidth={1.3} aria-hidden="true" /> : null);

  return (
    <div data-slot="empty-state" className={cn(emptyStateVariants({ size, className }))} {...props}>
      {media && <div className={cn(emptyStateMediaVariants({ size }))}>{media}</div>}
      {/* The gap above the action is owned by whichever text block is last, so
          the spacing does not change when the description is omitted. */}
      <p className={cn("mt-6 text-center text-xl font-semibold text-heading", !description && action && "mb-8")}>
        {headline}
      </p>
      {description && (
        <p className={cn("mt-3 max-w-[420px] text-center text-md text-muted-foreground", action && "mb-8")}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

export { EmptyState, emptyStateVariants };
