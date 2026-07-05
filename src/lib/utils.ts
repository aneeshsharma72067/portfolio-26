/**
 * Minimal classname joiner.
 * Filters out falsy values and joins the rest with a space.
 * Replaces the previous clsx + tailwind-merge combo now that those heavy
 * dependencies have been removed for v2.
 */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(' ');
}
