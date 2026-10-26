"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { RotateCcw } from "lucide-react";

/** How long each tab holds before handing over to the next one. */
const TAB_MS = 9000;

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** Reduced motion, read live. The server snapshot is `true` so nothing autoplays before hydration. */
export function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => true,
  );
}

export interface Feature {
  title: string;
  body: string;
  /** Panel background behind the demo. */
  tint: string;
  /** Keycap or icon tile in front of the title — rendered by the server page. */
  marker: React.ReactNode;
  demo: React.ReactNode;
}

function Tab({
  id,
  feature,
  selected,
  round,
  playing,
  onSelect,
  onDone,
}: {
  id: string;
  feature: Feature;
  selected: boolean;
  round: number;
  playing: boolean;
  onSelect: () => void;
  onDone: () => void;
}) {
  const barRef = useRef<HTMLSpanElement>(null);
  const animRef = useRef<Animation | null>(null);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  });

  // The progress bar is the timer: when it fills, the next tab takes over.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar || !selected) return;
    const anim = bar.animate([{ width: "0%" }, { width: "100%" }], {
      duration: TAB_MS,
      easing: "linear",
      fill: "forwards",
    });
    anim.pause();
    anim.onfinish = () => doneRef.current();
    animRef.current = anim;
    return () => {
      anim.cancel();
      animRef.current = null;
    };
  }, [selected, round]);

  useEffect(() => {
    const anim = animRef.current;
    if (!anim) return;
    if (playing) anim.play();
    else anim.pause();
  }, [playing, selected, round]);

  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      className="group/tab relative block w-full cursor-pointer border-b border-heading/8 px-6 py-6 text-left last:border-b-0 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-coral md:px-9"
    >
      <span className="flex items-center gap-3.5">
        {feature.marker}
        <span
          className={`min-w-0 truncate text-[19px] leading-[1.2] font-semibold tracking-[-0.025em] transition-colors duration-200 md:text-[22px] ${
            selected ? "text-heading" : "text-heading/30 group-hover/tab:text-heading/60"
          }`}
        >
          {feature.title}
        </span>
      </span>
      <span
        className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          selected ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <span className="overflow-hidden">
          <span className="line-clamp-2 block max-w-[440px] pt-2.5 text-[15.5px] leading-[1.55] text-heading/60 md:pl-[42px]">
            {feature.body}
          </span>
        </span>
      </span>
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 -bottom-px h-0.5 overflow-hidden ${selected ? "bg-heading/8" : ""}`}
      >
        <span ref={barRef} className="block h-full w-0 bg-heading" />
      </span>
    </button>
  );
}

/**
 * Vertical tab list beside a tinted demo panel. Plays through on its own while
 * it is on screen and the page is visible; holds still under reduced motion.
 */
export function FeatureTabs({ id, features, flip = false }: { id: string; features: Feature[]; flip?: boolean }) {
  const [active, setActive] = useState(0);
  const [round, setRound] = useState(0);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver((entries) => setInView(entries.some((e) => e.isIntersecting)), {
      rootMargin: "-25% 0px -25% 0px",
    });
    io.observe(root);
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  function select(i: number) {
    setActive(i);
    setRound((r) => r + 1);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const step = ({ ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 } as Record<string, number>)[e.key];
    if (!step) return;
    e.preventDefault();
    const next = (active + step + features.length) % features.length;
    select(next);
    listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus();
  }

  const current = features[active];
  const playing = inView && pageVisible && !reduced;

  return (
    <div
      ref={rootRef}
      className={`grid gap-px bg-heading/8 ${flip ? "md:grid-cols-[7fr_5fr]" : "md:grid-cols-[5fr_7fr]"}`}
    >
      <div
        ref={listRef}
        role="tablist"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
        className={`flex flex-col bg-white max-md:order-2 ${flip ? "md:order-2" : ""}`}
      >
        {features.map((f, i) => (
          <Tab
            key={f.title}
            id={`${id}-tab-${i}`}
            feature={f}
            selected={i === active}
            round={round}
            playing={playing}
            onSelect={() => select(i)}
            onDone={() => select((i + 1) % features.length)}
          />
        ))}
      </div>
      <div
        role="tabpanel"
        aria-labelledby={`${id}-tab-${active}`}
        style={{ backgroundColor: current.tint }}
        className="relative flex min-h-[440px] items-center justify-center overflow-hidden px-4 py-14 transition-[background-color] duration-500 md:min-h-[560px] md:px-8"
      >
        <button
          type="button"
          onClick={() => setRound((r) => r + 1)}
          className="group absolute top-3.5 right-3.5 z-10 flex h-[30px] cursor-pointer items-center gap-1.5 rounded-full bg-white/85 pr-3 pl-2.5 text-[12.5px] font-medium text-heading/60 ring-1 ring-heading/12 transition-colors hover:bg-white hover:text-heading"
        >
          <RotateCcw className="size-3.5 transition-transform duration-500 group-active:-rotate-180" strokeWidth={1.8} />
          Replay
        </button>
        {/* Keyed on tab + round so Replay and every switch remount the demo and rerun it. */}
        <div
          key={`${active}-${round}`}
          className="relative w-full max-w-[460px] transition-[opacity,translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] starting:translate-y-2.5 starting:opacity-0"
        >
          {current.demo}
        </div>
      </div>
    </div>
  );
}
