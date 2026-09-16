import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, posts, postsByDate } from "@/data/posts";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.seoTitle ?? `${post.title} — Logr`,
    description: post.description,
    alternates: { canonical: `https://logr.work/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.seoTitle ?? post.title,
      description: post.description,
      url: `https://logr.work/blog/${post.slug}`,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
    },
  };
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const { default: Article } = await post.load();

  const related = postsByDate.filter((p) => p.slug !== post.slug).slice(0, 3);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.seoTitle ?? post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://logr.work/blog/${post.slug}`,
    },
    author: { "@type": "Organization", name: "Logr", url: "https://logr.work" },
    publisher: { "@type": "Organization", name: "Logr", url: "https://logr.work" },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://logr.work" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://logr.work/blog" },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://logr.work/blog/${post.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="text-md text-tertiary flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span>›</span>
        <Link href="/blog" className="hover:text-ink">Blog</Link>
        <span>›</span>
        <span className="text-ink">{post.category}</span>
      </nav>

      {/* Article */}
      <article className="bg-card border border-line p-8 sm:p-12 flex flex-col">
        <div className="flex items-center gap-3 text-md-minus text-tertiary">
          <span className="font-medium text-dark-1">{post.category}</span>
          <span>·</span>
          <time dateTime={post.date}>{DATE_FORMAT.format(new Date(post.date))}</time>
          <span>·</span>
          <span>{post.readingMinutes} min read</span>
        </div>

        <h1 className="mt-5 text-[32px] sm:text-[40px] font-bold text-heading leading-[1.1] tracking-[-0.5px]">
          {post.title}
        </h1>

        <p className="mt-5 text-base text-tertiary leading-relaxed max-w-[640px]">
          {post.description}
        </p>

        <hr className="mt-8 border-line" />

        <div className="mt-2">
          <Article />
        </div>
      </article>

      {/* CTA */}
      <div className="bg-card border border-line p-8 sm:p-12 flex flex-col sm:flex-row gap-5 items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold text-heading">
            Turn tracked hours into a paid invoice
          </span>
          <span className="text-md text-tertiary">
            Logr does both in one fast workspace. Free forever, or self-host it.
          </span>
        </div>
        <div className="flex gap-3 flex-wrap shrink-0">
          <Link
            href="/login"
            className="bg-ink text-white px-6 py-3 text-base font-semibold whitespace-nowrap"
          >
            Start tracking — free
          </Link>
          <a
            href="https://github.com/zerox9dev/logr"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-line-2 bg-card px-6 py-3 text-base font-medium text-heading whitespace-nowrap"
          >
            View on GitHub
          </a>
        </div>
      </div>

      {/* Related */}
      <div className="bg-card border border-line p-8 sm:p-12 flex flex-col gap-5">
        <h2 className="text-xl font-semibold text-heading">Keep reading</h2>
        <div className="flex flex-col gap-4">
          {related.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="flex flex-col gap-1 border-b border-line last:border-b-0 pb-4 last:pb-0 hover:opacity-80 transition-opacity"
            >
              <span className="text-md-minus text-tertiary">{p.category}</span>
              <span className="text-base font-semibold text-heading">{p.title}</span>
              <span className="text-md text-tertiary leading-relaxed">{p.description}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
