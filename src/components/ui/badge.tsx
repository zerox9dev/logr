import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

const variantMap: Record<string, string> = {
  default: "bg-ink text-card",
  secondary: "bg-wash text-tertiary",
  destructive: "bg-red-50 text-red-700",
  outline: "border border-line text-ink",
};

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-sm font-medium",
        variantMap[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
