// @generated
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * The type system kind: generated from a prompt or a brand, or started from a
 * preset; drawn as a specimen page; exported as CSS variables, design tokens
 * and a @hanzo/gui theme. Its spec IS the type system, so an edit in place is
 * a patch to it, and `system.json` beside it is what the Brand chip lists.
 */
import { SizableText, XStack, YStack } from '@hanzo/gui';
import { Type } from '@hanzogui/lucide-icons-2';
import { useEffect } from 'react';
import { filename } from '../../made.js';
import { structured } from '../../wire.js';
import { Choice, Color, Row } from '../../ui.js';
import { str } from '../kind.js';
import { FAMILIES, font, stack, use } from './fonts.js';
import { BRIEF, contrast, css, gui, PRESETS, RATIOS, SCHEMA, settle, size, STEPS, tokens } from './system.js';
const preset = (name) => PRESETS.find((p) => p.name.toLowerCase() === name.toLowerCase()) ?? null;
const of = (spec) => settle(spec);
async function write(w, ask, base) {
    w.doing('Pairing faces and setting the scale');
    const from = base ? `\nStart from this system and change only what the brief asks:\n${JSON.stringify(base)}` : '';
    const raw = await structured(w.wire, w.writer, BRIEF + from, ask, SCHEMA, w.signal);
    return settle(raw, base ?? PRESETS[0]);
}
async function keep(w, t) {
    await w.keep('system.json', new Blob([JSON.stringify(t, null, 2)], { type: 'application/json' }));
}
export const type = {
    id: 'type',
    label: 'Type system',
    blurb: 'Faces, scale, weights and colours, as CSS, tokens and a gui theme.',
    icon: Type,
    tool: {
        name: 'make_type_system',
        description: 'Design a type system (a brand\'s faces, type scale, weights, line heights and colours). Use for "type system", "design system", "brand", "fonts", "typography". The result becomes the brand other things are drawn in.',
        parameters: {
            type: 'object',
            properties: {
                brief: { type: 'string', description: 'What the brand is and how it should feel, in the person\'s words.' },
                preset: { type: 'string', enum: PRESETS.map((p) => p.name), description: 'A starting system, when one fits or the person names it.' },
            },
            required: ['brief'],
        },
    },
    needs: () => null,
    make: async (w, args) => {
        const brief = str(args.brief);
        const start = preset(str(args.preset));
        const t = brief ? await write(w, brief, start) : (start ?? PRESETS[0]);
        await keep(w, t);
        return { title: t.name, draft: { spec: t, files: [], note: brief || `The ${t.name} preset`, by: brief ? w.writer : 'preset' } };
    },
    revise: async (w, made, change) => {
        const now = of(made.versions[made.at].spec);
        const t = change.patch ? settle({ ...now, ...change.patch }, now) : await write(w, str(change.instruction), now);
        await keep(w, t);
        return { spec: t, files: [], note: change.instruction ?? 'Edited', by: change.patch ? 'edit' : w.writer };
    },
    View: Specimen,
    exports: [
        { label: 'CSS variables', run: async (_w, m, v) => ({ name: filename(m.title, 'css'), blob: new Blob([css(of(v.spec))], { type: 'text/css' }) }) },
        { label: 'Design tokens (JSON)', run: async (_w, m, v) => ({ name: filename(m.title, 'tokens.json'), blob: new Blob([tokens(of(v.spec))], { type: 'application/json' }) }) },
        { label: 'gui theme (TypeScript)', run: async (_w, m, v) => ({ name: filename(m.title, 'theme.ts'), blob: new Blob([gui(of(v.spec))], { type: 'text/typescript' }) }) },
        { label: 'Specimen page (HTML)', run: async (_w, m, v) => ({ name: filename(m.title, 'html'), blob: new Blob([page(of(v.spec))], { type: 'text/html' }) }) },
    ],
};
/** The faces a system names, loaded into this page. */
export function useFaces(t) {
    useEffect(() => {
        if (!t)
            return;
        use(t.display);
        use(t.text);
        use(t.mono);
    }, [t?.display, t?.text, t?.mono]);
}
const SAMPLE = 'Every surface reads in one voice: the same faces, the same steps, the same colours, wherever it is drawn.';
function Specimen({ version, edit, busy }) {
    const t = of(version.spec);
    useFaces(t);
    const c = t.colors;
    const caps = { fontFamily: stack(t.text), fontSize: size(t, 'caption'), letterSpacing: `${t.tracking.caps}em`, textTransform: 'uppercase', color: c.muted, fontWeight: t.weights.strong };
    return (_jsxs(YStack, { flex: 1, minH: 0, overflow: "scroll", children: [_jsxs(XStack, { flexWrap: "wrap", gap: "$3", p: "$3", borderBottomWidth: 1, borderColor: "$borderColor", items: "flex-end", children: [_jsx(Row, { label: "Display", children: _jsx(Choice, { label: "Display face", value: t.display, options: FAMILIES.map((f) => ({ value: f })), onChange: (display) => edit({ display }, `Display face: ${display}`) }) }), _jsx(Row, { label: "Text", children: _jsx(Choice, { label: "Text face", value: t.text, options: FAMILIES.map((f) => ({ value: f })), onChange: (text) => edit({ text }, `Text face: ${text}`) }) }), _jsx(Row, { label: "Mono", children: _jsx(Choice, { label: "Mono face", value: t.mono, options: FAMILIES.filter((f) => font(f).role === 'mono').map((f) => ({ value: f })), onChange: (mono) => edit({ mono }, `Mono face: ${mono}`) }) }), _jsx(Row, { label: "Scale", children: _jsx(Choice, { label: "Scale ratio", value: String(t.scale.ratio), options: RATIOS.map(([r, n]) => ({ value: String(r), label: `${r} ${n}` })), onChange: (r) => edit({ scale: { ...t.scale, ratio: Number(r) } }, `Scale: ${r}`) }) }), _jsx(Row, { label: "Body", children: _jsx(Choice, { label: "Body size", value: String(t.scale.base), options: [14, 15, 16, 17, 18, 20].map((n) => ({ value: String(n), label: `${n}px` })), onChange: (b) => edit({ scale: { ...t.scale, base: Number(b) } }, `Body size: ${b}px`) }) }), Object.keys(c).map((k) => (_jsx(Row, { label: k, children: _jsx(Color, { label: `${k} colour`, value: c[k], onChange: (v) => edit({ colors: { ...c, [k]: v } }, `${k}: ${v}`) }) }, k))), busy ? (_jsx(SizableText, { size: "$1", color: "$soft", children: "Saving\u2026" })) : null] }), _jsxs("div", { "data-slot": "specimen", style: { background: c.paper, color: c.ink, padding: 'clamp(20px, 5vw, 56px)', minHeight: '100%' }, children: [_jsx("div", { style: caps, children: `${t.display} / ${t.text} / ${t.mono}` }), _jsx("h1", { style: {
                            fontFamily: stack(t.display),
                            fontWeight: t.weights.display,
                            fontSize: `clamp(40px, 9vw, ${size(t, 'display')}px)`,
                            lineHeight: t.leading.display,
                            letterSpacing: `${t.tracking.display}em`,
                            color: c.ink,
                            margin: '16px 0 12px',
                        }, children: t.name }), _jsx("p", { style: { fontFamily: stack(t.text), fontSize: size(t, 'lead'), lineHeight: t.leading.body, color: c.muted, maxWidth: '40em', margin: 0 }, children: t.blurb }), _jsx("div", { style: { height: 1, background: c.muted, opacity: 0.4, margin: '32px 0' } }), [...STEPS].reverse().map(([s]) => (_jsxs("div", { style: { display: 'flex', gap: 16, alignItems: 'baseline', margin: '0 0 10px', overflow: 'hidden' }, children: [_jsx("span", { style: { ...caps, width: 72, flexShrink: 0 }, children: `${s} ${size(t, s)}` }), _jsx("span", { style: {
                                    color: c.ink,
                                    fontFamily: stack(['display', 'h1', 'h2', 'h3', 'h4'].includes(s) ? t.display : t.text),
                                    fontWeight: s === 'display' ? t.weights.display : ['h1', 'h2', 'h3', 'h4'].includes(s) ? t.weights.heading : t.weights.body,
                                    fontSize: Math.min(size(t, s), 96),
                                    lineHeight: s === 'display' ? t.leading.display : ['h1', 'h2', 'h3', 'h4'].includes(s) ? t.leading.heading : t.leading.body,
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                }, children: "The quick brown fox" })] }, s))), _jsx("div", { style: { height: 1, background: c.muted, opacity: 0.4, margin: '32px 0' } }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }, children: [_jsxs("div", { children: [_jsx("div", { style: caps, children: "Text" }), _jsxs("p", { style: { fontFamily: stack(t.text), fontSize: size(t, 'body'), lineHeight: t.leading.body, fontWeight: t.weights.body, color: c.ink }, children: [SAMPLE, " ", _jsx("strong", { style: { fontWeight: t.weights.strong }, children: "Strong words hold their weight" }), ", and ", _jsx("em", { children: "emphasis leans" }), " without shouting."] })] }), _jsxs("div", { children: [_jsx("div", { style: caps, children: "Mono" }), _jsx("pre", { style: { fontFamily: stack(t.mono), fontSize: size(t, 'small'), lineHeight: 1.6, color: c.ink, whiteSpace: 'pre-wrap', margin: '12px 0 0' }, children: `--text-body: ${size(t, 'body')}px;\n--text-h1: ${size(t, 'h1')}px;\n--leading-body: ${t.leading.body};` })] })] }), _jsx("div", { style: { height: 1, background: c.muted, opacity: 0.4, margin: '32px 0' } }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }, children: Object.keys(c).map((k) => (_jsxs("div", { children: [_jsx("div", { style: { height: 56, borderRadius: 10, background: c[k], border: `1px solid ${c.muted}55` } }), _jsx("div", { style: { ...caps, marginTop: 8 }, children: k }), _jsx("div", { style: { fontFamily: stack(t.mono), fontSize: size(t, 'caption'), color: c.ink }, children: c[k] }), k !== 'paper' ? _jsx("div", { style: { fontFamily: stack(t.mono), fontSize: size(t, 'caption'), color: c.muted }, children: `${contrast(c[k], c.paper).toFixed(1)}:1 on paper` }) : null] }, k))) })] })] }));
}
const esc = (s) => s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
/** The specimen as a page of its own: the export. */
function page(t) {
    const links = [...new Set([t.display, t.text, t.mono].map((f) => font(f).css).filter(Boolean))].map((h) => `<link rel="stylesheet" href="${esc(h)}">`).join('\n');
    const rows = [...STEPS]
        .reverse()
        .map(([s]) => `<div class="row"><span class="caps">${s} ${size(t, s)}</span><span style="font: var(--weight-heading) ${size(t, s)}px/${t.leading.heading} var(--font-${['display', 'h1', 'h2', 'h3', 'h4'].includes(s) ? 'display' : 'text'})">The quick brown fox</span></div>`)
        .join('\n');
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t.name)}</title>${links}<style>${css(t)}
body{margin:0;padding:48px;background:var(--color-paper);color:var(--color-ink);font:var(--weight-body) var(--text-body)/var(--leading-body) var(--font-text)}
h1{font:var(--weight-display) var(--text-display)/var(--leading-display) var(--font-display);letter-spacing:var(--tracking-display);margin:16px 0}
.caps{font-size:var(--text-caption);letter-spacing:var(--tracking-caps);text-transform:uppercase;color:var(--color-muted);width:96px;flex-shrink:0}
.row{display:flex;gap:16px;align-items:baseline;white-space:nowrap;overflow:hidden}
</style></head><body><div class="caps">${esc(`${t.display} / ${t.text} / ${t.mono}`)}</div><h1>${esc(t.name)}</h1><p>${esc(t.blurb)}</p>${rows}<p>${esc(SAMPLE)}</p></body></html>`;
}
