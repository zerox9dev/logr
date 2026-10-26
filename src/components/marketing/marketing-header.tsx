import Link from "next/link";

export function LogrMark({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`flex items-end gap-[2px] ${className ?? ""}`}>
      <span className="h-[7px] w-[3px] rounded-[1px] bg-heading" />
      <span className="h-[11px] w-[3px] rounded-[1px] bg-heading" />
      <span className="h-[8px] w-[3px] rounded-[1px] bg-heading" />
      <span className="h-[15px] w-[3px] rounded-[1px] bg-heading" />
    </span>
  );
}

export function LogrLogo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="logr.work home">
      <LogrMark />
      <span className="text-[17px] font-semibold tracking-[-0.02em] text-heading">logr.work</span>
    </Link>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-[14px] font-medium text-heading/60 transition-colors hover:text-heading">
      {children}
    </Link>
  );
}

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-heading/8 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1080px] items-center justify-between px-6 md:px-10">
        <LogrLogo />
        <nav className="hidden items-center gap-7 md:flex">
          <NavLink href="/#features">Features</NavLink>
          <NavLink href="/#pricing">Pricing</NavLink>
          <NavLink href="/blog">Blog</NavLink>
          <NavLink href="/alternatives">Alternatives</NavLink>
          <NavLink href="/#faq">FAQ</NavLink>
        </nav>
        <Link
          href="/login"
          className="flex h-9 items-center rounded-full bg-heading px-4 text-[14px] font-medium text-white transition-opacity hover:opacity-85"
        >
          Sign in
        </Link>
      </div>
    </header>
  );
}
