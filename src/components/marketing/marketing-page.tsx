import { Geist, Geist_Mono } from "next/font/google";
import { MarketingHeader } from "./marketing-header";
import { MarketingFooter } from "./marketing-footer";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

/** Page shell: fonts, the vertical rails, header and footer. */
export function MarketingPage({
  children,
  footer = true,
}: {
  children: React.ReactNode;
  footer?: boolean;
}) {
  return (
    <div
      className={`${geist.variable} ${geistMono.variable} marketing relative min-h-dvh overflow-x-clip bg-white [color-scheme:light] font-sans text-heading [--font-mono:var(--font-geist-mono),ui-monospace,monospace] [--font-sans:var(--font-geist),ui-sans-serif,system-ui,sans-serif]`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 z-30 w-full max-w-[1080px] -translate-x-1/2 border-x border-heading/8"
      />
      <MarketingHeader />
      <main>{children}</main>
      {footer ? <MarketingFooter /> : null}
    </div>
  );
}
