import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPage } from "@/components/marketing/marketing-page";
import { PillLink } from "@/components/marketing/primitives";
import { LogrMark } from "@/components/marketing/marketing-header";

export const metadata: Metadata = {
  title: "Page not found — Logr",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <MarketingPage footer={false}>
      <section className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-6 py-20">
        <div className="w-full max-w-[400px]">
          <LogrMark className="scale-[2.2] origin-bottom-left" />
          <p className="mt-10 font-mono text-[13px] font-medium tracking-[0.08em] text-heading/55">404</p>
          <h1 className="mt-2 text-[28px] leading-[1.15] font-semibold tracking-[-0.03em]">
            That page could not be found.
          </h1>
          <p className="mt-3 text-[15px] leading-[1.55] text-heading/60">
            The address may be wrong, or the page may have moved.
          </p>
          <div className="mt-8 flex flex-col">
            <PillLink href="/">Go to the home page</PillLink>
          </div>
          <p className="mt-5 text-[14px] text-heading/55">
            Looking for a guide?{" "}
            <Link
              href="/blog"
              className="font-medium text-heading underline decoration-heading/20 underline-offset-4 hover:decoration-heading"
            >
              Read the blog
            </Link>
          </p>
        </div>
      </section>
    </MarketingPage>
  );
}
