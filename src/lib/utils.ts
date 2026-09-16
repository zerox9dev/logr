import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// logr's type scale (globals.css @theme) uses names tailwind-merge does not
// recognise as sizes, so it files `text-md-minus` under text-*colour* and lets
// it drop a variant's real colour (`text-primary-foreground` vanishing behind
// `text-md-minus` on the active period tab). Registering the scale puts these
// back in the font-size group, where they only conflict with each other.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["sm-minus", "md-minus", "md", "widget", "summary", "hero"] },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
