import Link from "next/link";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-30 bg-card border-b border-line flex items-center justify-between px-5 sm:px-8 lg:px-16 h-14">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="flex items-end gap-[2px]">
          <span className="w-[3px] bg-ink h-[7px]" />
          <span className="w-[3px] bg-ink h-[11px]" />
          <span className="w-[3px] bg-ink h-[8px]" />
          <span className="w-[3px] bg-ink h-[15px]" />
        </div>
        <span className="text-[16px] font-bold tracking-[-0.3px] text-ink">logr.work</span>
      </Link>
      <div className="flex items-center gap-1.5">
        <Link
          href="/blog"
          className="hidden sm:block px-3 py-2 text-md font-medium text-tertiary hover:text-ink"
        >
          Blog
        </Link>
        <Link
          href="/alternatives"
          className="hidden sm:block px-3 py-2 text-md font-medium text-tertiary hover:text-ink"
        >
          Alternatives
        </Link>
        <Link href="/login" className="bg-ink text-white px-4 py-2 text-md font-medium">
          Get started
        </Link>
      </div>
    </header>
  );
}
