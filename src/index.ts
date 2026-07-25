// @hanzo/design — the ONE programmatic control plane for Hanzo's look & feel.
//
// The look/feel is authored ONCE as CSS custom properties in tokens/*.css
// (monochrome, dark-default — "one hue through an opacity ladder"). This module
// exposes those exact tokens to code, generated from the CSS so the two can
// never drift. Change a token in the CSS → the stylesheet AND every code
// consumer (the @hanzogui/shell theme, Tamagui, any TS surface) update together.
//
//   import '@hanzo/design/styles.css'                 // the CSS layer (unchanged)
//   import { colors, spacing, radius, cssVar } from '@hanzo/design'  // the code layer
//
export * from './tokens.gen.js'
import { cssVars, type CssVarName } from './tokens.gen.js'

/**
 * A `var(--name[, fallback])` reference to a token — the ONE way code should
 * reach a token so it resolves through the live CSS cascade (honoring the
 * viewer's light/dark theme) rather than baking a fixed value.
 *
 *   background: cssVar('--background')      // → "var(--background)"
 *   color:      cssVar('--foreground', '#fff')
 */
export function cssVar(name: CssVarName | (string & {}), fallback?: string): string {
  const n = name.startsWith('--') ? name : `--${name}`
  return fallback ? `var(${n}, ${fallback})` : `var(${n})`
}

/** The raw authored value of a token (the literal from the CSS), or `undefined`. */
export function tokenValue(name: CssVarName): string | undefined {
  return (cssVars as Record<string, string>)[name]
}

/**
 * Inject the design-system stylesheet from code (idempotent) for surfaces that
 * cannot use a bundler CSS import (e.g. a runtime-mounted island). Prefer the
 * static `import '@hanzo/design/styles.css'` where a bundler is available.
 * No-op outside the browser.
 */
export function injectDesignCss(href = 'https://esm.sh/@hanzo/design/styles.css'): void {
  if (typeof document === 'undefined') return
  if (document.querySelector('link[data-hanzo-design]')) return
  const l = document.createElement('link')
  l.rel = 'stylesheet'
  l.href = href
  l.setAttribute('data-hanzo-design', '')
  document.head.appendChild(l)
}
