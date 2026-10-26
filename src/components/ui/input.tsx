import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "w-full rounded-md text-ink placeholder:text-placeholder transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border border-line bg-card px-2.5 hover:border-gray-300 focus-visible:border-tertiary",
        ghost: "border-0 bg-transparent px-1",
      },
      inputSize: {
        default: "h-8 text-[13px]",
        lg: "h-9 text-[14px] font-medium placeholder:font-normal",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  },
);

type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof inputVariants>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, inputSize, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(inputVariants({ variant, inputSize, className }))}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input, inputVariants };
