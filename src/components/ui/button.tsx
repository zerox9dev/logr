import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "unstyled";
  size?: "default" | "sm" | "lg" | "icon" | "unstyled";
}

// `cn` is a plain joiner (no tailwind-merge), so variant/size classes can't be
// safely overridden via className. For bespoke Figma styling use the "unstyled"
// variant + size and pass exact classes — the base only adds focus/disabled a11y.
const styled = "inline-flex items-center justify-center gap-2 font-medium";
const variantMap: Record<string, string> = {
  // Primary action = pure black (design rule).
  default: `${styled} bg-black text-card hover:bg-ink disabled:opacity-50`,
  destructive: `${styled} bg-red-600 text-card hover:bg-red-700 disabled:opacity-50`,
  outline: `${styled} border border-line bg-card text-ink hover:bg-wash disabled:opacity-50`,
  secondary: `${styled} bg-wash text-ink hover:bg-wash disabled:opacity-50`,
  ghost: `${styled} bg-transparent text-ink hover:bg-wash disabled:opacity-50`,
  link: `${styled} bg-transparent text-ink underline-offset-4 hover:underline`,
  unstyled: "",
};

const sizeMap: Record<string, string> = {
  default: "h-9 px-4 text-md",
  sm: "h-8 px-3 text-md-minus",
  lg: "h-12 px-6 text-base",
  icon: "size-9",
  unstyled: "",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "transition-colors disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1",
        variantMap[variant],
        sizeMap[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button };
