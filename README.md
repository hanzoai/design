# Hanzo Design System

The single source of truth for the shared Hanzo product look — **typography**, the
**sidebar/panel system**, and the **true-black OLED palette** that must read as *one
product* across every surface (hanzo.ai, chat, app, console, commerce, admin).

Canonical values live in [`guidelines/DESIGN.md`](guidelines/DESIGN.md). This repo is
consumed by `@hanzo/ui` / `@hanzo/gui` and generated/edited agentically in **Hanzo
Studio** (see [`STUDIO_PROMPT.md`](STUDIO_PROMPT.md)).

```
tokens/       base·colors·fonts·spacing·radius·elevation·motion (.css) + real TS token modules
guidelines/   DESIGN.md — the canon (Basel Grotesk + Geist Mono, true-black palette, sidebar)
assets/       brand/ logos/ providers/ fonts/  (Basel woff2, marks, provider glyphs)
components/   component specs on the tokens
ui_kits/      per-surface kits (site, app, console…)
```

## One and one way
- Colors → `tokens/colors.css` (true-black OLED, monochrome — no colored accents)
- Fonts → `tokens/fonts.css` (Basel Grotesk `sans`, Geist Mono `mono`)
- Change a value here → every app converges on it. Never fork the value per app.
