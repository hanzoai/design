<div align="center">

# Hanzo Design System

**Monochrome. Dark by default. One hue rendered through an opacity ladder.**

The single source of truth for how every Hanzo surface looks — tokens, components, brand assets, and the guidelines that hold them together.

`@hanzoai/design`

</div>

## Use it

One import pulls in the whole token layer (fonts, color, type, spacing, radius, elevation, motion):

```css
@import "@hanzo/design/styles.css";
```

### Programmatic tokens (control look & feel from code)

The same tokens are exposed to TypeScript — **generated from the CSS**, so the two
can never drift. Edit a token in `tokens/*.css`, run `npm run build`, and both the
stylesheet and the code API update together. This is the one place to drive Hanzo's
look & feel programmatically (the `@hanzogui/shell` theme, Tamagui, any TS surface):

```ts
import { colors, spacing, radius, zIndex, cssVar } from '@hanzo/design'

spacing['space-4']    // "1rem"
radius['radius-full'] // "9999px"
zIndex['z-header']    // 300

// Prefer cssVar() so a value resolves through the live cascade (honors light/dark):
element.style.background = cssVar('--background')          // "var(--background)"
element.style.color      = cssVar('--foreground', '#fff')  // with a fallback
```

Groups: `colors`, `typography`, `spacing`, `radius`, `elevation`, `motion`, `zIndex`,
`fonts`, `base` (semantic aliases), plus `cssVars` (every token by its literal
`--name`). All authored **once** in the token CSS — the single source of truth.

Everything below is expressed as CSS custom properties, so code copies over 1:1 — the semantic names match `hanzo.ai`'s variables exactly.

```jsx
import { Button } from "@hanzoai/design/components/core/Button.jsx";
import { HanzoLogo } from "@hanzoai/design/components/core/HanzoLogo.jsx";

<Button pill>Try Hanzo</Button>
```

## What's inside

| Path | What |
|------|------|
| `styles.css` | The one entry point — imports every token file below. |
| `tokens/` | The palette. `colors` (monochrome opacity ladder, dark-default), `typography`, `spacing`, `radius`, `elevation`, `motion`, `z`, `fonts`, `base`. |
| `components/` | `core` (Button, Card, Badge, Icon, HanzoLogo, Avatar, ChromeText…), `forms`, `overlays`, `navigation` — each as `.jsx` + `.d.ts` + a `.prompt.md` usage guide. |
| `prompts/` | System-level generation guidance — the "make it look Hanzo" system prompt, do/don't rules, page prompts. |
| `content/` | The words — brand voice and taglines. |
| `docs/` | How to use the system — integrate the tokens, theme, extend. |
| `guidelines/` | Specimen cards — color, type, spacing, brand, iconography — the visual reference. |
| `assets/` | The mark, wordmark, favicon, provider + partner logos, brand imagery. |
| `ui_kits/` | Composed surfaces (e.g. `SiteChrome`) assembled from the components. |

## Principles

- **Monochrome by construction** — one neutral ladder plus an opacity ladder is the entire palette. Color appears only as genuine semantics (live/error/warning).
- **Dark is the default theme** — surfaces mount dark-first; light is the override.
- **Self-contained components** — inline styles, no CSS-framework coupling, so a component drops into any host (Next, Vite, Tamagui, none) and renders identically.
- **Every component ships its own `.prompt.md`** — a one-screen usage guide for humans and AI alike.

## Source of truth

Tokens track `hanzo.ai` (`app/globals.css`, `tailwind.config.ts`, `DESIGN.md`) and the press kit. When the brand moves, it moves here first.

## License

BSD-3-Clause. Brand marks (the Hanzo logo, partner and provider logos) are the property of their respective owners and are provided for identification.
