// @generated
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Under the composer while a conversation is empty: the template section header,
 * category pills, responsive 4-column desktop / 2-column tablet & mobile grid
 * of starter templates, and recent conversations.
 */
import { SizableText, useMedia, XStack, YStack } from '@hanzo/gui';
import { ArrowRight } from '@hanzogui/lucide-icons-2';
import { useState } from 'react';
import { useHost } from './host.js';
import { kind } from './kinds/index.js';
import { useChats, useWire } from './live.js';
import { path } from './route.js';
import { CATEGORIES, RUNTIME, STARTERS } from './starters.js';
import { Pill } from './ui.js';
import { useUrl } from './use.js';
import { FigmaDesignWorkspace } from './figma.js';

export function Home({ available, onStart, onBrowseAll }) {
    const [cat, setCat] = useState('all');
    const host = useHost();
    const media = useMedia();
    const runs = STARTERS.filter((s) => !kind(s.kind).needs(available));
    const shown = runs.filter((s) => cat === 'all' || s.category === cat);
    const cats = CATEGORIES.filter((c) => c.id === 'all' || runs.some((s) => s.category === c.id));
    const cols = media.lg ? 'repeat(4, minmax(0, 1fr))' : 'repeat(2, minmax(0, 1fr))';
    return (_jsxs(YStack, { "data-slot": "studio-home", width: "100%", gap: "$4", pb: "$6", children: [
        _jsx(FigmaDesignWorkspace, { host: host }),
        _jsxs(YStack, { gap: "$3", width: "100%", children: [
            _jsxs(XStack, { items: "center", justify: "space-between", gap: "$3", flexWrap: "wrap", width: "100%", children: [
                _jsx(SizableText, { size: "$3", fontWeight: "600", color: "$ink", children: "Start with a template" }),
                _jsxs(XStack, {
                    render: "button",
                    onPress: () => (cat !== 'all' ? setCat('all') : onBrowseAll ? onBrowseAll() : host.go(path({ kind: 'explore' }))),
                    items: "center",
                    gap: "$1",
                    px: "$2.5",
                    height: 28,
                    rounded: "$3",
                    cursor: "pointer",
                    hoverStyle: { bg: '$hover' },
                    children: [
                        _jsx(SizableText, { size: "$2", color: "$soft", children: "Browse all" }),
                        _jsx(ArrowRight, { size: 13, color: "var(--muted-foreground, #a1a1aa)" }),
                    ],
                }),
            ] }),
            _jsx(XStack, {
                role: "toolbar",
                "aria-label": "Categories",
                gap: "$1.5",
                flexWrap: "wrap",
                width: "100%",
                children: cats.map((c) => (_jsx(Pill, { on: cat === c.id, onPress: () => setCat(c.id), children: c.label }, c.id))),
            }),
        ] }),
        _jsx("div", {
            role: "list",
            "aria-label": "Starters",
            style: {
                display: 'grid',
                gridTemplateColumns: cols,
                gap: 16,
                width: '100%',
            },
            children: shown.map((s, i) => (_jsx(Card, { s: s, i: i, onPress: () => onStart(s) }, s.id))),
        }),
        _jsx(Recent, {}),
    ] }));
}

/** Monochrome wireframe motif inside each template card preview. */
function Wireframe({ s }) {
    const k = s.badge || s.category;
    if (k === 'Pitch deck' || k === 'Presentation' || s.kind === 'slides') {
        return (_jsxs("div", { "aria-hidden": true, style: { width: '78%', height: '64%', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)', padding: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }, children: [
            _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [
                _jsx("div", { style: { width: 28, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.35)' } }),
                _jsx("div", { style: { fontSize: 9, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono, monospace)' }, children: "01 / 10" }),
            ] }),
            _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 4 }, children: [
                _jsx("div", { style: { width: '72%', height: 6, borderRadius: 2, background: 'rgba(255,255,255,0.65)' } }),
                _jsx("div", { style: { width: '48%', height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.22)' } }),
            ] }),
        ] }));
    }
    if (k === 'Invoice' || k === 'Report' || s.kind === 'document') {
        return (_jsxs("div", { "aria-hidden": true, style: { width: '68%', height: '70%', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)', padding: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }, children: [
            _jsx("div", { style: { width: '45%', height: 5, borderRadius: 2, background: 'rgba(255,255,255,0.6)' } }),
            _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 4 }, children: [
                _jsx("div", { style: { width: '100%', height: 3, borderRadius: 1, background: 'rgba(255,255,255,0.16)' } }),
                _jsx("div", { style: { width: '88%', height: 3, borderRadius: 1, background: 'rgba(255,255,255,0.16)' } }),
                _jsx("div", { style: { width: '64%', height: 3, borderRadius: 1, background: 'rgba(255,255,255,0.28)' } }),
            ] }),
        ] }));
    }
    if (k === 'Brand' || s.kind === 'type') {
        return (_jsxs("div", { "aria-hidden": true, style: { width: '76%', height: '66%', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)', padding: 10, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }, children: [
            _jsx("div", { style: { fontSize: 24, fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1, color: 'rgba(255,255,255,0.78)' }, children: "Aa" }),
            _jsxs("div", { style: { display: 'flex', gap: 3 }, children: [
                _jsx("div", { style: { width: 10, height: 10, borderRadius: 3, background: '#fafafa' } }),
                _jsx("div", { style: { width: 10, height: 10, borderRadius: 3, background: '#71717a' } }),
                _jsx("div", { style: { width: 10, height: 10, borderRadius: 3, background: '#27272a', border: '1px solid rgba(255,255,255,0.2)' } }),
            ] }),
        ] }));
    }
    return (_jsxs("div", { "aria-hidden": true, style: { width: '76%', height: '66%', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)', padding: 10, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 5 }, children: [
        _jsx("div", { style: { width: 22, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.45)' } }),
        _jsx("div", { style: { fontSize: 13, fontWeight: 600, letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.82)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: s.title }),
    ] }));
}

