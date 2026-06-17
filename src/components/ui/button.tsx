import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// shadcn/ui Button, skinned to logr tokens. Same variant/size API as the
// previous bespoke button (incl. "unstyled") so call sites are unchanged.
// With cn = tailwind-merge, className overrides win over the base — so
// "unstyled" callers that bring their own layout classes still win.
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 text-md font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-90",
        destructive: "bg-destructive text-white hover:opacity-90",
        outline: "border border-line bg-card text-ink hover:bg-wash",
        secondary: "bg-wash text-ink hover:bg-wash",
        ghost: "bg-transparent text-ink hover:bg-wash",
        link: "bg-transparent text-ink underline-offset-4 hover:underline",
        unstyled: "",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3 text-md-minus",
        lg: "h-12 px-6 text-base",
        icon: "size-9",
        unstyled: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}

export { Button, buttonVariants };
