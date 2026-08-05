// check-tokens.mjs — the gate. Every defect this file tests for was, at some
// point, LIVE and SILENT: an undefined custom property paints nothing, an
// unimported token file resolves nothing, and a 1.66:1 focus ring looks fine to
// whoever shipped it. None of them can fail loudly on their own, so they fail
// here. Run via `npm test` (part of `build`).
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const tokensDir = join(root, 'tokens')
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '')
const read = (p) => readFileSync(p, 'utf8')

let failures = 0
const fail = (msg) => { console.error(`  FAIL  ${msg}`); failures++ }
const pass = (msg) => console.log(`  ok    ${msg}`)

// ── 1. styles.css must CARRY every token file ────────────────────────────
// tokens/z.css was authored, exported and documented — and left out of
// styles.css, so the whole ladder resolved to nothing on every consumer.
//
// The entry point is now generated and FLATTENED, so this checks for the
// declarations themselves rather than for an @import naming the file. That is
// the stronger test and it is the one that was actually needed: the old shape
// passed for years while no bundler could resolve a single token, because a
// relative url() resolves against the CONSUMER's directory. Presence of the
// import proved nothing about presence of the tokens.
{
  const entry = strip(read(join(root, 'styles.css')))
  const files = readdirSync(tokensDir).filter((f) => f.endsWith('.css'))
  const missing = files.filter((f) => {
    const decls = [...strip(read(join(tokensDir, f))).matchAll(/--([A-Za-z0-9-]+)\s*:/g)].map((m) => m[1])
    // A file with no custom properties (pure element rules, e.g. base.css) is
    // carried if one of its selectors made it across.
    if (!decls.length) return !entry.includes(strip(read(join(tokensDir, f))).trim().split('\n')[0].trim())
    return !decls.every((d) => entry.includes(`--${d}`))
  })
  missing.length
    ? fail(`styles.css does not carry the tokens from: ${missing.join(', ')}`)
    : pass(`styles.css carries all ${files.length} token files, flattened`)

  // And it must stay resolvable: an @import here is the exact defect above.
  entry.includes('@import')
    ? fail('styles.css contains an @import — a consumer cannot resolve it (see gen-tokens.mjs)')
    : pass('styles.css has no @import to resolve')

  // Every asset it names must EXIST at the path it names, from the root the
  // bundle now sits at. tokens/fonts.css points one directory up because it is
  // authored one directory down; flattening rebases that, and a rebase that
  // silently stopped happening would put the faces outside the package and fail
  // every consumer's build on a missing module.
  const urls = [...entry.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)]
    .map((m) => m[1])
    .filter((u) => !/^(data:|https?:|\/\/)/.test(u))
  const broken = urls.filter((u) => !existsSync(join(root, u)))
  broken.length
    ? broken.forEach((u) => fail(`styles.css references ${u}, which does not exist at the package root`))
    : pass(`all ${urls.length} asset url()s resolve from the package root`)
}

// ── 1a. the bundles must PARSE ───────────────────────────────────────────
// 0.4.2 and 0.4.3 shipped a stray `*/` in styles.css AND tailwind.css: an
// edit added prose to the end of a comment that was already closed, so a
// paragraph of English sat in the stylesheet as raw CSS, terminated by a
// second `*/`. Browsers recover from that — they skip to the next thing that
// looks like a rule and carry on — so the whole kit rendered correctly in
// Chromium at three widths in both themes, and every screenshot looked right.
// PostCSS does not recover. It throws, which means those two versions could
// not be built against by any Vite/Next/Tailwind consumer at all.
//
// The lesson is specific: RENDERING IS NOT PARSING. A visual check cannot see
// this class of defect, because the browser's error recovery is what hides it.
// So it is checked structurally, here, on the artifacts a consumer receives.
//
// Done by hand rather than with postcss because the defect is lexical and the
// scan is fifteen lines — CSS comments do not nest, so one left-to-right pass
// that skips comment bodies finds every stray terminator and every unclosed
// opener. A parser dependency would be a heavier answer to a smaller question.
{
  for (const f of ['styles.css', 'tailwind.css']) {
    const s = read(join(root, f))
    let i = 0, opened = 0, strays = [], unterminated = null
    while (i < s.length - 1) {
      if (s[i] === '/' && s[i + 1] === '*') {
        opened++
        const j = s.indexOf('*/', i + 2)
        if (j < 0) { unterminated = s.slice(0, i).split('\n').length; break }
        i = j + 2
        continue
      }
      if (s[i] === '*' && s[i + 1] === '/') { strays.push(s.slice(0, i).split('\n').length); i += 2; continue }
      i++
    }
    const braces = [...s].reduce((n, c) => n + (c === '{') - (c === '}'), 0)
    if (unterminated !== null) fail(`${f}: unterminated /* at line ${unterminated}`)
    else if (strays.length) fail(`${f}: stray */ outside any comment at line ${strays.join(', ')} — a consumer's PostCSS build throws here`)
    else if (braces !== 0) fail(`${f}: ${Math.abs(braces)} unbalanced ${braces > 0 ? '{' : '}'}`)
    else pass(`${f} is lexically sound — ${opened} comments closed, braces balanced`)
  }
}

