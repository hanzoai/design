/**
 * Preference contract, checked the way this package already checks tokens:
 * a plain node script, no framework, run by `npm test`.
 *
 * The three things worth pinning are the three that would hurt: a preference
 * that renders someone's own tools illegible, one that lets a colour field
 * carry a second declaration into a stylesheet, and one that emits names no
 * token file reads.
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

check("type scales the WHOLE ramp, keeping every relation", () => {
  const v = vars({ type: 2 }); // clamps to TYPE_MAX
  const base = parseFloat(v["--text-base"]);
  const xs = parseFloat(v["--text-xs"]);
  // 0.875 / 0.6875 must survive the transform
  const ratio = base / xs;
  ok(Math.abs(ratio - 0.875 / 0.6875) < 1e-9, `ratio drifted: ${ratio}`);
});

check("type is CLAMPED — a preference cannot make the UI illegible", () => {
  const tiny = vars({ type: 0.1 });
  eq(tiny["--text-base"], `${Math.round(0.875 * TYPE_MIN * 10000) / 10000}rem`, "min");
  const huge = vars({ type: 99 });
  eq(huge["--text-base"], `${Math.round(0.875 * TYPE_MAX * 10000) / 10000}rem`, "max");
  // the smallest rung must stay readable at the floor
  ok(parseFloat(tiny["--text-xs"]) * 16 >= 9, "xs fell below 9px");
});

check("density moves the gap ramp, not the type ramp", () => {
  const v = vars({ density: "compact" });
  ok(v["--grid-gap"], "no gap emitted");
  ok(!v["--text-base"], "density must not touch type");
  ok(parseFloat(v["--grid-gap"]) < 1, "compact should tighten");
  ok(parseFloat(vars({ density: "comfortable" })["--grid-gap"]) > 1, "comfortable should loosen");
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
  ok(!out.includes("}"+"{"), "emitted more than one block");
});

check("every emitted name is one the token files actually declare", () => {
  // A variable nothing reads is a write into another document — the exact
  // mistake this package exists to prevent.
  const declared = new Set();
  for (const f of ["tokens/typography.css", "tokens/grid.css", "tokens/colors.css"]) {
    for (const m of readFileSync(join(root, f), "utf8").matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)) {
      declared.add(m[1]);
    }
  }
  const emitted = Object.keys(vars({ type: 1.1, density: "compact", accent: "#fff" }));
  const orphans = emitted.filter((k) => !declared.has(k));
  eq(orphans, [], "emitted names no token file declares:");
});

if (failed) {
  console.error(`\n${failed} preference check(s) failed`);
  process.exit(1);
}
console.log("preference: all checks passed");
