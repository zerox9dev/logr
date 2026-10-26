/** The blueprint grid: a full-bleed hairline with a ring where it meets each side rail. */

function Corner({ side }: { side: "left" | "right" }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute top-0 z-31 size-[7px] -translate-y-1/2 rounded-full border border-heading/15 bg-white max-lg:hidden ${
        side === "left" ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"
      }`}
    />
  );
}

/** A full-bleed hairline with the 1080px column under it. */
export function Band({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="relative scroll-mt-16 border-t border-heading/8">
      <div className={`relative mx-auto w-full max-w-[1080px] ${className ?? ""}`}>
        <Corner side="left" />
        <Corner side="right" />
        {children}
      </div>
    </div>
  );
}