// ── 1b. the Tailwind bridge is complete and self-contained ───────────────
// An app should write ONE import and get working utilities. Each thing checked
// here failed silently in production before it was checked: a missing slot
// makes that utility resolve to nothing (`border-border` -> currentColor -> a
// white hairline on black), and a surviving @import makes the browser drop
// every token without a word.
{
  const tw = strip(read(join(root, 'tailwind.css')))
  tw.includes('@import')
    ? fail('tailwind.css contains an @import — invalid after `@import "tailwindcss"`, so the tokens are dropped')
    : pass('tailwind.css has no @import to invalidate')

  // Every Tailwind colour slot an app will reach for must be mapped.
  const slots = ['background', 'foreground', 'card', 'popover', 'primary', 'secondary',
                 'muted', 'muted-foreground', 'accent', 'destructive', 'border', 'input', 'ring']
  const unmapped = slots.filter((s) => !tw.includes(`--color-${s}:`))
  unmapped.length
    ? fail(`tailwind.css does not map: ${unmapped.join(', ')}`)
    : pass(`tailwind.css maps all ${slots.length} core colour slots`)

  // And it must carry the values, not merely reference them.
  tw.includes('--border:')
    ? pass('tailwind.css carries the token values inline')
    : fail('tailwind.css maps slots but carries no tokens — every utility resolves to nothing')
}

