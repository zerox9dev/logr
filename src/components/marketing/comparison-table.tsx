import { Band } from "./band";

export type Cell = boolean | string;

function Mark({ value, strong = false }: { value: Cell; strong?: boolean }) {
  if (value === true)
    return (
      <svg viewBox="0 0 12 12" className="mx-auto size-3.5" fill="none" role="img" aria-label="Yes">
        <path
          d="M2 6.5 4.5 9 10 3"
          stroke={strong ? "#2e9b5f" : "#141414"}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  if (value === false)
    return (
      <span role="img" aria-label="No" className="text-heading/25">
        —
      </span>
    );
  return <span className={`text-[13px] ${strong ? "font-medium text-[#1d5e3a]" : "text-heading/55"}`}>{value}</span>;
}

/** Feature matrix; the first value column is Logr's and sits on a mint wash. */
export function ComparisonTable({ columns, rows }: { columns: string[]; rows: [string, ...Cell[]][] }) {
  const [logr, ...others] = columns;
  return (
    <Band className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-[15px]">
        <thead>
          <tr className="border-b border-heading/8">
            <th className="px-6 py-4 text-left font-mono text-[12px] font-medium tracking-[0.08em] text-heading/45 uppercase md:px-10">
              Feature
            </th>
            <th className="bg-tint-mint px-4 py-4 text-center font-semibold">{logr}</th>
            {others.map((name) => (
              <th key={name} className="px-4 py-4 text-center font-medium text-heading/55">
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, first, ...rest]) => (
            <tr key={label} className="border-b border-heading/8 last:border-b-0">
              <td className="px-6 py-4 text-heading/75 md:px-10">{label}</td>
              <td className="bg-tint-mint px-4 py-4 text-center">
                <Mark value={first} strong />
              </td>
              {rest.map((v, i) => (
                <td key={i} className="px-4 py-4 text-center">
                  <Mark value={v} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Band>
  );
}
