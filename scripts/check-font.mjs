/**
 * The vendored typeface must BE its source.
 *
 * `tokens/fonts.css` ships the faces as binaries rather than @import-ing
 * `@hanzo/font`, and every reason it gives is sound: an @font-face survives
 * being flattened into the middle of a larger sheet where an @import does not,
 * a sign-in page must make no third-party request, and the remote fetch was
 * render-blocking and broke offline dev. That file also names `@hanzo/font` as
 * "the one place the faces are AUTHORED", and calls what sits in `assets/fonts`
 * "a copy of its output".
 *
 * Nothing held the copy to the output. This package declared no dependency on
 * `@hanzo/font`, recorded no version of it, and compared no bytes — so the two
 * were free to drift, and they did:
 *
 *   @hanzo/font <=1.8.0  shipped faces whose name table still read Geist
 *   @hanzo/font  1.8.1   renamed them to Zen and added Hanzo's attribution
 *   @hanzo/design        carried the 1.8.0 bytes for eight more releases
 *
 * Every gate stayed green the whole time. The outlines were identical, so
 * nothing looked wrong; the fonts simply told every tool that inspected them —
 * font pickers, `local()` matching, licence audits — that Hanzo's typeface was
 * Geist. A glyph fix would have gone the same way, silently, into every surface
 * that renders Hanzo.
 *
 * So the copy is checked against its source, byte for byte. This fails when
 * `@hanzo/font` moves and the copy does not, which is the only moment it can
 * usefully speak.
 */
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const require = createRequire(import.meta.url)

// Found through an export rather than a hardcoded `node_modules/@hanzo/font`,
// so however the installer arranges the store, this reads the linked package.
const source = join(
  dirname(require.resolve('@hanzo/font/dist/fonts/zen-sans/Zen-Variable.woff2')),
  '..', '..', '..',
)
const version = JSON.parse(readFileSync(join(source, 'package.json'), 'utf8')).version

// The OFL puts the copyright notice with the binaries, so the licence is
// vendored from the same place and drifts the same way.
const copies = [
  ['dist/fonts/zen-sans/Zen-Variable.woff2', 'assets/fonts/Zen-Variable.woff2'],
  ['dist/fonts/zen-mono/ZenMono-Variable.woff2', 'assets/fonts/ZenMono-Variable.woff2'],
  ['LICENSE.txt', 'assets/fonts/LICENSE-Zen.txt'],
]

console.log(`font: assets/fonts vs @hanzo/font@${version}`)

// A digest rather than a length, because the two can be the same size and still
// be different faces — which is what a glyph fix usually looks like.
const digest = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 12)

const stale = []
for (const [from, to] of copies) {
  const a = readFileSync(join(source, from))
  const b = readFileSync(join(root, to))
  if (a.equals(b)) {
    console.log(`  ok   ${to}`)
  } else {
    stale.push([from, to])
    console.error(
      `  FAIL ${to}\n` +
      `       here          ${digest(b)}  ${b.length} bytes\n` +
      `       @hanzo/font   ${digest(a)}  ${a.length} bytes  (${from})`,
    )
  }
}

if (stale.length) {
  console.error(`\n${stale.length} vendored file(s) no longer match @hanzo/font@${version}.`)
  console.error('Re-vendor them, then commit the result:')
  for (const [from, to] of stale) console.error(`  cp node_modules/@hanzo/font/${from} ${to}`)
  process.exit(1)
}
console.log('font: the vendored copy is its source')
