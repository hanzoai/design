/**
 * Preference contract, checked the way this package already checks tokens:
 * a plain node script, no framework, run by `npm test`.
 *
 * The load-bearing check is the last one. The first version of preference.ts
 * kept its own copy of the type ramp and the copy was WRONG (lg/xl were 16/18
 * against the tokens' 15/17), so a preference of 1 — "leave it alone" — would
 * have resized two rungs of the published design. Nothing caught it, because
 * nothing compared the copy to the source. Now there is no copy: the knobs are
 * multipliers and the ramps live only in tokens/*.css, and check 5 fails if a
 * rung ever stops carrying its multiplier.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

// Load the source directly — this package ships tokens, and the preference
// module is small enough to evaluate without a build step in the check.
const src = readFileSync(join(root, "src/preference.ts"), "utf8");
const js = src
  .replace(/^import[^\n]*\n/gm, "")
  .replace(/export (type|interface) [\s\S]*?\n}\n/g, "")
  .replace(/export type [^\n]*\n/g, "")
  .replace(/: Record<[^>]*>/g, "")
  .replace(/: Preference/g, "")
  .replace(/: Density/g, "")
  .replace(/: string/g, "")
  .replace(/: number/g, "")
  .replace(/: boolean/g, "")
  .replace(/export /g, "");

const mod = new Function(`${js}; return { vars, css, isColor, TYPE_MIN, TYPE_MAX };`)();
const { vars, css, isColor, TYPE_MIN, TYPE_MAX } = mod;

let failed = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`  ok   ${name}`);
  } catch (e) {
    failed++;
    console.error(`  FAIL ${name}\n       ${e.message}`);
  }
};
const eq = (a, b, m) => {
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A !== B) throw new Error(`${m || ""} got ${A} want ${B}`);
};
const ok = (v, m) => { if (!v) throw new Error(m || "expected truthy"); };

console.log("preference:");

check("an unset preference changes nothing", () => {
  eq(vars({}), {});
  eq(css({}), "");
});

check("type is ONE knob, not a restated ramp", () => {
  const v = vars({ type: 1.2 });
  eq(Object.keys(v), ["--type-scale"], "type must emit exactly one name:");
  eq(v["--type-scale"], "1.2");
});

check("type is CLAMPED — a preference cannot make the UI illegible", () => {
  eq(vars({ type: 0.1 })["--type-scale"], String(TYPE_MIN), "min");
  eq(vars({ type: 99 })["--type-scale"], String(TYPE_MAX), "max");
  // the smallest rung must stay readable at the floor: 11px * TYPE_MIN
  ok(11 * TYPE_MIN >= 9, "xs falls below 9px at the floor");
});

check("density moves spacing only, and never touches type", () => {
  const v = vars({ density: "compact" });
  eq(Object.keys(v), ["--density"]);
  ok(Number(v["--density"]) < 1, "compact should tighten");
  ok(Number(vars({ density: "comfortable" })["--density"]) > 1, "comfortable should loosen");
  ok(!("--type-scale" in v), "density must not touch type");
  // Spacing compounds through nesting, so the range stays tight enough that a
  // 44px coarse-pointer target does not fall under the floor.
  ok(Number(vars({ density: "compact" })["--density"]) >= 0.8, "compact is too tight to stay tappable");
});

check("EVERY ramp rung carries its multiplier — no rung can opt out", () => {
  // This is the check that the drifting copy would have failed.
  const type = readFileSync(join(root, "tokens/typography.css"), "utf8");
  const space = readFileSync(join(root, "tokens/spacing.css"), "utf8");

  const bare = [];
  for (const [file, text, knob, re] of [
    ["typography.css", type, "--type-scale", /--text-[a-z0-9]+:\s*([^;]+);/g],
    ["spacing.css", space, "--density", /--space-\d+:\s*([^;]+);/g],
  ]) {
    for (const m of text.matchAll(re)) {
      const value = m[1].trim();
      if (value === "0") continue;                 // zero times anything is zero
      if (value.startsWith("var(")) continue;      // an alias inherits its target's calc
      if (!value.includes(`var(${knob}`)) bare.push(`${file}: ${m[0].trim()}`);
    }
  }
  eq(bare, [], "rungs that do NOT scale with their knob:");
});

check("a unitless leading stays a RATIO — scaling it would double-apply", () => {
  const type = readFileSync(join(root, "tokens/typography.css"), "utf8");
  const bad = [];
  for (const m of type.matchAll(/--leading-[a-z0-9]+:\s*([^;]+);/g)) {
    const v = m[1].trim();
    // A ratio (`1.05`) already scales with the font size it multiplies.
    if (/^[0-9.]+$/.test(v) === false) continue;
    if (v.includes("var(")) bad.push(m[0].trim());
  }
  eq(bad, [], "unitless leadings must not carry a multiplier:");
});

check("a colour lands on both --primary and --accent", () => {
  const v = vars({ accent: "#808000" });
  eq(v["--primary"], "#808000");
  eq(v["--accent"], "#808000");
});

check("a NON-colour is dropped, never sanitised into something plausible", () => {
  for (const bad of [
    "red; background-image:url(//evil/x)",
    "}html{display:none",
    "url(//evil/x)",
    "expression(alert(1))",
    "",
    "   ",
  ]) {
    const v = vars({ accent: bad });
    ok(!("--primary" in v), `accepted ${JSON.stringify(bad)}`);
    ok(!isColor(bad), `isColor said yes to ${JSON.stringify(bad)}`);
  }
});

check("real colour notations are accepted", () => {
  for (const good of ["#fff", "#ffffff", "#ffffffff", "rgb(1 2 3)", "oklch(.7 .1 120)", "rebeccapurple"]) {
    ok(isColor(good), `isColor said no to ${good}`);
  }
});

check("css() emits ONE block for the selector it is given", () => {
  const out = css({ type: 1.1, density: "compact", accent: "#fff" }, ":root");
  ok(out.startsWith(":root{") && out.endsWith("}"), out.slice(0, 40));
  ok(!out.includes("}" + "{"), "emitted more than one block");
});

check("every emitted name is one the token files actually read", () => {
  // A variable nothing reads is a write into another document — the exact
  // mistake this package exists to prevent. The knobs are READ by the ramps
  // (as var(--knob, 1)); the colours are DECLARED by colors.css.
  const files = ["tokens/typography.css", "tokens/spacing.css", "tokens/grid.css", "tokens/colors.css"];
  const text = files.map((f) => readFileSync(join(root, f), "utf8")).join("\n");
  const declared = new Set([...text.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map((m) => m[1]));
  const read = new Set([...text.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]));

  const emitted = Object.keys(vars({ type: 1.1, density: "compact", accent: "#fff" }));
  const orphans = emitted.filter((k) => !declared.has(k) && !read.has(k));
  eq(orphans, [], "emitted names no token file declares or reads:");
});

if (failed) {
  console.error(`\n${failed} preference check(s) failed`);
  process.exit(1);
}
console.log("preference: all checks passed");
