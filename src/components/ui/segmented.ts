/**
 * Segmented control, after the calendar canon: a washed track, the selected
 * segment lifted onto the page colour. For Radix Tabs triggers, which carry
 * `data-state=active`; plain buttons use Button's `segment` variant instead.
 */
export const segmentedList = "flex w-fit items-center gap-0.5 rounded-md bg-wash p-0.5";

export const segmentedTab =
  "app-focus h-6 cursor-pointer rounded-[5px] px-3 text-[12.5px] font-medium text-tertiary transition-colors hover:text-heading data-[state=active]:bg-card data-[state=active]:text-heading data-[state=active]:shadow-(--cal-segment-shadow)";
