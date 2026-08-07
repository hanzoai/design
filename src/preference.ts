/**
 * A person's own reading of the system: type size, density, accent.
 *
 * The ramps in `tokens/*.css` are the SHAPE — the relationships between sizes,
 * gaps and hues that make a surface read as one thing. A preference does not
 * replace them and cannot reach inside them. It applies ONE transform to a whole
 * axis, so every size still stands in the same relation to every other size and
 * a customised UI is the same design at a different setting, not a different
 * design.
 *
 * It is a pure function on purpose. `vars()` maps a preference to the custom
 * properties that carry it, and returns them; nothing here touches a document.
 * That is what lets it be tested without a browser and reused by every surface —
 * an app, an embedded builder preview, a server render that inlines the result.
 *
 * Three axes, because those are the three the token files already separate:
 *
 *   type    scales the --text-* ramp
 *   density scales the --grid-gap-* ramp (the spacing between things)
 *   accent  sets --primary / --accent (the one hue the monochrome brand allows)
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

const DENSITY_SCALE: Record<Density, number> = {
  compact: 0.75,
  default: 1,
  comfortable: 1.35,
};

/** The type ramp, by name, in rem at a 16px root — mirrors tokens/typography.css. */
const TEXT: Record<string, number> = {
  xs: 0.6875, sm: 0.8125, base: 0.875, lg: 1, xl: 1.125,
  "2xl": 1.3125, "3xl": 1.625, "4xl": 2, "5xl": 2.5,
  "6xl": 3.25, "7xl": 4, "8xl": 5.25, "9xl": 7,
};

/** The gap ramp, in rem — mirrors tokens/grid.css. */
const GAP: Record<string, number> = {
  "grid-gap-tight": 0.5,
  "grid-gap": 1,
  "grid-gap-loose": 1.5,
};

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Trim to 4dp so a multiplier cannot emit a 17-digit float into a stylesheet. */
const rem = (n: number) => `${Math.round(n * 10000) / 10000}rem`;

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
    const k = clamp(p.type, TYPE_MIN, TYPE_MAX);
    for (const [name, size] of Object.entries(TEXT)) out[`--text-${name}`] = rem(size * k);
  }

  if (p.density && p.density in DENSITY_SCALE) {
    const k = DENSITY_SCALE[p.density];
    for (const [name, size] of Object.entries(GAP)) out[`--${name}`] = rem(size * k);
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