// ── 1c. element defaults must LOSE to an app's utilities ─────────────────
// A rule outside a cascade layer beats a rule inside one regardless of
// specificity, so an unlayered `a{color:...}` here silently outranked every
// Tailwind text utility on every anchor — a `text-neutral-950` primary button
// rendered white-on-white and read as a rendering glitch. These are DEFAULTS;
// a default that cannot be overridden is not a default.
{
  const base = strip(read(join(tokensDir, 'base.css'))).trim()
  const layered = /^@layer\s+base\s*\{/.test(base) && base.endsWith('}')
  layered
    ? pass('base.css element defaults are inside @layer base')
    : fail('base.css is UNLAYERED — its element rules outrank every utility an app writes')
}

// ── 1d. a focused element gets exactly ONE indicator ─────────────────────
// The field rule and the generic ring rule both compute to (0,1,0) — :where()
// zeroes its contents and each side keeps one pseudo-class — so the cascade
// falls through to SOURCE ORDER inside @layer base. The generic rule was
// written later, so it overrode the `outline:none` that the field rule states
// expressly to prevent it, and every focused input on every consumer drew the
// 2px ring AND the edge+halo. Both rules read as correct in isolation; only
// their order was wrong, which is why nobody saw it in either file.
//
// Order is not testable as intent, so this tests the property instead: a rule
// that paints an outline on focus must not be able to land on a field.
{
  const base = strip(read(join(tokensDir, 'base.css')))
  const FIELDS = 'input,select,textarea'
  // `outline:none` disarms; anything else paints. `outline-offset` is a
  // different property and never matches — the colon must follow `outline`.
  const paints = (body) => /(?:^|[;{\s])outline\s*:\s*(?!none\b)[^;}]+/.test(body)
  const scoped = (sel) => sel.includes(`:where(${FIELDS})`) || sel.includes(`:not(${FIELDS})`)
  const doubled = [...base.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .map(([, sel, body]) => ({ sel: sel.trim().replace(/\s+/g, ' '), body }))
    .filter(({ sel, body }) => sel.includes(':focus-visible') && paints(body) && !scoped(sel))
  doubled.length
    ? doubled.forEach(({ sel }) => fail(`\`${sel}\` paints an outline on a field that already draws its own edge + halo — two focus indicators`))
    : pass('one focus indicator per element: fields brighten their edge, everything else rings')
}

// ── 2. every var() used inside the token layer must resolve ──────────────
{
  const declared = new Set()
  const used = new Map() // name -> file
  for (const f of readdirSync(tokensDir).filter((f) => f.endsWith('.css'))) {
    const css = strip(read(join(tokensDir, f)))
    for (const [, n] of css.matchAll(/--([A-Za-z0-9-]+)\s*:/g)) declared.add(n)
    for (const [, n] of css.matchAll(/var\(\s*--([A-Za-z0-9-]+)/g)) if (!used.has(n)) used.set(n, f)
  }
  const ghosts = [...used].filter(([n]) => !declared.has(n))
  ghosts.length
    ? ghosts.forEach(([n, f]) => fail(`tokens/${f} references --${n}, which nothing declares`))
    : pass(`all ${used.size} internal var() references resolve`)
}

// ── 3. the focus-indicator contrast gate (WCAG 2.4.11) ───────────────────
// The focus indicator must clear 3:1 against EVERY surface it can land on, in
// BOTH themes. --ring was #333333 = 1.66:1 on --background.
//
// --border-control was gated here too and no longer is. That was not a
// regression, it was the point: pinning a control's RESTING edge at 3:1 forces
// it to a mid-grey on a near-black ground, four times heavier than the hairline
// beside it, and a form drawn that way reads as a wireframe. The edge is now
// rgb(255 255 255 / .15) — the reference's own value — and the contrast budget
// is spent entirely on --ring, which is what a keyboard user actually navigates
// by. A resting edge is an affordance; a focus ring is a position.
{
  const css = strip(read(join(tokensDir, 'colors.css')))
  const block = (re) => { const m = css.match(re); const o = {}; if (m) for (const [, n, v] of m[1].matchAll(/--([A-Za-z0-9-]+)\s*:\s*([^;]+);/g)) o[n] = v.trim(); return o }
  const dark = block(/:root\s*\{([\s\S]*?)\n\}/)
  const themes = { dark, light: { ...dark, ...block(/\.light\s*\{([\s\S]*?)\n\}/) } }

  const deref = (v, s, d = 0) => { const m = d < 10 && v && String(v).match(/^var\(\s*--([A-Za-z0-9-]+)\s*\)$/); return m ? deref(s[m[1]], s, d + 1) : v }
  const rgb = (v) => {
    if (!v) return null
    let m = String(v).trim().match(/^#([0-9a-f]{6})$/i)
    if (m) { const n = parseInt(m[1], 16); return [n >> 16 & 255, n >> 8 & 255, n & 255, 1] }
    m = String(v).trim().match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[/,]\s*([\d.]+))?\s*\)$/i)
    return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null
  }
  const over = (f, b) => [0, 1, 2].map((i) => f[i] * f[3] + b[i] * (1 - f[3]))
  const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
  const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
  const ratio = (fg, bg, s) => {
    const f = rgb(deref(fg, s)), b = rgb(deref(bg, s))
    if (!f || !b) return null
    const bo = b[3] < 1 ? over(b, [0, 0, 0, 1]) : b.slice(0, 3)
    const fo = f[3] < 1 ? over(f, bo) : f.slice(0, 3)
    const [A, B] = [lum(fo), lum(bo)].sort((x, y) => y - x)
    return (A + 0.05) / (B + 0.05)
  }

  const CANVASES = ['background', 'card', 'popover', 'muted', 'secondary', 'surface-card', 'surface-overlay']
  // The gate follows the DUTY, not the name — and exactly ONE duty owes a
  // ratio. --ring is the focus indicator: transient, keyboard-only, and the
  // whole of how someone knows where they are. Every boundary that is merely an
  // affordance — --border, --border-strong, --border-control, --border-focus,
  // --border-selected — is free to be as quiet as it looks.
  const GATED = { ring: 3 }
  for (const [theme, scope] of Object.entries(themes)) {
    for (const [tok, min] of Object.entries(GATED)) {
      let worst = Infinity, where = ''
      for (const c of CANVASES) {
        const r = ratio(scope[tok], scope[c], scope)
        if (r !== null && r < worst) { worst = r; where = `--${c}` }
      }
      if (!isFinite(worst)) { fail(`--${tok} (${theme}) could not be measured`); continue }
      worst < min
        ? fail(`--${tok} (${theme}) is ${worst.toFixed(2)}:1 on ${where} — needs ${min}:1`)
        : pass(`--${tok} (${theme}) ${worst.toFixed(2)}:1 worst case (${where})`)
    }
  }

  // ── 4. every white-alpha token must be restated for the light theme ──────
  // The opacity ladder does NOT invert. A semantic token built from
  // rgb(255 255 255 / a) is white-on-white in `.light` — the border does not
  // change colour, it STOPS EXISTING — and nothing renders an error. The raw
  // ladder itself (--white-*) is exempt: it is a palette, not a semantic token,
  // and light-theme tokens are expected to restate rather than invert it.
  //
  // Two things widen this from where it started. It scans tokens/elevation.css
  // as well as tokens/colors.css, because that is where the light lives now —
  // an inset white highlight, a white hover bloom and a white panel sheen all
  // fail in `.light` exactly the way a white border does, and more invisibly,
  // since a missing lift looks like a design choice. And it matches white-alpha
  // ANYWHERE INSIDE a value rather than requiring the whole value to be one
  // colour, because every one of those tokens is a shadow or a gradient with
  // the colour buried in it — `inset 0 1px 0 0 rgb(255 255 255 / .07)` would
  // have sailed through a whole-value parse.
  {
    const PALETTE = /^(white|neutral|pure|hanzo)-/
    const FILES = ['colors', 'elevation']
    const blockOf = (src, re) => { const m = strip(src).match(re); const o = {}; if (m) for (const [, n, v] of m[1].matchAll(/--([A-Za-z0-9-]+)\s*:\s*([^;]+);/g)) o[n] = v.trim(); return o }
    const ROOT = /:root\s*\{([\s\S]*?)\n\}/
    const LIGHT = /\.light\s*\{([\s\S]*?)\n\}/

    const sources = Object.fromEntries(FILES.map((f) => [f, read(join(tokensDir, `${f}.css`))]))
    // One scope to resolve against: elevation references --white-* rungs that
    // colors declares, so a per-file scope could not expand them.
    const scope = {}
    for (const f of FILES) Object.assign(scope, blockOf(sources[f], ROOT))
    // Restating in ANY file's .light block counts — the cascade does not care
    // which file a declaration came from.
    const lightKeys = new Set()
    for (const f of FILES) for (const k of Object.keys(blockOf(sources[f], LIGHT))) lightKeys.add(k)

    // Expansion STOPS at any token that is itself restated in `.light`.
    // `--ring-focus: 0 0 0 3px var(--ring-halo)` is theme-safe precisely
    // because --ring-halo inverts underneath it — var() resolves per theme at
    // use time, so deferring to a token that flips IS the fix, and a checker
    // that expanded through it would demand every wrapper be restated too.
    const expand = (v, d = 0) =>
      d > 10 ? v : String(v).replace(/var\(\s*--([A-Za-z0-9-]+)\s*\)/g,
        (m, n) => (n in scope && !lightKeys.has(n) ? expand(scope[n], d + 1) : m))
    const WHITE_ALPHA = /rgba?\(\s*255[\s,]+255[\s,]+255\s*[/,]\s*(?:0?\.\d+|0)\s*\)/i

    const leaked = []
    for (const f of FILES)
      for (const k of Object.keys(blockOf(sources[f], ROOT))) {
        if (PALETTE.test(k) || lightKeys.has(k)) continue
        if (WHITE_ALPHA.test(expand(scope[k]))) leaked.push(`${k} (tokens/${f}.css)`)
      }
    leaked.length
      ? leaked.forEach((k) => fail(`--${k} is built from white-alpha and has no .light value — it vanishes in the light theme`))
      : pass(`every white-alpha token in ${FILES.join('/')}.css is restated in .light`)
  }
}

console.log(failures ? `\n${failures} check(s) failed` : '\nall token checks passed')
process.exit(failures ? 1 : 0)
