import Link from "next/link";
import type { Post } from "@/data/posts";
import { Band } from "./band";

/** Three posts across, divided by hairlines — the home page and "Keep reading". */
export function PostCards({ posts }: { posts: Post[] }) {
  return (
    <Band className="grid gap-px bg-heading/8 md:grid-cols-3">
      {posts.map((p) => (
        <Link
          key={p.slug}
          href={`/blog/${p.slug}`}
          className="flex flex-col gap-3 bg-white px-6 py-8 transition-colors hover:bg-heading/[0.02] md:px-8"
        >
          <span className="font-mono text-[11px] font-medium tracking-[0.08em] text-heading/45 uppercase">
            {p.category}
          </span>
          <h3 className="text-[18px] leading-[1.3] font-semibold tracking-[-0.02em]">{p.title}</h3>
          <p className="text-[14px] leading-[1.55] text-heading/60">{p.description}</p>
          <span className="mt-auto pt-2 text-[13px] text-heading/45">{p.readingMinutes} min read</span>
        </Link>
      ))}
    </Band>
  );
}

/** Eyebrow + title on the left, a link on the right — the head of a post row. */
export function RowHeading({
  eyebrow,
  title,
  link,
}: {
  eyebrow: string;
  title: string;
  link?: { href: string; label: string };
}) {
  return (
    <Band className="flex flex-wrap items-end justify-between gap-4 px-6 py-16 md:px-10">
      <div>
        <p className="font-mono text-[12px] font-medium tracking-[0.08em] text-coral uppercase">{eyebrow}</p>
        <h2 className="mt-3 text-[32px] leading-[1.05] font-semibold tracking-[-0.035em] sm:text-[36px]">{title}</h2>
      </div>
      {link ? (
        <Link
          href={link.href}
          className="text-[14px] font-medium text-heading underline decoration-heading/20 underline-offset-4 hover:decoration-heading"
        >
          {link.label}
        </Link>
      ) : null}
    </Band>
  );
}
