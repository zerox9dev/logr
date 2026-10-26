/** True when a key press belongs to whatever has focus, not to a shortcut:
 *  a field being typed in, or anything inside an open dialog. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (typeof HTMLElement === "undefined" || !(target instanceof HTMLElement)) return false;
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.closest("[role=dialog]") !== null;
}
