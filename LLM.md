# @hanzo/design

The Hanzo design system: tokens, components, guidelines and the prompts that
teach it to a model. Published as `@hanzo/design` on npm. Consumed by every
surface that renders Hanzo — and by studio.hanzo.ai, which reads it to condition
what it generates.

## Canon

The derivation runs one way and never back:

    @hanzo/logo   the mark geometry (MARK_PATHS)
      -> @hanzo/brand   who a host is, and which mark it gets
        -> @hanzo/design  how anything built for that brand should look

`tokens/*.css` is the source of truth. Ten hand-authored files — colors,
typography, spacing, grid, radius, elevation, motion, z, fonts, base — and
everything else is derived from them. `scripts/gen-tokens.mjs` parses all ten in
a fixed order and emits exactly one artifact, `src/tokens.gen.ts` (232 tokens, 10
groups). That file is generated AND committed; never hand-edit it.

**spacing vs grid** is the one boundary worth stating, because both are "layout"
and it would be easy to write a value twice. `spacing.css` owns DISTANCES and the
field they apply to — the `--space-*` ramp, `--container-*`, `--gutter*`,
`--section-y*`. `grid.css` owns only what a grid knows that spacing does not:
how many columns (`--grid-columns: 12`), how far apart (`--grid-gap*`, which
REFERENCE `--space-*` rather than restating rem values), where it reflows
(`--breakpoint-*`), and the intrinsic card track (`--grid-card-min`). Nothing is
declared in both. `--breakpoint-*` deliberately uses the same names AND values as
Tailwind v4's defaults so the utility layer and the tokens resolve one value, not
two that happen to agree.

## How this ships

    push  ->  github.com/hanzoai/design        (a mirror)
      ->  git.hanzo.ai/hanzoai/design           CANONICAL
              .hanzo/workflows/publish.yml      publishes @hanzo/design to npm

`.github/workflows/` is empty. The forge reads `.hanzo/workflows/`, which uses
GitHub Actions syntax, so a workflow moves between the two by changing directory.
Gitea's own scheduler keeps the mirror current — there is no sync job here,
because a mirror does not need one.

`publish.yml` is the SOLE publisher. It fires when `version` in `package.json`
changes on `main`, skips a version already on the registry, and gates on
`pnpm build`, which regenerates the tokens, runs the suite and emits `dist/`.
`dist/` is gitignored, so publishing without that build ships an empty `.`
export. Needs `NPM_TOKEN` as a forge secret.

A repo only gets a forge runner if its Actions unit is on, and a migrate leaves
that off — `hanzoai/mirrors` `reconcile.py` switches it on for any repo carrying
`.hanzo/workflows`.

## Structure
```
tokens/           # 9 hand-authored .css files — THE source of truth
src/
  tokens.gen.ts   # generated from tokens/ by scripts/gen-tokens.mjs; committed
  index.ts        # re-exports tokens.gen + cssVar(name, fallback?)
components/       # 21 parts in 4 groups (core, forms, layout, feedback),
                  #   each a .jsx + .d.ts + .prompt.md triple
guidelines/       # prose + *.card.html specimens, each headed by a
                  #   <!-- @dsCard group= viewport= name= subtitle= --> line
prompts/          # 5 markdown files; the entry point is the skill, not these
skills/
  design-system/SKILL.md   # the ONE skill that teaches the system to a model
scripts/
  gen-tokens.mjs  # tokens/*.css -> src/tokens.gen.ts (deterministic)
  check-tokens.mjs# the gate: every token resolves, contrast ratios hold
  lint.mjs        # component lint
styles.css        # serves all 9 token files to a consumer
```

## Commands
```bash
pnpm install       # install dev deps
pnpm gen           # regenerate src/tokens.gen.ts from tokens/
pnpm test          # check-tokens + component lint
pnpm build         # gen + test + tsc  (the release gate)
```

