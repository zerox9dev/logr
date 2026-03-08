/** Simple class name joiner — replaces clsx + tailwind-merge */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}
