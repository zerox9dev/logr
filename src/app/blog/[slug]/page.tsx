import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, posts, postsByDate } from "@/data/posts";
import { Band, Crumbs, CtaBand, PageHero } from "@/components/marketing/primitives";
import { PostCards, RowHeading } from "@/components/marketing/post-cards";

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

      <PageHero
        above={
          <Crumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Blog", href: "/blog" },
              { label: post.category },
            ]}
          />
        }
        eyebrow={post.category}
        title={post.title}
      >
        {post.description}
      </PageHero>

      <Band className="grid gap-px bg-heading/8 md:grid-cols-[240px_1fr]">
        <aside className="bg-white px-6 py-8 md:px-10 md:py-16">
          <dl className="flex flex-col gap-5 text-[13px] md:sticky md:top-28">
            <div>
              <dt className="font-mono text-[11px] font-medium tracking-[0.08em] text-heading/45 uppercase">Published</dt>
              <dd className="mt-1 text-heading/75">
                <time dateTime={post.date}>{DATE_FORMAT.format(new Date(post.date))}</time>
              </dd>
            </div>
            {post.updated ? (
              <div>
                <dt className="font-mono text-[11px] font-medium tracking-[0.08em] text-heading/45 uppercase">Updated</dt>
                <dd className="mt-1 text-heading/75">
                  <time dateTime={post.updated}>{DATE_FORMAT.format(new Date(post.updated))}</time>
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="font-mono text-[11px] font-medium tracking-[0.08em] text-heading/45 uppercase">Reading time</dt>
              <dd className="mt-1 text-heading/75">{post.readingMinutes} min</dd>
            </div>
            <Link
              href="/blog"
              className="w-fit text-[14px] font-medium text-heading underline decoration-heading/20 underline-offset-4 hover:decoration-heading"
            >
              ← All articles
            </Link>
          </dl>
        </aside>
        <article className="min-w-0 bg-white px-6 py-12 md:px-14 md:py-16">
          <div className="max-w-[680px]">
            <Article />
          </div>
        </article>
      </Band>

      <CtaBand title="Turn tracked hours into a paid invoice">
        Logr does both in one fast workspace. Free forever, or self-host it.
      </CtaBand>

      <section>
        <RowHeading eyebrow="Keep reading" title="More from the blog" link={{ href: "/blog", label: "All articles" }} />
        <PostCards posts={related} />
      </section>
    </>
  );
}
