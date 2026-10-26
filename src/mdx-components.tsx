import Link from "next/link";
import type { MDXComponents } from "mdx/types";

/**
 * Global MDX element mapping. Blog articles are authored as plain markdown and
 * rendered in the marketing site's type (Geist, ink at opacity steps) — no prose
 * plugin, so headings/tables/lists stay consistent with the rest of the site.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: ({ children, ...props }) => (
      <h2
        className="mt-12 scroll-mt-24 text-[26px] leading-[1.2] font-semibold tracking-[-0.03em] text-heading first:mt-0"
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className="mt-9 scroll-mt-24 text-[19px] leading-[1.3] font-semibold tracking-[-0.02em] text-heading" {...props}>
        {children}
      </h3>
    ),
    p: ({ children, ...props }) => (
      <p className="mt-4 text-[16px] leading-[1.7] text-heading/75" {...props}>
        {children}
      </p>
    ),
    // `[&:has(input)]` targets GFM task lists: no bullet, checkbox does the marking.
    ul: ({ children, ...props }) => (
      <ul
        className="mt-4 flex list-disc flex-col gap-2 pl-5 text-[16px] text-heading/75 marker:text-heading/30 [&_li:has(>input)]:-ml-5 [&_li:has(>input)]:list-none"
        {...props}
      >
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="mt-4 flex list-decimal flex-col gap-2 pl-5 text-[16px] text-heading/75 marker:text-heading/40" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="leading-[1.7]" {...props}>
        {children}
      </li>
    ),
    strong: ({ children, ...props }) => (
      <strong className="font-semibold text-heading" {...props}>
        {children}
      </strong>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="mt-6 border-l-2 border-coral pl-5 text-[16px] leading-[1.7] text-heading/60"
        {...props}
      >
        {children}
      </blockquote>
    ),
    hr: (props) => <hr className="mt-12 border-heading/8" {...props} />,
    input: (props) => (
      <input className="mr-2 align-middle accent-heading" {...props} />
    ),
    del: ({ children, ...props }) => (
      <del className="text-heading/45" {...props}>
        {children}
      </del>
    ),
    a: ({ href, children, ...props }) => {
      const url = href ?? "#";
      if (url.startsWith("/")) {
        return (
          <Link href={url} className="font-medium text-heading underline decoration-heading/20 underline-offset-4 hover:decoration-heading">
            {children}
          </Link>
        );
      }
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-heading underline decoration-heading/20 underline-offset-4 hover:decoration-heading"
          {...props}
        >
          {children}
        </a>
      );
    },
    table: ({ children, ...props }) => (
      <div className="mt-6 overflow-x-auto rounded-2xl ring-1 ring-heading/8">
        <table className="w-full text-[15px] text-heading/75" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead className="border-b border-heading/8 bg-heading/[0.02]" {...props}>
        {children}
      </thead>
    ),
    th: ({ children, ...props }) => (
      <th className="px-5 py-3 text-left text-[14px] font-semibold text-heading" {...props}>
        {children}
      </th>
    ),
    tr: ({ children, ...props }) => (
      <tr className="border-b border-heading/8 last:border-b-0" {...props}>
        {children}
      </tr>
    ),
    td: ({ children, ...props }) => (
      <td className="px-5 py-3 align-top text-[14px]" {...props}>
        {children}
      </td>
    ),
    code: ({ children, ...props }) => (
      <code className="rounded-[6px] bg-heading/[0.05] px-1.5 py-0.5 font-mono text-[0.88em] text-heading" {...props}>
        {children}
      </code>
    ),
    pre: ({ children, ...props }) => (
      <pre className="mt-6 overflow-x-auto rounded-2xl bg-heading/[0.03] p-5 font-mono text-[13px] ring-1 ring-heading/8 [&_code]:bg-transparent [&_code]:p-0" {...props}>
        {children}
      </pre>
    ),
    ...components,
  };
}
