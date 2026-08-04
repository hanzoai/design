#!/usr/bin/env node
// lint.mjs — the gate on CONSUMER code. `check-tokens.mjs` proves the token
// layer is sound; this proves the code that USES it actually reaches it.
//
// Every rule here is a defect that shipped, silently, to a live Hanzo surface:
// a var() nothing declares paints nothing, a raw hex ignores the theme, a bare
// z-index wins a fight it should have lost, an ALL-CAPS label is a different
// brand. None of them throw. So they fail here.
//
//   npx hanzo-design-lint <path...>        # default: cwd
//
// Exit 1 on any violation. That is the point.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative, extname, sep } from 'node:path'

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

// ── the vocabulary: every token the design system actually declares ──────
const TOKENS = new Set()
{
  const dir = join(pkgRoot, 'tokens')
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.css')))
    for (const [, n] of readFileSync(join(dir, f), 'utf8').matchAll(/--([A-Za-z0-9-]+)\s*:/g))
      TOKENS.add(n)
}

// ── what we read ─────────────────────────────────────────────────────────
const EXT = new Set(['.css', '.scss', '.jsx', '.tsx', '.js', '.ts', '.vue', '.svelte', '.html'])
const SKIP = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'out', 'coverage', 'vendor', '__pycache__'])
// Third-party marks keep their own hex by design (DESIGN.md §2.4); so do the
// token files themselves, which are where raw values are SUPPOSED to live, and
// the specimen cards, whose whole job is to render a palette swatch at its
// literal value.
//
// This exempts those paths from the VALUE rules only. It used to skip them
// entirely, and rule 1 — "a var() must resolve" — is not a value rule, it is a
// correctness rule, and the exemption hid seven live instances of the exact
// defect this package documents: `guidelines/*.card.html` drew borders from
// `--border-hairline` and `--border-card`, neither of which anything declares.
// An undefined custom property makes the declaration invalid, `border-color`
// falls back to `currentColor`, and the specimen cards for this system's own
// border scale had been painting near-white hairlines on black.
const EXEMPT = /(^|\/)(tokens|assets|logos|providers|ui_kits|guidelines)(\/|$)|\.card\.html$/

const walk = (p, out = []) => {
  const st = statSync(p)
  if (st.isFile()) { if (EXT.has(extname(p))) out.push(p); return out }
  for (const e of readdirSync(p)) if (!SKIP.has(e) && !e.startsWith('.')) walk(join(p, e), out)
  return out
}

const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
const lineOf = (src, i) => src.slice(0, i).split('\n').length

// Read one property's value out of a JSX style object, respecting quotes and
// nested parens — `linear-gradient(a, var(--x))` is ONE value, not two.
function styleValue(body, key) {
  const at = body.search(new RegExp(`\\b${key}\\s*:`))
  if (at < 0) return null
  let i = body.indexOf(':', at) + 1, depth = 0, quote = null, out = ''
  for (; i < body.length; i++) {
    const c = body[i]
    if (quote) { out += c; if (c === quote && body[i - 1] !== '\\') quote = null; continue }
    if (c === '"' || c === "'" || c === '`') { quote = c; out += c; continue }
    if (c === '(' || c === '[') depth++
    if (c === ')' || c === ']') depth--
    if (c === ',' && depth === 0) break
    out += c
  }
  return out.trim()
}

const findings = []
const flag = (file, line, rule, detail, fix) =>
  findings.push({ file, line, rule, detail, fix })

// ── the rules ────────────────────────────────────────────────────────────
// 1. var() must resolve — against the design tokens or a local declaration.
//    This is the menu that painted with undefined tokens. It runs on EVERY
//    file, including the ones exempt from the value rules: a swatch is allowed
//    to state a hex, and is not allowed to name a token that does not exist.
function lintUnresolved(rel, src) {
  const local = new Set([...src.matchAll(/--([A-Za-z0-9-]+)\s*:/g)].map((m) => m[1]))
  for (const m of src.matchAll(/var\(\s*--([A-Za-z0-9-]+)\s*(\)|,)/g)) {
    const [, name, close] = m
    if (TOKENS.has(name) || local.has(name)) continue
    if (close === ',') continue // an explicit fallback is a deliberate choice
    flag(rel, lineOf(src, m.index), 'unresolved-token',
      `var(--${name}) — nothing declares it`,
      'use a token from @hanzo/design or declare it locally')
  }
}

