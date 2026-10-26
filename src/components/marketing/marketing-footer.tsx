import Link from "next/link";
import { Band } from "./band";
import { LogrLogo } from "./marketing-header";

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[12px] font-medium tracking-[0.08em] text-heading/45 uppercase">{title}</p>
      <ul className="mt-4 flex flex-col gap-3 text-[14px] text-heading/55">{children}</ul>
    </div>
  );
}

function Item({ href, children }: { href: string; children: React.ReactNode }) {
  const className = "transition-colors hover:text-heading";
  return (
    <li>
      {href.startsWith("http") ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
          {children}
        </a>
      ) : (
        <Link href={href} className={className}>
          {children}
        </Link>
      )}
    </li>
  );
}

export function MarketingFooter() {
  return (
    <footer>
      <Band className="grid gap-10 px-6 py-16 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-10">
        <div>
          <LogrLogo />
          <p className="mt-4 max-w-[260px] text-[14px] leading-[1.55] text-heading/55">
            Open-source time tracking and invoicing for freelancers and agencies.
          </p>
        </div>
        <Column title="Product">
          <Item href="/#features">Features</Item>
          <Item href="/#pricing">Pricing</Item>
          <Item href="/#self-host">Self-hosting</Item>
          <Item href="/#faq">FAQ</Item>
        </Column>
        <Column title="Resources">
          <Item href="/blog">Blog</Item>
          <Item href="/alternatives">Alternatives</Item>
          <Item href="https://github.com/zerox9dev/logr">GitHub</Item>
          <Item href="/login">Sign in</Item>
        </Column>
        <Column title="Legal">
          <Item href="/privacy">Privacy</Item>
          <Item href="/terms">Terms</Item>
        </Column>
      </Band>
      <Band className="px-6 py-6 text-[13px] text-heading/45 md:px-10">© 2026 logr.work</Band>
    </footer>
  );
}
