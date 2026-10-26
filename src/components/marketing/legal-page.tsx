import Link from "next/link";
import { Band } from "./band";
import { MarketingPage } from "./marketing-page";
import { PageHero } from "./primitives";

const DOCS = [
  { key: "privacy", label: "Privacy", href: "/privacy" },
  { key: "terms", label: "Terms", href: "/terms" },
] as const;

/** Privacy and Terms: a segmented switch between the two over one long column. */
export function LegalPage({
  current,
  title,
  lastUpdated,
  children,
}: {
  current: (typeof DOCS)[number]["key"];
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <MarketingPage>
      <PageHero
        title={title}
        above={
          <nav aria-label="Legal documents" className="flex w-fit rounded-full bg-heading/6 p-1">
            {DOCS.map((doc) => (
              <Link
                key={doc.key}
                href={doc.href}
                aria-current={doc.key === current ? "page" : undefined}
                className={`flex h-9 items-center rounded-full px-4 text-[14px] font-medium transition-colors ${
                  doc.key === current ? "bg-heading text-white" : "text-heading/55 hover:text-heading"
                }`}
              >
                {doc.label}
              </Link>
            ))}
          </nav>
        }
      >
        Last updated: {lastUpdated}
      </PageHero>
      <Band className="px-6 py-16 md:px-10">
        <div className="flex max-w-[720px] flex-col gap-10 text-[16px] leading-[1.7] text-heading/70 [&_a]:font-medium [&_a]:text-heading [&_a]:underline [&_a]:decoration-heading/20 [&_a]:underline-offset-4 [&_a:hover]:decoration-heading [&_h2]:text-[20px] [&_h2]:font-semibold [&_h2]:tracking-[-0.02em] [&_h2]:text-heading [&_section]:flex [&_section]:flex-col [&_section]:gap-3 [&_strong]:font-semibold [&_strong]:text-heading">
          {children}
        </div>
      </Band>
    </MarketingPage>
  );
}