function lintFile(abs, root) {
  const rel = relative(root, abs).split(sep).join('/')
  const raw = readFileSync(abs, 'utf8')
  const src = strip(raw)
  lintUnresolved(rel, src)
  if (EXEMPT.test('/' + rel)) return
  const isStyle = /\.(css|scss)$/.test(rel)

  // 2. no raw colour in a surface. The theme cannot reach a literal.
  for (const m of src.matchAll(/#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b|\b(?:rgba?|hsla?)\(/g)) {
    const line = lineOf(src, m.index)
    const text = src.split('\n')[line - 1] ?? ''
    if (/currentColor|transparent|url\(|\.svg|<svg|xmlns|viewBox|stopColor|fill=/.test(text)) continue
    flag(rel, line, 'raw-color', m[0].startsWith('#') ? m[0] : m[0] + '…)',
      'use --foreground / --surface-card / the --white-* ladder')
  }

  // 3. no bare z-index. The ladder is --z-base … --z-notification.
  for (const m of src.matchAll(/z-?[Ii]ndex\s*[:=]\s*['"{ ]*(-?\d+)/g))
    flag(rel, lineOf(src, m.index), 'raw-z-index', `z-index: ${m[1]}`,
      'use --z-dropdown / --z-modal / --z-toast …')
  for (const m of src.matchAll(/\bz-\[(-?\d+)\]/g))
    flag(rel, lineOf(src, m.index), 'raw-z-index', `z-[${m[1]}]`,
      'use var(--z-…) via an arbitrary property, not a magic number')

  // 4. no raw font-size. The scale is --type-* / --text-*.
  for (const m of src.matchAll(/font-?[Ss]ize\s*[:=]\s*['"{ ]*(\d+(?:\.\d+)?)(px|pt)/g))
    flag(rel, lineOf(src, m.index), 'raw-font-size', `${m[1]}${m[2]}`,
      'use --type-body / --type-h2 / the --text-* scale')

  // 5. sentence case. ALL CAPS is a different brand — eyebrows excepted, and
  //    an eyebrow says so by using --type-eyebrow / the eyebrow class.
  if (isStyle) {
    for (const m of src.matchAll(/text-transform\s*:\s*uppercase/g)) {
      const around = src.slice(Math.max(0, m.index - 400), m.index)
      if (/eyebrow|--type-eyebrow|tracking-widest/i.test(around)) continue
      flag(rel, lineOf(src, m.index), 'all-caps', 'text-transform: uppercase',
        'sentence case; use --type-eyebrow if it is genuinely an eyebrow')
    }
  } else {
    for (const m of src.matchAll(/>\s*([A-Z][A-Z0-9 &/'-]{5,40})\s*</g)) {
      const t = m[1].trim()
      if (!/[A-Z]{2}/.test(t) || /^[A-Z0-9 &/'-]+$/.test(t) === false) continue
      if (t.split(/\s+/).every((w) => w.length <= 3)) continue // AI, API, GPU…
      const line = lineOf(src, m.index)
      const around = src.split('\n').slice(Math.max(0, line - 4), line).join(' ')
      if (/eyebrow|uppercase|tracking-widest/i.test(around)) continue
      flag(rel, line, 'all-caps', `"${t}"`, 'sentence case for labels and headings')
    }
  }

  // 6. no inline style carrying design decisions. It outranks every token and
  //    every theme, which is exactly why it keeps being reached for.
  //    Only a LITERAL is a violation: `color:'#fff'`, `fontSize:13`. An
  //    identifier (`background:FILL[variant]`) is indirection we cannot read,
  //    and guessing there would train people to ignore the linter.
  for (const m of src.matchAll(/style=\{\{([^}]*)\}\}/g)) {
    const body = m[1]
    const bad = ['color', 'background', 'backgroundColor', 'fontSize', 'boxShadow', 'borderColor']
      .filter((k) => {
        const val = styleValue(body, k)
        if (val === null) return false
        if (/var\(/.test(val)) return false
        if (/^['"`]?(transparent|none|inherit|currentColor|unset|initial|auto)['"`]?$/i.test(val)) return false
        return /^['"`]/.test(val) || /^-?\d/.test(val)
      })
    if (bad.length)
      flag(rel, lineOf(src, m.index), 'inline-style', `style={{ ${bad.join(', ')} }}`,
        'move to a class; if it must be inline, the value must be var(--token)')
  }

  // 7. one icon set.
  for (const m of src.matchAll(/from\s+['"](@?[\w./-]*(?:react-icons|heroicons|font-awesome|@mui\/icons|feather-icons|phosphor)[\w./-]*)['"]/g))
    flag(rel, lineOf(src, m.index), 'icon-set', m[1], 'lucide-react, one set, no other')

  // 8. the import that makes all of the above resolvable.
  for (const m of src.matchAll(/['"]@hanzoai\/design/g))
    flag(rel, lineOf(src, m.index), 'wrong-package', '@hanzoai/design',
      'the package is @hanzo/design — @hanzoai/design is a 404 and resolves nothing')
}

// ── run ──────────────────────────────────────────────────────────────────
const targets = process.argv.slice(2).filter((a) => !a.startsWith('-'))
const roots = targets.length ? targets : [process.cwd()]
let scanned = 0
for (const r of roots) for (const f of walk(r)) { scanned++; lintFile(f, r === f ? dirname(r) : r) }

const RULES = ['unresolved-token', 'raw-color', 'raw-z-index', 'raw-font-size', 'all-caps', 'inline-style', 'icon-set', 'wrong-package']
if (!findings.length) {
  console.log(`hanzo-design-lint: ${scanned} files, clean`)
  process.exit(0)
}
for (const rule of RULES) {
  const hits = findings.filter((f) => f.rule === rule)
  if (!hits.length) continue
  console.log(`\n${rule}  (${hits.length})  — ${hits[0].fix}`)
  for (const h of hits.slice(0, 20)) console.log(`  ${h.file}:${h.line}  ${h.detail}`)
  if (hits.length > 20) console.log(`  … ${hits.length - 20} more`)
}
console.log(`\n${findings.length} violation(s) across ${scanned} files`)
process.exit(1)
