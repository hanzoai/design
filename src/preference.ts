/**
 * A person's own reading of the system: type size, density, accent.
 *
 * Three knobs, and each is ONE multiplier on a whole axis — never a restated
 * ramp. The ramps live in `tokens/*.css`, authored once, and each rung carries
 * its own `calc(<base> * var(--type-scale, 1))`. So a preference sets three
 * numbers and every rung follows, including rungs added later and rungs this
 * file has never heard of.
 *
 * That is not a style choice; it is the fix for a real bug. The first version of
 * this module kept its own copy of the type ramp so it could recompute each
 * rung, and the copy was WRONG — it had `lg: 1rem` and `xl: 1.125rem` (16px and
 * 18px) while `tokens/typography.css` says `0.9375rem` and `1.0625rem` (15px and
 * 17px). Setting a preference of 1 — "leave it alone" — would have silently
 * resized two rungs of the published design. A second copy of a value is a
 * second source of truth, and it drifted before anyone used it.
 *
 * Because the knobs are plain multipliers, any OTHER ramp can opt in the same
 * way. @hanzo/gui compiles its own `--f-size-*` scale for the 1600-odd
 * `fontSize="$n"` call sites in the apps; an app that redeclares those as
 * `calc(<its px> * var(--type-scale, 1))` gets the same control with no change
 * at scale 1.
 *
 * It is a pure function on purpose: it maps a preference to custom properties
 * and returns them, touching no document. That is what lets an app, an embedded
 * preview and a server render apply it identically.
 */

export type Density = "compact" | "default" | "comfortable";

export interface Preference {
  /** Multiplier on the type ramp. 1 is the published scale. */
  type?: number;
  density?: Density;
  /** A CSS colour for --primary / --accent. Rejected unless it is one. */
  accent?: string;
}

/**
 * The type multiplier is CLAMPED, and the bounds are not arbitrary.
 *
 * Below 0.85 the smallest rung (--text-xs, 11px) drops under 9.4px, which stops
 * being small and starts being unreadable — and a preference that lets someone
 * render their own tools illegible is a trap, not a choice. Above 1.4 the
 * chrome stops fitting its own containers: this app's builder header already
 * overlaps its actions below 1440px at scale 1.
 */
export const TYPE_MIN = 0.85;
export const TYPE_MAX = 1.4;

/**
 * Density moves SPACING only, and its range is much tighter than type's.
 *
 * Spacing compounds: a page nests padding inside gap inside margin, so a 0.75
 * multiplier is already three-quarters of every one of those in sequence. Below
 * that, touch targets fall under the 44px floor `base.css` sets for coarse
 * pointers, and the control that promised comfort takes it away.
 */
const DENSITY: Record<Density, number> = {
  compact: 0.85,
  default: 1,
  comfortable: 1.15,
};

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Trim to 4dp so a multiplier cannot emit a 17-digit float into a stylesheet. */
const round = (n: number) => String(Math.round(n * 10000) / 10000);

/**
 * Is this a colour, or is it something being smuggled into a style attribute?
 *
 * A preference is user input and its destination is CSS. `#fff`, `rgb(...)`,
 * `oklch(...)` and the bare keywords are colours; anything carrying a `;`, a
 * `}`, or a `url(` is trying to be a second declaration, and the answer is to
 * drop the axis rather than to sanitise a string into something plausible.
 */
export function isColor(v: string): boolean {
  const s = v.trim();
  if (!s || s.length > 64) return false;
  if (/[;{}()]/.test(s) && !/^(rgb|rgba|hsl|hsla|oklch|oklab|lab|lch|color)\([^;{}]*\)$/i.test(s)) return false;
  return (
    /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(s) ||
    /^(rgb|rgba|hsl|hsla|oklch|oklab|lab|lch|color)\([^;{}]*\)$/i.test(s) ||
    /^[a-z]{3,20}$/i.test(s)
  );
}

/**
 * The custom properties a preference produces.
 *
 * Only the axes actually set appear, so an app can spread the result over
 * whatever it already has without a default silently overriding a brand.
 */
export function vars(p: Preference): Record<string, string> {
  const out: Record<string, string> = {};

  if (typeof p.type === "number" && Number.isFinite(p.type)) {
    out["--type-scale"] = round(clamp(p.type, TYPE_MIN, TYPE_MAX));
  }

  if (p.density && p.density in DENSITY) {
    out["--density"] = round(DENSITY[p.density]);
  }

  if (p.accent && isColor(p.accent)) {
    // Both names, because the ramp uses --primary for action surfaces and
    // --accent for selection. One hue, stated once, landing on both.
    out["--primary"] = p.accent.trim();
    out["--accent"] = p.accent.trim();
  }

  return out;
}

/** `vars()` as a declaration block, for a <style> tag or an SSR inline. */
export function css(p: Preference, selector = "html:root"): string {
  const v = vars(p);
  const keys = Object.keys(v);
  if (!keys.length) return "";
  return `${selector}{${keys.map((k) => `${k}:${v[k]}`).join(";")}}`;
}
