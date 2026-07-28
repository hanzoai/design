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

`tokens/*.css` is the source of truth. Nine hand-authored files — colors,
typography, spacing, radius, elevation, motion, z, fonts, base — and everything
else is derived from them. `scripts/gen-tokens.mjs` parses all nine in a fixed
order and emits exactly one artifact, `src/tokens.gen.ts` (221 tokens, 9 groups).
That file is generated AND committed; never hand-edit it.

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

## Notes
- `--ring` and `--border-strong` sit at 3.67:1 (dark) and 4.24:1 (light) against
  their worst-case neighbours. `check-tokens.mjs` pins those; they are the
  tightest pairs in the system.
- KNOWN DRIFT: `guidelines/DESIGN.md` and `prompts/studio-designer.md` name Basel
  Grotesk as the canonical sans, while `tokens/fonts.css` declares Geist. The
  tokens win — prose has not caught up.
- `CLAUDE.md` is a symlink to this file.
