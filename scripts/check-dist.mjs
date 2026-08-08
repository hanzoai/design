/**
 * Import the BUILT package the way a consumer does.
 *
 * Everything else in this repo checks the sources: the token files, the
 * generator's output, the preference contract. All of it passed while
 * `dist/index.js` was unimportable — 0.4.10 and 0.4.11 both shipped a barrel
 * that re-exported `'./preference'` with no extension, which TypeScript emits
 * verbatim and Node ESM refuses to resolve. `pnpm build` was green, `pnpm test`
 * was green, and `import '@hanzo/design'` threw ERR_MODULE_NOT_FOUND for every
 * consumer.
 *
 * A test that reads source cannot see that. This one loads the artifact.
 */
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

let failed = 0
const check = async (name, fn) => {
  try {
    await fn()
    console.log(`  ok   ${name}`)
  } catch (e) {
    failed++
    console.error(`  FAIL ${name}\n       ${e.message}`)
  }
}

console.log('dist:')

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

await check('every export the package advertises actually exists on disk', () => {
  const missing = []
  for (const [name, entry] of Object.entries(pkg.exports ?? {})) {
    for (const target of typeof entry === 'string' ? [entry] : Object.values(entry)) {
      if (typeof target !== 'string' || target.includes('*')) continue
      if (!existsSync(join(root, target))) missing.push(`${name} -> ${target}`)
    }
  }
  if (missing.length) throw new Error(`exports pointing at nothing:\n         ${missing.join('\n         ')}`)
})

await check('the barrel IMPORTS — the check that 0.4.10 and 0.4.11 needed', async () => {
  const entry = join(root, 'dist/index.js')
  if (!existsSync(entry)) throw new Error('dist/index.js is missing — run the build first')
  const mod = await import(pathToFileURL(entry).href)
  // The preference API is the part that was unreachable; naming it here means a
  // future re-export losing its extension fails by name rather than by silence.
  for (const name of ['vars', 'css', 'isColor', 'TYPE_MIN', 'TYPE_MAX', 'cssVar', 'tokenValue']) {
    if (mod[name] === undefined) throw new Error(`dist/index.js does not export ${name}`)
  }
  if (typeof mod.vars !== 'function') throw new Error('vars is not callable from the built package')
  const v = mod.vars({ type: 1.2, density: 'compact' })
  if (v['--type-scale'] !== '1.2') throw new Error(`built vars() returned ${JSON.stringify(v)}`)
})

await check('no emitted module uses an extensionless relative specifier', () => {
  // The class of bug, not just the one instance: Node ESM resolves relative
  // specifiers literally, so a missing `.js` is always a runtime failure.
  const bad = []
  for (const [, entry] of Object.entries(pkg.exports ?? {})) {
    const target = typeof entry === 'string' ? entry : entry.import
    if (typeof target !== 'string' || target.includes('*') || !target.endsWith('.js')) continue
    const file = join(root, target)
    if (!existsSync(file)) continue
    for (const m of readFileSync(file, 'utf8').matchAll(/from\s+['"](\.[^'"]*)['"]/g)) {
      if (!/\.(js|mjs|cjs|json|css)$/.test(m[1])) bad.push(`${target}: ${m[1]}`)
    }
  }
  if (bad.length) throw new Error(`extensionless relative imports:\n         ${bad.join('\n         ')}`)
})

if (failed) {
  console.error(`\n${failed} dist check(s) failed`)
  process.exit(1)
}
console.log('dist: all checks passed')