/** A starter's card: full width inside its grid cell, dark monochrome aesthetic. */
function Card({ s, onPress }) {
    const k = kind(s.kind);
    const Icon = k.icon;
    const badge = s.badge || k.label;
    return (_jsxs(YStack, {
        role: "listitem",
        render: "button",
        "aria-label": `${s.title}: ${s.subtitle}`,
        onPress: onPress,
        width: "100%",
        minW: 0,
        rounded: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.08)",
        bg: "rgba(255, 255, 255, 0.025)",
        cursor: "pointer",
        hoverStyle: { bg: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.18)' },
        focusVisibleStyle: { outlineWidth: 2, outlineStyle: 'solid', outlineColor: '$outlineColor' },
        style: { textAlign: 'left', padding: 0 },
        children: [
            _jsxs(YStack, {
                position: "relative",
                width: "100%",
                items: "center",
                justify: "center",
                borderBottomWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.06)",
                style: {
                    aspectRatio: '16 / 10',
                    backgroundColor: '#111113',
                    backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px)',
                    backgroundSize: '14px 14px',
                },
                children: [
                    s.thumb ? (_jsx("img", { src: s.thumb, alt: "", style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } })) : (_jsx(Wireframe, { s: s })),
                    _jsxs(XStack, {
                        "aria-hidden": true,
                        position: "absolute",
                        t: 8,
                        l: 8,
                        r: 8,
                        justify: "space-between",
                        items: "center",
                        children: [
                            _jsxs(XStack, { px: "$2", height: 22, rounded: 99, bg: "rgba(0,0,0,0.65)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", items: "center", gap: "$1", children: [
                                _jsx(Icon, { size: 11, color: "rgba(255,255,255,0.75)" }),
                                _jsx(SizableText, { size: "$1", color: "rgba(255,255,255,0.85)", children: badge }),
                            ] }),
                            _jsx(XStack, { px: "$2", height: 20, rounded: 99, bg: "rgba(0,0,0,0.55)", items: "center", children: _jsx(SizableText, { size: "$1", color: "rgba(255,255,255,0.55)", children: RUNTIME[s.kind] }) }),
                        ],
                    }),
                ],
            }),
            _jsxs(YStack, { p: "$3", gap: 2, width: "100%", minW: 0, children: [
                _jsx(SizableText, { size: "$2", fontWeight: "600", color: "$ink", numberOfLines: 1, children: s.title }),
                _jsx(SizableText, { size: "$1", color: "$soft", numberOfLines: 1, children: s.subtitle }),
            ] }),
        ],
    }));
}

const STATE = { making: 'Making', done: 'Done', failed: 'Failed' };
/** The last eight conversations, each with what it is doing now. */
function Recent() {
    const host = useHost();
    const wire = useWire(host);
    const { rows } = useChats(wire);
    if (!rows.length)
        return null;
    return (_jsxs(YStack, { gap: "$2", pt: "$2", children: [
        _jsxs(XStack, { items: "center", justify: "space-between", children: [
            _jsx(SizableText, { size: "$3", fontWeight: "600", children: "Recent" }),
            _jsxs(XStack, { render: "button", "aria-label": "Open the library", onPress: () => host.go(path({ kind: 'library' })), items: "center", gap: "$1", cursor: "pointer", px: "$2", height: 28, rounded: "$3", hoverStyle: { bg: '$hover' }, children: [
                _jsx(SizableText, { size: "$2", color: "$soft", children: "Library" }),
                _jsx(ArrowRight, { size: 13 }),
            ] }),
        ] }),
        _jsx(XStack, { role: "list", "aria-label": "Recent conversations", gap: "$2", overflowX: "auto", pb: "$1", children: rows.slice(0, 8).map((r) => (_jsxs(YStack, { role: "listitem", render: "button", "aria-label": `${r.title}, ${STATE[r.state]}`, onPress: () => host.go(path({ kind: 'chat', id: r.id })), width: 148, shrink: 0, gap: "$1", cursor: "pointer", children: [
            _jsx(Cover, { wire: wire, cover: r.cover }),
            _jsx(SizableText, { size: "$2", numberOfLines: 1, children: r.title }),
            _jsxs(XStack, { items: "center", gap: "$1.5", children: [
                _jsx(XStack, { width: 6, height: 6, rounded: 6, bg: r.state === 'making' ? '$blue10' : r.state === 'failed' ? '$red10' : '$green10' }),
                _jsx(SizableText, { size: "$1", color: "$soft", children: `${STATE[r.state]} · ${r.count} made` }),
            ] }),
        ] }, r.id))) }),
    ] }));
}

function Cover({ wire, cover }) {
    const { src } = useUrl(wire, cover);
    return src ? (_jsx("img", { src: src, alt: "", width: 148, height: 110, style: { borderRadius: 12, objectFit: 'cover', width: 148, height: 110 } })) : (_jsx(YStack, { width: 148, height: 110, rounded: 12, bg: "$hover" }));
}
