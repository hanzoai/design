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
tokens/           # 10 hand-authored .css files — THE source of truth
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
  lint.mjs        # the consumer-code gate; `pnpm test` runs it on the WHOLE package
styles.css        # serves all 10 token files to a consumer, flattened
```

## Commands
```bash
pnpm install       # install dev deps
pnpm gen           # regenerate src/tokens.gen.ts from tokens/
pnpm test          # check-tokens + lint every file in the package
pnpm build         # gen + test + tsc  (the release gate)
```

## Editing
Change a value in `tokens/*.css`, then `pnpm build`. The generator is
deterministic, so the same input always yields the same `tokens.gen.ts`, and
`check-tokens.mjs` fails the build if a token stops resolving or a contrast
ratio drops below its floor. Everything outside `tokens/` is either generated
from it or hand-authored prose.

## Borders — ONE ladder, graded by duty
Every boundary is cut from the alpha ladder, so every boundary composites
correctly on the page, on a card and inside a popover. The rungs are the
reference's own measured values (hanzoai/extension `sidebar.css`).

| token | value (dark) | owes | spent on |
|---|---|---|---|
| `--border` | `rgb(255 255 255 / .10)` | nothing | the hairline: cards, panels, dividers, rows |
| `--border-strong` | `rgb(255 255 255 / .16)` | nothing | the same hairline on hover / emphasis |
| `--border-control` | `rgb(255 255 255 / .15)` | nothing | a control's resting edge — input, select, textarea |
| `--border-focus` | `rgb(255 255 255 / .22)` | nothing | that control, focused |
| `--border-selected` | `rgb(255 255 255 / .30)` | nothing | the CHOSEN thing — active tab, current tile, featured plan |
| `--ring` | `rgb(255 255 255 / .40)` | **3:1** | the focus indicator, and only that |

0.4.1 cut the middle three from the NEUTRAL ladder because a boundary that
clears WCAG 1.4.11's 3:1 on a near-black ground IS a mid-grey and no tuning
changes that. True — and also what a wireframe looks like: a 1px `#737373` box
around every field, four times heavier than the hairline beside it, so a form
read as a debug overlay. 0.4.2 spends the contrast budget where it is actually
load-bearing instead. **A resting edge is an affordance; a focus ring is a
position.** Only the second one is what you navigate by when you cannot see
well, so `--ring` keeps the gate (`check-tokens.mjs` pins it at 3:1 in both
themes, and it clears it BECAUSE it is alpha — on a lifted surface the ring
lifts with it, 3.67:1 dark / 3.85:1 light worst case, which a fixed grey cannot
do). Nothing else is gated.

Focus is not one treatment but two, and both are in `tokens/base.css`:
- a control that already HAS an edge brightens it (`.15` → `.22`) and gains a
  soft halo (`--ring-focus`), with `outline` suppressed — the reference's
  `.composer-box:focus-within`. A hard ring around a box that is already a box
  draws two boxes.
- anything else gets `outline: 2px solid var(--ring)` at `outline-offset: 2px`.

## Elevation — light, not shadow
You cannot cast a shadow onto black, so a system that ships only `box-shadow`
reads flat however heavy the alphas get. Depth here is three separable parts,
composed at the use site (`box-shadow: var(--edge-highlight), var(--shadow-lg)`):

1. a hairline **edge** — `--border`
2. an inset top **highlight** — `--edge-highlight`, the 1px white line that
   reads as the surface catching light from above. This is the part that was
   missing and the part that does most of the work.
3. a wide, very dark **drop** — `--shadow-*`

Plus `--bloom` (the glow around a LIT action on hover — in a monochrome brand
this is where "alive" comes from instead of a hue) and `--sheen-edge` (a top
hairline that dissolves before either corner, so an edge never ends in a hard
stop).

All of them are white, so all of them are restated in `.light` — including
`--edge-highlight`, which becomes `inset 0 0 0 0 transparent` rather than `none`
because `none` is not a legal layer in a comma list and would invalidate the
whole declaration, taking the drop shadow with it.

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
- `--ring` sits at 3.67:1 (dark) / 3.85:1 (light) against its worst-case
  neighbour, `--secondary`. It is the only gated pair in the system.
- The `--white-*` opacity ladder does NOT invert — it is white-on-white in
  `.light`. Any SEMANTIC token built from it must be restated in the `.light`
  block, and check 4 fails the build if one is missed. It scans `colors.css` AND
  `elevation.css`, and matches white-alpha ANYWHERE INSIDE a value, because the
  light vocabulary buries its colour inside a shadow or a gradient. Expansion
  stops at any token that is itself restated — deferring to a token that flips
  IS the fix, so `--ring-focus: 0 0 0 3px var(--ring-halo)` is theme-safe.
  Components must paint from `--glass`/`--glass-strong`/`--surface-*`, never
  from a `--white-*` rung — and never from a `--neutral-*` rung either: that is
  a palette, it does not invert, and a menu item painted `--neutral-100` was
  near-white text on the light theme's white popover.
- Surfaces are cut from `#262626` at `.35/.5/.75`, not from `#171717` at
  `.4/.5/.8`. The old recipe composited to `#101010` on a `#0a0a0a` page — six
  levels above the page, which is not a surface, and three such cards read as
  one flat field with hairlines ruled across it. `--surface-overlay` was
  `rgb(10 10 10 / .95)`: the page, at 95% of the page. A floating panel that is
  the same colour as the page is not floating.
- `--destructive` is `--state-error`, not a grey. "Delete everything" and "you
  cannot click this" must not be the same colour, and DESIGN.md §2.4 already
  lists `#ef4444` as permitted for exactly this meaning — the invalid-field
  state was already using it while the button that does the destroying was not.
- Every interactive state must be VISIBLE. `--secondary-hover` and
  `--primary-hover` exist because the first resolved to its own resting value
  and the second dropped 16%, which reads as the button going disabled under
  the cursor. An unfilled button's hover is the surface arriving, not the edge
  moving: `.15` → `.16` is a state nobody can see, and a state nobody can see is
  dead code.
- KNOWN DRIFT: `guidelines/DESIGN.md` and `prompts/studio-designer.md` name Basel
  Grotesk as the canonical sans, while `tokens/fonts.css` declares Geist. The
  tokens win — prose has not caught up.
- `CLAUDE.md` is a symlink to this file.

## License

Dual-licensed **MIT OR Apache-2.0** (`LICENSE-MIT`, `LICENSE-APACHE`), replacing the
previous BSD-3-Clause declaration. Original Hanzo work standardises on this pair per
HIP-0137 "One License" (`hanzoai/hips`, `HIPs/hip-0137-one-license.md`); forks keep
their upstream licence unchanged.
