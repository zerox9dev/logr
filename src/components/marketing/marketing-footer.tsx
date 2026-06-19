import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="bg-card border-t border-line-2 px-5 sm:px-8 lg:px-16 py-5 flex flex-col sm:flex-row gap-3 items-center justify-between text-md-minus text-tertiary">
      <span>© 2026 logr.work. All rights reserved.</span>
      <div className="flex gap-6">
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <a href="https://github.com/zerox9dev/logr" target="_blank" rel="noopener noreferrer">GitHub</a>
      </div>
    </footer>
  );
}
