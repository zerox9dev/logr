import * as React from "react";
import styles from "./input.module.css";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    const cls = [styles.input, className].filter(Boolean).join(" ");
    return <input type={type} className={cls} ref={ref} {...props} />;
  }
);
Input.displayName = "Input";

export { Input };
