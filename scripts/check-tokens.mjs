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

// ── 3. the non-text contrast gate (WCAG 1.4.11 / 2.4.11) ─────────────────
// A focus indicator and a control boundary must clear 3:1 against EVERY surface
// they can land on, in BOTH themes. --ring was #333333 = 1.66:1 on --background.
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
  const GATED = { ring: 3, 'border-strong': 3 }
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
}

console.log(failures ? `\n${failures} check(s) failed` : '\nall token checks passed')
process.exit(failures ? 1 : 0)
