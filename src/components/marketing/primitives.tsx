import Link from "next/link";
import { Receipt, Timer, type LucideIcon } from "lucide-react";
import { Band } from "./band";

export { Band };

/**
 * Building blocks of the marketing site, after the time.fyi canon: one 1080px
 * column drawn as a blueprint (hairline side rails, a hairline on top of every
 * band, a small ring where they cross), ink at opacity steps, a coral mono
 * eyebrow over each section, pill buttons, and pastel panels.
 */

/** Event colours — a bar, a fill and an ink per tone, as on a calendar chip. */
export const tones = {
  green: { bar: "#2e9b5f", fill: "#dff2e6", ink: "#1d5e3a" },
  blue: { bar: "#3b7be8", fill: "#dfe9fb", ink: "#1f4a94" },
  violet: { bar: "#7a5ae0", fill: "#ebe4fb", ink: "#4a3294" },
  amber: { bar: "#d98b1a", fill: "#fbecd2", ink: "#7a4b08" },
  coral: { bar: "#e8604c", fill: "#fde3dd", ink: "#8c2f20" },
} as const;

export type Tone = keyof typeof tones;

export const GITHUB_URL = "https://github.com/zerox9dev/logr";

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`font-mono text-[12px] font-medium tracking-[0.08em] text-coral uppercase ${className ?? ""}`}>
      {children}
    </p>
  );
}

/** Centred eyebrow + h2 + lede, the head of every home-page section. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div id={id} className="mx-auto max-w-[680px] scroll-mt-24 text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-3 text-[36px] leading-[1.05] font-semibold tracking-[-0.035em] text-balance sm:text-[48px]">
        {title}
      </h2>
      {children ? (
        <p className="mx-auto mt-4 max-w-[520px] text-[17px] leading-[1.55] text-balance text-heading/60">
          {children}
        </p>
      ) : null}
    </div>
  );
}

/** Left-aligned hero for the inner pages (blog, alternatives, legal). */
export function PageHero({
  eyebrow,
  title,
  children,
  above,
}: {
  eyebrow?: React.ReactNode;
  title: string;
  children?: React.ReactNode;
  above?: React.ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-[1080px] px-6 pt-16 pb-14 md:px-10 lg:pt-24">
      {above}
      {eyebrow ? <Eyebrow className={above ? "mt-8" : ""}>{eyebrow}</Eyebrow> : null}
      <h1
        className={`max-w-[820px] text-[40px] leading-[1.05] font-semibold tracking-[-0.045em] text-balance sm:text-[56px] ${
          eyebrow || above ? "mt-4" : ""
        }`}
      >
        {title}
      </h1>
      {children ? (
        <p className="mt-5 max-w-[620px] text-[17px] leading-[1.55] text-heading/60">{children}</p>
      ) : null}
    </section>
  );
}

const pillBase =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold whitespace-nowrap transition-[opacity,background-color,scale] duration-150 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral";
const pillTone = {
  dark: "bg-heading text-white hover:opacity-85",
  soft: "bg-heading/6 text-heading hover:bg-heading/10",
};