## Editing
Change a value in `tokens/*.css`, then `pnpm build`. The generator is
deterministic, so the same input always yields the same `tokens.gen.ts`, and
`check-tokens.mjs` fails the build if a token stops resolving or a contrast
ratio drops below its floor. Everything outside `tokens/` is either generated
from it or hand-authored prose.

## Borders — three tiers, two ladders
The single thing most likely to be got wrong, because two of the tiers look
interchangeable and are not.

| token | value (dark) | ladder | owes |
|---|---|---|---|
| `--border` | `rgb(255 255 255 / .10)` | alpha | nothing. The hairline: cards, panels, dividers, rows. |
| `--border-strong` | `rgb(255 255 255 / .16)` | alpha | nothing. The same hairline on hover / emphasis. |
| `--border-control` | `--neutral-500` | neutral | **3:1** (WCAG 1.4.11). Input, select, textarea, checkbox, switch. |
| `--border-focus` | `--neutral-400` | neutral | one rung above `--border-control`, for a focused field. |

DECORATIVE edges come off the ALPHA ladder — they must stay quiet and must
composite over any surface. CONTROL edges come off the NEUTRAL ladder — they owe
a ratio, and a ratio you can only meet at a fixed value is not expressible as
alpha. `check-tokens.mjs` gates `--border-control` and `--ring`, and nothing
else; the two hairlines are free to be as quiet as they look.

Before 0.4.1 there were two tiers an octave apart — `--border` at `#1f1f1f`
(1.27:1, invisible on any lifted surface) and `--border-strong` at
`--neutral-500` (4.43:1). With nothing in between, every surface that wanted an
edge it could SEE reached for the control rung, and a 1px mid-grey box around a
card on near-black is a wireframe. `hanzoai/id` and `base/ui-react` both did
exactly that on cards, outline buttons and iframes. Having a middle is the fix.

The one live tradeoff: on a near-black ground a WCAG-perceivable boundary IS a
mid-grey — `#737373` is the floor, measured. So text fields still read louder
than everything else, and the reference surface this palette is derived from
(hanzoai/extension `sidebar.css`, `--input-border: rgba(255,255,255,0.15)`) is
quieter because it is NOT conformant at that rung. Pointing `--border-control`
at `--white-15` buys the reference's look and drops the gate; that is a product
decision, and it is one line.

## Mobile
Defaults are mobile-first and cost an app nothing:
`--space`/`--section-y`/`--header-height` are authored at PHONE values and scale
up at `min-width:48rem`; `--gutter` is `max(1rem, safe-area-inset)`, so a notch
is cleared with no per-app rule (needs `viewport-fit=cover` on the host page).
Under `@media (pointer:coarse)` `base.css` gives every control a 44px
`--tap-target` floor, expands checkbox/radio/switch hit areas to 44px with a
pseudo-element while the 16px box is untouched, and renders fields at
`--text-control` = 16px so iOS Safari stops zooming the viewport on focus.
`--text-control` is a TOKEN and not a rule because component sizes are set
inline, and an inline style outranks any stylesheet — a var() is the only thing
that reaches them.

## Notes
- `--ring` and `--border-control` sit at 3.19:1 (dark) and 4.05:1 (light) against
  their worst-case neighbours. `check-tokens.mjs` pins those; they are the
  tightest pairs in the system.
- The `--white-*` opacity ladder does NOT invert — it is white-on-white in
  `.light`. Any SEMANTIC token built from it must be restated in the `.light`
  block, and check 4 fails the build if one is missed. Components must paint
  from `--glass`/`--glass-strong`/`--surface-*`, never from a `--white-*` rung.
- KNOWN DRIFT: `guidelines/DESIGN.md` and `prompts/studio-designer.md` name Basel
  Grotesk as the canonical sans, while `tokens/fonts.css` declares Geist. The
  tokens win — prose has not caught up.
- `CLAUDE.md` is a symlink to this file.
