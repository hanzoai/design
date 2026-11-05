// @generated
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * The places beside the conversation: the Library (everything this org made),
 * Explore (every starter, and what each needs), and Activity (what is making
 * or rendering now).
 */
import { SizableText, XStack, YStack } from '@hanzo/gui';
import { Download, Search, Trash2 } from '@hanzogui/lucide-icons-2';
import { useEffect, useMemo, useState } from 'react';
import { useHost } from './host.js';
import { ALL, kind } from './kinds/index.js';
import { useAvailable, useChats, useLibrary, useWire } from './live.js';
import { path } from './route.js';
import { CATEGORIES, RUNTIME, STARTERS } from './starters.js';
import { Act, download, Pill } from './ui.js';
import { ask, discard, shelf } from './wire.js';
/** A starter handed from Explore to the conversation it starts. */
let queued = null;
export const queue = (s) => {
    queued = s;
};
export const take = () => {
    const s = queued;
    queued = null;
    return s;
};
function Page({ title, children, right }) {
    return (_jsx(YStack, { flex: 1, minH: 0, overflow: "scroll", bg: "var(--pane-fill, var(--sheet-1))", rounded: "var(--pane-round, var(--radius-xl))", borderWidth: 1, borderColor: "var(--pane-edge, var(--white-08))", children: _jsxs(YStack, { width: "100%", maxW: 1160, mx: "auto", p: "$4", gap: "$4", children: [_jsxs(XStack, { items: "center", gap: "$3", flexWrap: "wrap", children: [_jsx(SizableText, { render: "h1", size: "$7", fontWeight: "600", flex: 1, children: title }), right] }), children] }) }));
}
/* ----------------------------------------------------------------- library */
/** The Design kind whose mark a Library kind wears. */
const MARK = { image: 'image', document: 'document', slides: 'slides', type: 'type', poster: 'poster', ad: 'ad', app: 'app' };
export function Library() {
    const host = useHost();
    const wire = useWire(host);
    const [items, setItems] = useState(null);
    const [error, setError] = useState('');
    const [only, setOnly] = useState('all');
    const [q, setQ] = useState('');
    useLibrary(wire);
    const reload = () => {
        setError('');
        shelf(wire).then(setItems, (e) => setError(e instanceof Error ? e.message : String(e)));
    };
    useEffect(reload, [wire]);
    const kinds = useMemo(() => [...new Set((items ?? []).map((i) => i.kind))], [items]);
    const shown = (items ?? []).filter((i) => (only === 'all' || i.kind === only) && (!q || i.name.toLowerCase().includes(q.toLowerCase())));
    return (_jsxs(Page, { title: "Library", right: _jsxs(XStack, { items: "center", gap: "$2", height: 34, px: "$3", rounded: 999, borderWidth: 1, borderColor: "$borderColor", minW: 220, children: [_jsx(Search, { size: 14 }), _jsx("input", { "aria-label": "Search the library", placeholder: "Search", value: q, onChange: (e) => setQ(e.currentTarget.value), style: { flex: 1, border: 0, background: 'transparent', color: 'inherit', font: 'inherit', outline: 'none' } })] }), children: [_jsx(SizableText, { size: "$2", color: "$soft", children: "Saved to your Library, private to you until you share it." }), _jsxs(XStack, { gap: "$2", flexWrap: "wrap", role: "toolbar", "aria-label": "Kinds", children: [_jsx(Pill, { on: only === 'all', onPress: () => setOnly('all'), children: "All" }), kinds.map((k) => (_jsx(Pill, { on: only === k, onPress: () => setOnly(k), children: MARK[k] ? kind(MARK[k]).label : k }, k)))] }), error ? _jsx(SizableText, { color: "$red10", children: error }) : null, items === null && !error ? _jsx(SizableText, { color: "$soft", children: "Reading\u2026" }) : null, items && !shown.length ? _jsx(SizableText, { color: "$soft", children: items.length ? 'Nothing matches.' : 'Nothing made yet. Start on the home page.' }) : null, _jsx(XStack, { flexWrap: "wrap", gap: 12, role: "list", "aria-label": "Made", children: shown.map((i) => (_jsx(Thing, { wire: wire, item: i, onOpen: () => host.go(path({ kind: 'chat', id: i.ref })), onGone: reload }, i.id))) })] }));
}
function Thing({ wire, item, onOpen, onGone }) {
    const Icon = kind(MARK[item.kind] ?? 'image').icon;
    const pic = item.mime.startsWith('image/') ? item.url : '';
    const [busy, setBusy] = useState(false);
    const name = item.name;
    return (_jsxs(YStack, { role: "listitem", width: "calc(50% - 6px)", $sm: { width: 'calc(25% - 9px)' }, gap: "$1.5", children: [_jsxs(YStack, { render: "button", "aria-label": `Open ${name} in its conversation`, onPress: onOpen, rounded: 16, overflow: "hidden", bg: "$hover", cursor: "pointer", style: { aspectRatio: '4 / 5' }, items: "center", justify: "center", position: "relative", children: [pic ? _jsx("img", { src: pic, alt: "", style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } }) : _jsx(Icon, { size: 28 }), _jsx(XStack, { position: "absolute", t: 8, l: 8, width: 26, height: 26, rounded: 99, bg: "rgba(0,0,0,0.55)", items: "center", justify: "center", children: _jsx(Icon, { size: 13 }) })] }), _jsxs(XStack, { items: "center", gap: "$1", children: [_jsx(SizableText, { size: "$2", fontWeight: "600", numberOfLines: 1, flex: 1, children: name.replace(/\.[a-z0-9.]+$/i, '').replace(/-/g, ' ') }), _jsx(Act, { label: `Download ${name}`, onPress: () => void fetch(item.download || item.url, { credentials: 'omit' })
                            .then((r) => r.blob())
                            .then((b) => download(name, b)), children: _jsx(Download, { size: 13 }) }), _jsx(Act, { label: `Delete ${name}`, disabled: busy, onPress: () => {
                            if (!window.confirm(`Delete ${name} from your Library? Its conversation keeps the record.`))
                                return;
                            setBusy(true);
                            void discard(wire, item.id).finally(onGone);
                        }, children: _jsx(Trash2, { size: 13 }) })] }), _jsx(SizableText, { size: "$1", color: "$soft", mt: -4, children: `${MARK[item.kind] ? kind(MARK[item.kind]).label : item.kind} · ${new Date(item.created).toLocaleDateString()}` })] }));
}
/* ----------------------------------------------------------------- explore */
export function Explore() {
    const host = useHost();
    const wire = useWire(host);
    const available = useAvailable(wire);
    return (_jsxs(Page, { title: "Explore", children: [CATEGORIES.filter((c) => c.id !== 'all').map((c) => {
                const list = STARTERS.filter((s) => s.category === c.id);
                if (!list.length)
                    return null;
                return (_jsxs(YStack, { gap: "$2", children: [_jsx(SizableText, { size: "$4", fontWeight: "600", children: c.label }), _jsx(XStack, { flexWrap: "wrap", gap: "$2", children: list.map((s) => {
                                const why = kind(s.kind).needs(available);
                                return (_jsxs(YStack, { render: "button", "aria-disabled": why ? true : undefined, onPress: () => {
                                        if (why)
                                            return;
                                        queue(s);
                                        host.go('');
                                    }, width: 250, p: "$3", gap: "$1", rounded: "$4", borderWidth: 1, borderColor: "$borderColor", opacity: why ? 0.6 : 1, cursor: why ? 'default' : 'pointer', hoverStyle: why ? undefined : { bg: '$hover' }, children: [_jsxs(XStack, { justify: "space-between", children: [_jsx(SizableText, { size: "$3", fontWeight: "600", numberOfLines: 1, children: s.title }), _jsx(SizableText, { size: "$1", color: "$soft", children: RUNTIME[s.kind] })] }), _jsx(SizableText, { size: "$2", color: "$soft", numberOfLines: 2, children: why ? 'Needs a GPU: connect one with hanzo link.' : s.subtitle })] }, s.id));
                            }) })] }, c.id));
            }), _jsxs(YStack, { gap: "$2", children: [_jsx(SizableText, { size: "$4", fontWeight: "600", children: "Kinds" }), ALL.map((k) => (_jsxs(XStack, { gap: "$3", items: "center", children: [_jsx(k.icon, { size: 15 }), _jsx(SizableText, { size: "$2", width: 120, children: k.label }), _jsx(SizableText, { size: "$2", color: "$soft", flex: 1, children: k.needs(available) ?? k.blurb })] }, k.id)))] })] }));
}
export function Activity() {
    const host = useHost();
    const wire = useWire(host);
    const { rows } = useChats(wire);
    const available = useAvailable(wire);
    const [jobs, setJobs] = useState(null);
    const [error, setError] = useState('');
    useEffect(() => {
        let live = true;
        const read_ = () => ask(wire, 'engine', '/v1/render-queue').then((r) => live && (setJobs(r.jobs ?? []), setError('')), (e) => live && setError(e instanceof Error ? e.message : String(e)));
        void read_();
        const t = setInterval(read_, 5000);
        return () => {
            live = false;
            clearInterval(t);
        };
    }, [wire]);
    const making = rows.filter((r) => r.state === 'making');
    return (_jsxs(Page, { title: "Activity", children: [_jsxs(YStack, { gap: "$2", children: [_jsx(SizableText, { size: "$4", fontWeight: "600", children: "GPUs" }), _jsx(SizableText, { size: "$2", color: "$soft", children: available.fleet ? `${available.fleet.online} of ${available.fleet.total} online · ${available.fleet.state}` : available.error || 'Reading…' }), (available.fleet?.nodes ?? []).map((n) => (_jsx(SizableText, { size: "$2", children: `${n.name ?? n.identity}: ${(n.lanes ?? []).join(', ') || 'no lanes yet'}` }, n.identity)))] }), _jsxs(YStack, { gap: "$2", children: [_jsx(SizableText, { size: "$4", fontWeight: "600", children: "Rendering" }), error ? _jsx(SizableText, { color: "$red10", children: error }) : null, jobs && !jobs.length ? _jsx(SizableText, { color: "$soft", children: "Nothing is rendering." }) : null, (jobs ?? []).map((j) => (_jsxs(XStack, { gap: "$3", children: [_jsx(SizableText, { size: "$2", width: 90, children: j.status ?? 'queued' }), _jsx(SizableText, { size: "$2", flex: 1, numberOfLines: 1, children: j.prompt || j.kind || j.id }), _jsx(SizableText, { size: "$2", color: "$soft", children: j.node ?? '' })] }, j.id)))] }), _jsxs(YStack, { gap: "$2", children: [_jsx(SizableText, { size: "$4", fontWeight: "600", children: "Making now" }), !making.length ? _jsx(SizableText, { color: "$soft", children: "No conversation is working." }) : null, making.map((r) => (_jsx(XStack, { render: "button", onPress: () => host.go(path({ kind: 'chat', id: r.id })), cursor: "pointer", children: _jsx(SizableText, { size: "$2", children: r.title }) }, r.id)))] })] }));
}