/** Pill CTA. External hrefs open in a new tab. */
export function PillLink({
  href,
  tone = "dark",
  children,
}: {
  href: string;
  tone?: keyof typeof pillTone;
  children: React.ReactNode;
}) {
  const className = `${pillBase} ${pillTone[tone]}`;
  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

/** A key you could press — sits on a 2px ledge, sinks when `pressed`. */
export function Keycap({ pressed = false, children }: { pressed?: boolean; children: React.ReactNode }) {
  return (
    <kbd
      className={`inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-[7px] border border-heading/12 px-1.5 font-sans text-[12px] font-semibold text-heading transition-[translate,box-shadow,background-color] duration-150 ${
        pressed ? "translate-y-px bg-keycap-pressed shadow-none" : "bg-white shadow-[0_2px_0_rgba(20,20,20,0.12)]"
      }`}
    >
      {children}
    </kbd>
  );
}

/**
 * Tinted icon tile — logr's stand-in for time.fyi's illustrated stickers.
 * `inline` sizes it to the surrounding text so it can sit inside a headline.
 */
export function Sticker({
  icon: Icon,
  tone,
  tilt = "",
  inline = false,
  small = false,
  className,
}: {
  icon: LucideIcon;
  tone: Tone;
  tilt?: string;
  inline?: boolean;
  /** Keycap-sized, for tab and list markers. */
  small?: boolean;
  className?: string;
}) {
  const t = tones[tone];
  const size = inline
    ? "mx-[0.06em] h-[0.92em] w-[0.92em] rounded-[0.24em] align-[-0.14em] [&>svg]:size-[0.52em]"
    : small
      ? "size-7 rounded-[8px] [&>svg]:size-[15px]"
      : "size-9 rounded-[10px] [&>svg]:size-[18px]";
  return (
    <span
      aria-hidden="true"
      style={{ backgroundColor: t.fill, color: t.bar }}
      className={`inline-flex shrink-0 items-center justify-center shadow-[0_6px_14px_-8px_rgba(20,20,20,0.4)] ring-1 ring-heading/8 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] select-none hover:scale-110 hover:rotate-0 ${size} ${tilt} ${className ?? ""}`}
    >
      <Icon strokeWidth={2.2} />
    </span>
  );
}

/** A calendar-style block: coloured bar, title, optional time. */
export function EventChip({
  tone,
  title,
  time,
  className,
  style,
}: {
  tone: Tone;
  title: string;
  time?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const t = tones[tone];
  return (
    <div
      style={{ ...style, backgroundColor: t.fill, color: t.ink }}
      className={`flex gap-[5px] overflow-hidden rounded-[7px] py-1 pr-2 pl-1 ${className ?? ""}`}
    >
      <span style={{ backgroundColor: t.bar }} className="w-[3px] shrink-0 self-stretch rounded-full" />
      <div className="min-w-0">
        <p className="truncate text-[12px] leading-4 font-semibold">{title}</p>
        {time ? <p className="truncate text-[11px] leading-4 tabular-nums opacity-70">{time}</p> : null}
      </div>
    </div>
  );
}

/** Closing call to action; repeated at the foot of most pages. */
export function CtaBand({
  title = "Start tracking your hours with Logr",
  children = "Free on logr.work, or self-host it on your own server in minutes.",
}: {
  title?: string;
  children?: React.ReactNode;
}) {
  const float =
    "absolute hidden size-20! rounded-[22px]! transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] md:inline-flex [&>svg]:size-10!";
  return (
    <Band>
      <section className="group relative overflow-hidden px-6 py-24 text-center sm:px-16 sm:py-28">
        <Sticker
          icon={Timer}
          tone="coral"
          className={`${float} top-16 left-16 -rotate-12 group-hover:-translate-y-2 group-hover:-rotate-6`}
        />
        <Sticker
          icon={Receipt}
          tone="green"
          className={`${float} right-16 bottom-16 rotate-12 group-hover:-translate-y-2 group-hover:rotate-6`}
        />
        <h2 className="mx-auto max-w-[560px] text-[36px] leading-[1.05] font-semibold tracking-[-0.035em] text-balance sm:text-[52px]">
          {title}
        </h2>
        <p className="mx-auto mt-5 max-w-[440px] text-[17px] leading-[1.55] text-heading/60">{children}</p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <PillLink href="/login">Start tracking — free</PillLink>
          <PillLink href={GITHUB_URL} tone="soft">
            View on GitHub
          </PillLink>
        </div>
      </section>
    </Band>
  );
}

/** Breadcrumb trail above an inner-page hero. */
export function Crumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[13px] text-heading/45">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-2">
          {i > 0 ? <span aria-hidden="true">/</span> : null}
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-heading">
              {item.label}
            </Link>
          ) : (
            <span className="text-heading/70">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/** Green-tick list, as on the pricing card. */
export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-[15px] leading-[1.5] text-heading/75">
          <svg viewBox="0 0 12 12" className="mt-[5px] size-3 shrink-0" fill="none" aria-hidden="true">
            <path d="M2 6.5 4.5 9 10 3" stroke="#2e9b5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Heading pinned on the left, body on the right — the FAQ layout, reused for prose blocks. */
export function SplitSection({
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Band id={id} className="grid gap-px bg-heading/8 md:grid-cols-[0.8fr_1.2fr]">
      <div className="bg-white px-6 pt-16 md:px-10 md:pb-16">
        <div className="md:sticky md:top-28">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-3 text-[32px] leading-[1.08] font-semibold tracking-[-0.035em] text-balance sm:text-[40px]">
            {title}
          </h2>
        </div>
      </div>
      <div className="bg-white px-6 pt-8 pb-16 md:px-10 md:pt-16">{children}</div>
    </Band>
  );
}
