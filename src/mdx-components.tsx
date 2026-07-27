import Link from "next/link";
import type { MDXComponents } from "mdx/types";

/**
 * Global MDX element mapping. Blog articles are authored as plain markdown and
 * rendered with the same design tokens as the marketing pages — no prose plugin,
 * so headings/tables/lists stay visually consistent with /alternatives.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: ({ children, ...props }) => (
      <h2
        className="text-xl font-semibold text-heading mt-10 first:mt-0 scroll-mt-24"
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className="text-lg font-semibold text-heading mt-8 scroll-mt-24" {...props}>
        {children}
      </h3>
    ),
    p: ({ children, ...props }) => (
      <p className="text-base text-ink leading-relaxed mt-4" {...props}>
        {children}
      </p>
    ),
    // `[&:has(input)]` targets GFM task lists: no bullet, checkbox does the marking.
    ul: ({ children, ...props }) => (
      <ul
        className="mt-4 flex flex-col gap-2 list-disc pl-5 text-base text-ink [&_li:has(>input)]:list-none [&_li:has(>input)]:-ml-5"
        {...props}
      >
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="mt-4 flex flex-col gap-2 list-decimal pl-5 text-base text-ink" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="leading-relaxed" {...props}>
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
        className="mt-6 border-l-2 border-line-2 pl-5 text-base text-tertiary italic"
        {...props}
      >
        {children}
      </blockquote>
    ),
    hr: (props) => <hr className="mt-10 border-line" {...props} />,
    input: (props) => (
      <input className="mr-2 align-middle accent-ink" {...props} />
    ),
    del: ({ children, ...props }) => (
      <del className="text-tertiary" {...props}>
        {children}
      </del>
    ),
    a: ({ href, children, ...props }) => {
      const url = href ?? "#";
      if (url.startsWith("/")) {
        return (
          <Link href={url} className="text-ink underline underline-offset-2 hover:text-heading">
            {children}
          </Link>
        );
      }
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink underline underline-offset-2 hover:text-heading"
          {...props}
        >
          {children}
        </a>
      );
    },
    table: ({ children, ...props }) => (
      <div className="mt-6 overflow-x-auto border border-line">
        <table className="w-full text-base text-ink" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead className="border-b border-line" {...props}>
        {children}
      </thead>
    ),
    th: ({ children, ...props }) => (
      <th className="text-left px-5 py-3 text-md font-semibold text-heading" {...props}>
        {children}
      </th>
    ),
    tr: ({ children, ...props }) => (
      <tr className="border-b border-line last:border-b-0" {...props}>
        {children}
      </tr>
    ),
    td: ({ children, ...props }) => (
      <td className="px-5 py-3 text-md align-top" {...props}>
        {children}
      </td>
    ),
    code: ({ children, ...props }) => (
      <code className="bg-page border border-line px-1.5 py-0.5 text-md-minus" {...props}>
        {children}
      </code>
    ),
    pre: ({ children, ...props }) => (
      <pre className="mt-6 bg-page border border-line p-5 overflow-x-auto text-md-minus" {...props}>
        {children}
      </pre>
    ),
    ...components,
  };
}
