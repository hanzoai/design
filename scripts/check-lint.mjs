/**
 * The flex-prop floor (lint.mjs rule 13), run the way a surface runs it: the
 * real script, in a scratch directory, against files that hold every shape the
 * JSX reader has to get right. A plain node script, like the other checks.
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const lint = join(dirname(fileURLToPath(import.meta.url)), 'lint.mjs')
const root = mkdtempSync(join(tmpdir(), 'hanzo-design-lint-'))
let failed = 0

const write = (path, src) => {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), src)
}
const run = (...args) => {
  try {
    return { code: 0, out: execFileSync('node', [lint, ...args], { cwd: root, encoding: 'utf8' }) }
  } catch (e) {
    return { code: e.status, out: `${e.stdout}${e.stderr}` }
  }
}
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : `\n     ${detail}`}`)
  if (!ok) failed++
}

// Two counted in app/: flex on the YStack, flexWrap in the XStack's media object.
// Not counted: grow and flexBasis on a Wrap's children (one through a fragment and
// a map), every `<` that is a comparison, a type argument or a generic arrow, a
// regex holding a quote, a string holding a tag, and an object outside JSX.
write('app/page.tsx', `
import { Wrap, XStack, YStack } from '@hanzo/gui'

const config = { flex: 1, grow: 2 }
const pick = <T,>(xs: T[]): T => xs[0]
const quote = /'/g
const html = '<View flex={1} />'

export function Page({ items }: { items: Array<string> }) {
  const n = useState<number>(0)
  if (n < 3 && items.length > 0) {}
  return (
    <YStack flex={1}>
      <Wrap gap="$2">
        <Chip grow={1} />
        <>{items.map((i) => <Tag key={i} flexBasis={100} />)}</>
      </Wrap>
      <XStack $sm={{ flexWrap: 'wrap' }} onPress={() => n > 2} />
    </YStack>
  )
}
`)
// Two counted in components/home/: a Wrap's GRANDchild is back outside it, and
// an element after a line comment inside an expression is still an element.
write('components/home/Card.tsx', `
export const Card = ({ open }) => (
  <Wrap>
    <YStack>
      <View shrink={1} />
      {open ? (
        // the comment's apostrophe and \`backticks\` are not code
        <View grow={1} />
      ) : null}
    </YStack>
  </Wrap>
)
`)

let r = run('app', 'components')
check('off until recorded: passes, says nothing about flex-prop', r.code === 0 && !r.out.includes('flex-prop'), r.out)

r = run('--record', 'app', 'components')
const allow = JSON.parse(readFileSync(join(root, 'hanzo-design.allow.json'), 'utf8'))
check(
  '--record writes per-directory counts',
  r.code === 0 && JSON.stringify(allow['flex-prop']) === JSON.stringify({ app: 2, 'components/home': 2 }),
  JSON.stringify(allow)
)

r = run('app', 'components')
check('at the floor: passes', r.code === 0, r.out)

write('app/more.tsx', `export const More = () => <XStack grow={1} />\n`)
r = run('app', 'components')
check(
  'growth in one directory fails and names it',
  r.code === 1 && r.out.includes('app: 3 found, 2 allowed') && r.out.includes('more.tsx:1'),
  r.out
)

rmSync(join(root, 'app/more.tsx'))
write('app/page.tsx', readFileSync(join(root, 'app/page.tsx'), 'utf8').replace('<YStack flex={1}>', '<YStack>'))
r = run('app', 'components')
check('under the floor passes and says what to lower it to', r.code === 0 && r.out.includes('Lower it to 1'), r.out)

writeFileSync(join(root, 'hanzo-design.allow.json'), JSON.stringify({ 'flex-props': {} }))
r = run('app', 'components')
check('a misspelt rule is refused', r.code === 1 && r.out.includes('not rules: flex-props'), r.out)

// inline-style (rule 6): every style object counts, and a comment saying why
// passes none of them. The one in a line comment is talk, not a style.
rmSync(join(root, 'app'), { recursive: true, force: true })
rmSync(join(root, 'components'), { recursive: true, force: true })
rmSync(join(root, 'hanzo-design.allow.json'), { force: true })
write('app/style.tsx', `
export const A = () => <div style={{ color: 'var(--foreground)' }} />
// inline-style: a reason no longer passes it
export const B = () => <div style={{ width: 1 }} />
export const C = () => <div /> // style={{ width: 1 }} is only mentioned here
`)
r = run('app')
check('inline-style: a comment passes nothing', r.code === 1 && /inline-style\s+\(2, NEW/.test(r.out), r.out)

rmSync(root, { recursive: true, force: true })
if (failed) {
  console.error(`check-lint: ${failed} failed`)
  process.exit(1)
}
console.log('check-lint: flex-prop floor and inline-style hold')
