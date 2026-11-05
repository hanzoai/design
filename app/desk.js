// @generated
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * One tab: a thing the conversation made. Its bar picks the version shown,
 * compares two, and exports; its body is the kind's own view, which edits in
 * place (a new version, never an overwrite).
 *
 * Compare draws two versions: a wipe for pictures (drag the line), side by
 * side for everything else.
 */
import { SizableText, XStack, YStack } from '@hanzo/gui';
import { ChevronDown, Columns2, Download } from '@hanzogui/lucide-icons-2';
import { DropdownMenu } from '@hanzo/ui';
import { useState } from 'react';
import { kind } from './kinds/index.js';
import { current } from './made.js';
import { download } from './ui.js';
import { useUrl } from './use.js';
const ago = (t) => {
    const s = Math.max(0, Math.round((Date.now() - t) / 1000));
    if (s < 60)
        return 'just now';
    if (s < 3600)
        return `${Math.round(s / 60)}m ago`;
    if (s < 86400)
        return `${Math.round(s / 3600)}h ago`;
    return new Date(t).toLocaleDateString();
};
export function Desk({ made, wire, others, onPick, onEdit, busy, failed }) {
    const k = kind(made.kind);
    const v = current(made);
    const [against, setAgainst] = useState(null);
    const [error, setError] = useState('');
    const exporting = async (i) => {
        setError('');
        try {
            const out = await k.exports[i].run(wire, made, v);
            download(out.name, out.blob);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
    };
    const Icon = k.icon;
    const versions = made.versions.map((x, i) => ({
        key: x.id,
        label: `Version ${i + 1}${i === made.at ? ' (shown)' : ''}`,
        description: `${x.note.slice(0, 80)} · ${ago(x.at)}${x.by ? ` · ${x.by}` : ''}`,
        onSelect: () => onPick(i),
    }));
    const compare = against !== null && against !== made.at && made.versions[against] ? made.versions[against] : null;
    return (_jsxs(YStack, { flex: 1, minH: 0, "data-slot": "studio-tab", children: [_jsxs(XStack, { gap: "$1", px: "$2", py: "$1.5", items: "center", borderBottomWidth: 1, borderColor: "$borderColor", shrink: 0, flexWrap: "wrap", children: [_jsxs(XStack, { items: "center", gap: "$2", flex: 1, minW: 0, px: "$1", children: [_jsx(Icon, { size: 14 }), _jsx(SizableText, { size: "$2", fontWeight: "600", numberOfLines: 1, children: made.title })] }), _jsx(DropdownMenu, { trigger: _jsxs(XStack, { render: "button", "aria-label": `v${made.at + 1} of ${made.versions.length}, versions`, items: "center", gap: "$1", height: 30, px: "$2.5", rounded: "$3", cursor: "pointer", hoverStyle: { bg: '$hover' }, children: [_jsx(SizableText, { size: "$2", children: `v${made.at + 1} of ${made.versions.length}` }), _jsx(ChevronDown, { size: 13 })] }), items: [{ type: 'label', key: 'h', label: 'Versions' }, ...versions] }), made.versions.length > 1 ? (_jsx(DropdownMenu, { trigger: _jsxs(XStack, { render: "button", "aria-label": "Compare versions", "aria-pressed": compare ? true : undefined, items: "center", gap: "$1.5", height: 30, px: "$2.5", rounded: "$3", bg: compare ? '$hover' : 'transparent', cursor: "pointer", hoverStyle: { bg: '$hover' }, children: [_jsx(Columns2, { size: 14 }), _jsx(SizableText, { size: "$2", children: compare ? `v${(against ?? 0) + 1} | v${made.at + 1}` : 'Compare' })] }), items: [
                            { type: 'label', key: 'h', label: 'Compare with' },
                            ...made.versions.map((x, i) => ({ key: x.id, label: `Version ${i + 1}`, description: x.note.slice(0, 60), disabled: i === made.at, onSelect: () => setAgainst(i) })),
                            ...(compare ? [{ type: 'separator', key: 's' }, { key: 'off', label: 'Stop comparing', onSelect: () => setAgainst(null) }] : []),
                        ] })) : null, _jsx(DropdownMenu, { trigger: _jsxs(XStack, { render: "button", "aria-label": "Export", items: "center", gap: "$1.5", height: 30, px: "$2.5", rounded: "$3", cursor: "pointer", hoverStyle: { bg: '$hover' }, children: [_jsx(Download, { size: 14 }), _jsx(SizableText, { size: "$2", children: "Export" })] }), items: [{ type: 'label', key: 'h', label: 'Export' }, ...k.exports.map((x, i) => ({ key: x.label, label: x.label, onSelect: () => void exporting(i) }))] })] }), error || failed ? (_jsx(XStack, { px: "$3", py: "$2", bg: "$hover", shrink: 0, children: _jsx(SizableText, { size: "$2", color: "$red10", children: error || failed }) })) : null, compare ? (_jsx(Compare, { made: made, a: compare, b: v, wire: wire, others: others })) : (_jsx(k.View, { made: made, version: v, wire: wire, edit: onEdit, busy: busy, others: others }))] }));
}
function Compare({ made, a, b, wire, others }) {
    const pa = a.files.find((f) => f.mime.startsWith('image/'));
    const pb = b.files.find((f) => f.mime.startsWith('image/'));
    if (pa && pb && (made.kind === 'image' || made.kind === 'poster'))
        return _jsx(Wipe, { wire: wire, a: pa.key, b: pb.key, title: made.title });
    const k = kind(made.kind);
    const none = () => undefined;
    return (_jsx(XStack, { flex: 1, minH: 0, children: [a, b].map((v, i) => (_jsxs(YStack, { flex: 1, minW: 0, borderLeftWidth: i ? 1 : 0, borderColor: "$borderColor", children: [_jsx(SizableText, { size: "$1", color: "$soft", px: "$3", py: "$1", children: `Version ${made.versions.indexOf(v) + 1}` }), _jsx(k.View, { made: made, version: v, wire: wire, edit: none, busy: true, others: others })] }, v.id))) }));
}
/** Two pictures, one over the other, the line between them dragged across. */
function Wipe({ wire, a, b, title }) {
    const left = useUrl(wire, a);
    const right = useUrl(wire, b);
    const [at, setAt] = useState(50);
    return (_jsxs(YStack, { flex: 1, minH: 0, items: "center", justify: "center", p: "$3", gap: "$2", children: [_jsxs("div", { style: { position: 'relative', maxWidth: '100%', maxHeight: 'calc(100% - 40px)', display: 'inline-block' }, children: [right.src ? _jsx("img", { src: right.src, alt: `${title}, the version shown`, style: { display: 'block', maxWidth: '100%', maxHeight: '70vh', borderRadius: 12 } }) : null, left.src ? (_jsx("img", { src: left.src, alt: `${title}, the version compared`, style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', clipPath: `inset(0 ${100 - at}% 0 0)`, borderRadius: 12 } })) : null, _jsx("div", { "aria-hidden": true, style: { position: 'absolute', top: 0, bottom: 0, left: `${at}%`, width: 2, background: '#fff', boxShadow: '0 0 0 1px rgba(0,0,0,.4)' } })] }), _jsx("input", { type: "range", min: 0, max: 100, value: at, "aria-label": "Move the line between the two versions", onChange: (e) => setAt(Number(e.currentTarget.value)), style: { width: 'min(420px, 100%)' } })] }));
}
