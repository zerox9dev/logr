import s from "./badge.module.css";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

const variantMap: Record<string, string> = {
  default: s.default,
  secondary: s.secondary,
  destructive: s.destructive,
  outline: s.outline,
};

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const cls = [s.badge, variantMap[variant], className].filter(Boolean).join(" ");
  return <div className={cls} {...props} />;
}

export { Badge };
