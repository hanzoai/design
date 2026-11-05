// @generated
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * A CONVERSATION and its tabs: the chat that makes things on the left, every
 * thing it made in a tab on the right. The same two panes as a Dev run, from
 * the same parts: @hanzo/ui's `Chat` for the thread and its composer (the one
 * composer, handed Studio's pills), and @hanzo/build's `Panel` over a `Deck` for the
 * tabs, scoped to this conversation so its tabs are kept with it.
 *
 * A new conversation has no id in the address until its first message is sent;
 * then the address names it, and the conversation in hand is the one shown.
 */
import { Gutter, Panel, PanelToggle, Reply, SideProvider, useDeck, useKey, usePanel, useSplit } from '@hanzo/build';
import { SizableText, useMedia, XStack, YStack } from '@hanzo/gui';
import { Check, ChevronDown, Clapperboard, Ellipsis, FileText, Image as ImageIcon, LoaderCircle, Music, Palette, Sparkles, X } from '@hanzogui/lucide-icons-2';
import { DropdownMenu } from '@hanzo/ui';
import { Chat as Thread, Composer, Failure } from '@hanzo/ui/chat';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { edit as editInPlace, turn } from './chat/turn.js';
import { keep, listed, open } from './chat/store.js';
import { Desk } from './desk.js';
import { Home } from './home.js';
import { useHost } from './host.js';
import { MODELS, ZEN } from './kinds/image.js';
import { ALL, kind } from './kinds/index.js';
import { lit } from './kinds/kind.js';
import { PRESETS } from './kinds/type/system.js';
import { BRAIN, touch, useAvailable, useLibrary, useWire, WRITER } from './live.js';
import { blank, current } from './made.js';
import { take } from './places.js';
import { path } from './route.js';
import { useUrl } from './use.js';
import { put } from './wire.js';
/** The conversations open in this page, by id: an address change does not drop the one in hand. */
const held = new Map();
/** The pane edge and gutter, as @hanzo/build cuts a Dev run's two panes. */
const pane = {
    bg: 'var(--pane-fill, var(--sheet-1))',
    rounded: 'var(--pane-round, var(--radius-xl))',
    borderWidth: 1,
    borderColor: 'var(--pane-edge, var(--white-08))',
    boxShadow: 'var(--shadow-sheet-2)',
};
const gap = 'var(--pane-gap, var(--space-2))';
export function Talk({ id }) {
    const host = useHost();
    const wire = useWire(host);
    const available = useAvailable(wire);
    const [chat, setChat] = useState(() => (id ? (held.get(id) ?? null) : blank()));
    const [failed, setFailed] = useState('');
    useEffect(() => {
        if (!id) {
            setChat(blank());
            return;
        }
        const mine = held.get(id);
        if (mine) {
            setChat(mine);
            return;
        }
        let live = true;
        setChat(null);
        open(wire, id).then((c) => {
            if (!live)
                return;
            if (!c)
                return setFailed('This conversation is not here, or belongs to another organization.');
            // A turn that was working when its page closed did not finish: say so.
            const settled = { ...c, turns: c.turns.map((t) => (t.doing ? { ...t, doing: undefined, failed: t.failed ?? 'Stopped: the page closed before this finished.' } : t)) };
            held.set(c.id, settled);
            setChat(settled);
        }, (e) => live && setFailed(e instanceof Error ? e.message : String(e)));
        return () => {
            live = false;
        };
    }, [id, wire]);
    if (failed) {
        return (_jsxs(YStack, { flex: 1, items: "center", justify: "center", gap: "$3", p: "$5", children: [_jsx(SizableText, { color: "$soft", children: failed }), _jsx(XStack, { render: "button", onPress: () => host.go(''), px: "$3", height: 34, items: "center", rounded: "$3", borderWidth: 1, borderColor: "$borderColor", cursor: "pointer", children: _jsx(SizableText, { size: "$2", children: "Start a new one" }) })] }));
    }
    if (!chat) {
        return (_jsx(YStack, { flex: 1, items: "center", justify: "center", children: _jsx(SizableText, { color: "$soft", children: "Opening\u2026" }) }));
    }
    return _jsx(Conversation, { start: chat, host: host, wire: wire, available: available }, chat.id);
}
function Conversation({ start, host, wire, available }) {
    const [chat, setChat] = useState(start);
    const latest = useRef(chat);
    const [draft, setDraft] = useState('');
    const [attached, setAttached] = useState([]);
    const [uploading, setUploading] = useState(0);
    const [picked, setPicked] = useState(null);
    const [options, setOptions] = useState({ model: 'auto', aspect: '', count: 1 });
    const [working, setWorking] = useState(null);
    const [editing, setEditing] = useState({});
    const [editFailed, setEditFailed] = useState({});
    const wide = useMedia().md;
    useLibrary(wire);
    const [desk, setDesk] = usePanel('studio', true, wide);
    useKey(() => setDesk(!desk));
    // The tabs' column, as Chat's and a Dev run's: the person's width, the chat hidden behind it, full screen.
    const split = useSplit(desk && wide && chat.made.length > 0, 'chat', () => setDesk(false));
    const deck = useDeck(`studio.${chat.id}`, { tabs: chat.made.map((m) => ({ id: m.id, kind: m.id, title: m.title })), at: chat.made.at(-1)?.id ?? null });
    const order = useRef([]);
    order.current = [...deck.tabs.map((t) => t.kind).filter((k) => chat.made.some((m) => m.id === k)), ...chat.made.map((m) => m.id).filter((m) => !deck.tabs.some((t) => t.kind === m))];
    // Saved after every change, at most once a second and a half; at once when a turn ends.
    const saving = useRef(null);
    const persist = useCallback((c, now = false) => {
        if (saving.current)
            clearTimeout(saving.current);
        const go = () => {
            saving.current = null;
            if (!c.turns.length)
                return;
            void keep(wire, c).catch(() => undefined);
        };
        if (now)
            go();
        else
            saving.current = setTimeout(go, 1500);
    }, [wire]);
    const changed = useCallback((c) => {
        latest.current = c;
        held.set(c.id, c);
        setChat(c);
        if (c.turns.length)
            touch(listed(c));
        persist(c);
    }, [persist]);
    const show = useCallback((mid) => {
        const m = latest.current.made.find((x) => x.id === mid);
        deck.open({ id: mid, kind: mid, title: m?.title ?? 'Made' });
        if (!order.current.includes(mid))
            order.current = [...order.current, mid];
        setDesk(true);
    }, [deck, setDesk]);
    const send = async (text, how = {}) => {
        const words = text.trim();
        if (!words && !attached.length)
            return;
        if (working)
            return;
        if (!host.person) {
            host.signIn?.();
            return;
        }
        const ctl = new AbortController();
        setWorking(ctl);
        const files = attached;
        setDraft('');
        setAttached([]);
        // The address names the conversation from its first message on.
        if (!latest.current.turns.length)
            host.go(path({ kind: 'chat', id: latest.current.id }), { replace: true });
        const defaultPrompt = files.some((f) => f.mime.startsWith('audio/'))
            ? 'Build a full-blown interactive music player and visualizer app around this audio track.'
            : files.some((f) => f.mime.startsWith('video/'))
                ? 'Here is a video clip.'
                : 'Here is an attached file.';
        const asked = {
            text: words || defaultPrompt,
            attached: files,
            kind: (how.kind ?? picked) || undefined,
            options: { model: options.model === 'auto' ? undefined : options.model, aspect: options.aspect || undefined, count: options.count > 1 ? options.count : undefined },
        };
        try {
            const end = await turn(latest.current, asked, {
                wire,
                brain: BRAIN,
                writer: WRITER,
                fleet: available.fleet,
                models: available.models,
                order: () => order.current,
                show,
                changed,
                signal: ctl.signal,
            });
            persist(end, true);
        }
        finally {
            setWorking(null);
        }
    };
    // A starter chosen in Explore starts this conversation.
    useEffect(() => {
        const s = take();
        if (s)
            begin(s);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const begin = (s) => {
        setPicked(s.kind);
        if (s.picture && !attached.length) {
            setDraft(s.prompt);
            attach();
            return;
        }
        void send(s.prompt, { kind: s.kind });
    };
    const attachWith = (accept, promptText, kindId) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept || 'image/*,audio/*,video/*,.mp3,.wav,.flac,.m4a,.ogg,.aac,.mp4,.webm,.mov,.pdf,.docx,.pptx,.xlsx,.csv,.json,.txt,.md,*/*';
        input.multiple = true;
        input.onchange = () => {
            const files = Array.from(input.files ?? []);
            if (!files.length)
                return;
            if (kindId)
                setPicked(kindId);
            if (promptText && !draft.trim())
                setDraft(promptText);
            void upload(files);
        };
        input.click();
    };
    const attach = () => attachWith();
    const inferMime = (f) => {
        if (f.type)
            return f.type;
        const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
        if (['mp3', 'wav', 'flac', 'm4a', 'ogg', 'aac', 'opus'].includes(ext))
            return `audio/${ext === 'mp3' ? 'mpeg' : ext}`;
        if (['mp4', 'webm', 'mov', 'm4v'].includes(ext))
            return `video/${ext === 'mov' ? 'quicktime' : ext}`;
        if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'avif'].includes(ext))
            return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
        if (ext === 'pdf')
            return 'application/pdf';
        return 'application/octet-stream';
    };
    const upload = async (files) => {
        const batch = files.slice(0, 6);
        if (!batch.length)
            return;
        setUploading((n) => n + batch.length);
        for (const f of batch) {
            try {
                const mime = inferMime(f);
                const folder = mime.startsWith('audio/') ? 'music' : mime.startsWith('video/') ? 'video' : mime.startsWith('image/') ? 'image' : 'document';
                const name = f.name.replace(/[^\w.-]+/g, '-').slice(-80) || 'upload.bin';
                const blob = f.type === mime ? f : new Blob([f], { type: mime });
                const key = await put(wire, `files/${folder}/${latest.current.id}/attached/${Date.now().toString(36)}/${name}`, blob);
                const bmp = mime.startsWith('image/') ? await createImageBitmap(f).catch(() => null) : null;
                setAttached((a) => [...a, { key, mime, name, width: bmp?.width, height: bmp?.height }]);
                bmp?.close();
            }
            catch {
                // The chip never appears; the person sees the file did not attach.
            }
            finally {
                setUploading((n) => n - 1);
            }
        }
    };
    const pick = (m, at) => changed({ ...latest.current, made: latest.current.made.map((x) => (x.id === m.id ? { ...x, at } : x)) });
    const editOne = async (m, patch, note) => {
        setEditing((e) => ({ ...e, [m.id]: true }));
        setEditFailed((e) => ({ ...e, [m.id]: '' }));
        try {
            const now = latest.current.made.find((x) => x.id === m.id) ?? m;
            await editInPlace(latest.current, now, patch, note, {
                wire,
                writer: WRITER,
                fleet: available.fleet,
                models: available.models,
                order: () => order.current,
                changed,
                signal: new AbortController().signal,
            });
        }
        catch (e) {
            setEditFailed((x) => ({ ...x, [m.id]: e instanceof Error ? e.message : String(e) }));
        }
        finally {
            setEditing((x) => ({ ...x, [m.id]: false }));
        }
    };
    const tabs = useMemo(() => chat.made.map((m) => {
        const Icon = kind(m.kind).icon;
        return {
            id: m.id,
            label: m.title,
            icon: _jsx(Icon, { size: 14 }),
            bleed: true,
            render: () => (_jsx(Desk, { made: chat.made.find((x) => x.id === m.id) ?? m, wire: wire, others: chat.made.filter((x) => x.id !== m.id), onPick: (at) => pick(m, at), onEdit: (patch, note) => void editOne(m, patch, note), busy: Boolean(editing[m.id]), failed: editFailed[m.id] })),
        };
    }), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chat.made, wire, editing, editFailed]);
    const messages = chat.turns.map((t) => ({ id: t.id, role: t.role, content: t.text }));
    const busy = Boolean(working);
    const empty = !chat.turns.length;
    const body = (said) => {
        const t = chat.turns.find((x) => x.id === said.id);
        if (!t)
            return null;
        if (t.role === 'user') {
            return (_jsxs(YStack, { gap: "$2", children: [t.attached?.length ? (_jsx(XStack, { gap: "$2", flexWrap: "wrap", children: t.attached.map((f) => (_jsx(Thumb, { wire: wire, file: f }, f.key))) })) : null, _jsx(SizableText, { size: "$4", whiteSpace: "pre-wrap", children: t.text })] }));
        }
        const made = (t.made ?? []).map((mid) => chat.made.find((m) => m.id === mid)).filter((m) => Boolean(m));
        return (_jsxs(YStack, { gap: "$2", children: [t.text ? (_jsx(SizableText, { size: "$4", whiteSpace: "pre-wrap", children: t.text })) : null, made.length ? (_jsx(XStack, { gap: "$2", flexWrap: "wrap", children: made.map((m) => (_jsx(Chip, { made: m, wire: wire, n: order.current.indexOf(m.id) + 1, onPress: () => show(m.id) }, m.id))) })) : null, t.doing ? (_jsxs(XStack, { items: "center", gap: "$2", "data-slot": "doing", children: [_jsx(LoaderCircle, { size: 14 }), _jsxs(SizableText, { size: "$2", color: "$soft", children: [t.doing, "\u2026"] })] })) : null, t.failed ? _jsx(Failure, { onRetry: busy ? undefined : () => void retry(t.id), children: t.failed }) : null, t.text && !t.doing ? _jsx(Reply, { text: t.text }) : null] }));
    };
    const retry = (assistant) => {
        const i = chat.turns.findIndex((t) => t.id === assistant);
        const q = chat.turns
            .slice(0, i)
            .reverse()
            .find((t) => t.role === 'user');
        if (q)
            void send(q.text);
    };
    const kindItems = [
        { key: 'auto', label: 'Auto', description: 'Design picks from what you ask', onSelect: () => setPicked(null) },
        ...ALL.map((k) => {
            const why = k.needs(available);
            return { key: k.id, label: k.label, description: why ? 'Needs a GPU' : k.blurb, disabled: Boolean(why), onSelect: () => setPicked(k.id) };
        }),
    ];
    const brandName = brandOf(chat);
    const brandItems = [
        { type: 'label', key: 'h', label: 'Draw in' },
        { key: 'none', label: 'Hanzo (default)', onSelect: () => changed({ ...latest.current, brand: undefined }) },
        ...chat.made
            .filter((m) => m.kind === 'type')
            .map((m) => ({ key: m.id, label: m.title, description: 'From this conversation', onSelect: () => changed({ ...latest.current, brand: m.id }) })),
        { type: 'separator', key: 's' },
        ...PRESETS.map((p) => ({
            key: `preset-${p.name}`,
            label: p.name,
            description: p.blurb,
            onSelect: () => {
                const m = { id: `type${Date.now().toString(36)}`, kind: 'type', title: p.name, at: 0, versions: [{ id: `v${Date.now().toString(36)}`, at: Date.now(), spec: p, files: [], note: `The ${p.name} preset`, by: 'preset' }] };
                changed({ ...latest.current, made: [...latest.current.made, m], brand: m.id });
                show(m.id);
            },
        })),
        { type: 'separator', key: 's2' },
        { key: 'make', label: 'Make a type system…', onSelect: () => setDraft('A type system for ') },
    ];
    const zen = lit(available.fleet, 'image.zen');
    const optionItems = [
        { type: 'label', key: 'm', label: 'Image model' },
        { key: 'auto', label: `${options.model === 'auto' ? '✓ ' : ''}Auto`, description: zen ? 'Zen Image on your GPU' : MODELS[0].label, onSelect: () => setOptions({ ...options, model: 'auto' }) },
        ...(zen ? [{ key: ZEN, label: `${options.model === ZEN ? '✓ ' : ''}Zen Image`, description: 'On your GPU', onSelect: () => setOptions({ ...options, model: ZEN }) }] : []),
        ...MODELS.map((m) => ({ key: m.id, label: `${options.model === m.id ? '✓ ' : ''}${m.label}`, onSelect: () => setOptions({ ...options, model: m.id }) })),
        { type: 'separator', key: 's' },
        { type: 'label', key: 'a', label: 'Aspect' },
        ...['', '1:1', '4:5', '9:16', '16:9', '3:2'].map((a) => ({ key: `a${a}`, label: `${options.aspect === a ? '✓ ' : ''}${a || 'As asked'}`, onSelect: () => setOptions({ ...options, aspect: a }) })),
        { type: 'separator', key: 's2' },
        { type: 'label', key: 'c', label: 'How many' },
        ...[1, 2, 4].map((n) => ({ key: `c${n}`, label: `${options.count === n ? '✓ ' : ''}${n}`, onSelect: () => setOptions({ ...options, count: n }) })),
    ];
    const tools = (_jsxs(XStack, { items: "center", gap: 2, children: [_jsx(DropdownMenu, { trigger: _jsx(Pillish, { label: "Kind", icon: _jsx(Sparkles, { size: 13 }), value: picked ? kind(picked).label : 'Auto' }), items: kindItems }), _jsx(DropdownMenu, { trigger: _jsx(Pillish, { label: "Brand", icon: _jsx(Palette, { size: 13 }), value: brandName }), items: brandItems }), _jsx(DropdownMenu, { trigger: _jsx(XStack, { render: "button", "aria-label": "More options: model, aspect, count", width: 32, height: 32, items: "center", justify: "center", rounded: 999, cursor: "pointer", hoverStyle: { bg: '$hover' }, children: _jsx(Ellipsis, { size: 16 }) }), items: optionItems })] }));
    const head = attached.length || uploading ? (_jsxs(XStack, { gap: "$2", flexWrap: "wrap", "data-slot": "attached", children: [attached.map((f) => (_jsxs(XStack, { position: "relative", children: [_jsx(Thumb, { wire: wire, file: f }), _jsx(XStack, { render: "button", "aria-label": `Remove ${f.name}`, onPress: () => setAttached((a) => a.filter((x) => x.key !== f.key)), position: "absolute", t: -6, r: -6, width: 20, height: 20, rounded: 99, bg: "$background", borderWidth: 1, borderColor: "$borderColor", items: "center", justify: "center", cursor: "pointer", children: _jsx(X, { size: 11 }) })] }, f.key))), uploading ? (_jsx(XStack, { width: 56, height: 56, rounded: "$3", bg: "$hover", items: "center", justify: "center", children: _jsx(LoaderCircle, { size: 16 }) })) : null] })) : undefined;
    const composer = {
        value: draft,
        onChange: setDraft,
        onSend: () => void send(draft),
        onStop: working ? () => working.abort() : undefined,
        busy,
        ready: Boolean(draft.trim() || attached.length),
        placeholder: empty ? 'Describe anything you want to create...' : 'Ask for a change, or something new',
        label: empty ? 'What will you create?' : 'What should we create?',
        head,
        plus: { upload: attach },
        // Kind, Brand and the image options are the pills above the field.
        pills: tools,
        column: !empty,
        narrow: !wide,
    };
    const deskPane = (sheet) => (_jsx(Panel, { side: deck, kinds: tabs, onHide: () => setDesk(false), sheet: sheet, label: "What this conversation made" }));
    return (_jsxs(XStack, { "data-slot": "studio-split", flex: 1, minH: 0, minW: 0, width: "100%", children: [_jsxs(YStack, { "data-slot": "studio-talk", ref: split.main, style: split.mainStyle, ...pane, flex: 1, minH: 0, minW: 0, width: "100%", overflow: "hidden", children: [empty ? (_jsx("main", { "data-slot": "studio-main", onDragOver: (e) => e.preventDefault(), onDrop: (e) => {
                            if (e.dataTransfer?.files?.length) {
                                e.preventDefault();
                                void upload(Array.from(e.dataTransfer.files));
                            }
                        }, style: {
                            minWidth: 0,
                            minHeight: 0,
                            flex: 1,
                            width: '100%',
                            height: '100%',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            background: 'var(--pane-fill, #0d0d0f)',
                        }, children: _jsxs("div", { style: {
                                marginLeft: 'auto',
                                marginRight: 'auto',
                                width: '100%',
                                maxWidth: 1120,
                                paddingLeft: wide ? 32 : 20,
                                paddingRight: wide ? 32 : 20,
                                paddingTop: wide ? 44 : 28,
                                paddingBottom: 56,
                                boxSizing: 'border-box',
                            }, children: [_jsxs("header", { style: { marginBottom: 28, textAlign: 'center' }, children: [_jsx("h1", { style: {
                                                margin: 0,
                                                fontSize: wide ? 30 : 24,
                                                lineHeight: wide ? '36px' : '30px',
                                                fontWeight: 600,
                                                letterSpacing: '-0.025em',
                                                color: 'var(--foreground, #fafafa)',
                                            }, children: "What will you create?" }), _jsx("p", { style: {
                                                margin: '8px 0 0 0',
                                                fontSize: 14,
                                                lineHeight: '20px',
                                                color: 'var(--muted-foreground, #a1a1aa)',
                                            }, children: "Describe what you want to make, or choose a template." })] }), _jsx("section", { style: {
                                        marginLeft: 'auto',
                                        marginRight: 'auto',
                                        marginBottom: 40,
                                        width: '100%',
                                        maxWidth: 760,
                                    }, children: _jsx(Composer, { ...composer }) }), _jsx("section", { "data-slot": "studio-starters", style: { width: '100%' }, children: _jsx(Home, { available: available, onStart: begin, onUpload: attachWith, onBrowseAll: () => host.go(path({ kind: 'explore' })) }) })] }) })) : (_jsxs(YStack, { flex: 1, minH: 0, minW: 0, width: "100%", children: [_jsxs(XStack, { px: "$4", pt: "$3", pb: "$2", gap: "$2", items: "center", minH: 44, children: [_jsx(SizableText, { render: "h1", size: "$5", color: "$ink", numberOfLines: 1, flex: 1, minW: 0, children: chat.title }), chat.made.length ? _jsx(PanelToggle, { open: desk, onToggle: () => setDesk(!desk) }) : null] }), _jsx(Thread, { messages: messages, streaming: busy, send: (text) => void send(text), stop: working ? () => working.abort() : undefined, body: body, center: false, onFiles: (files) => void upload(files), empty: _jsx(Opening, {}), composer: composer })] }))] }), desk && chat.made.length && !wide ? deskPane(true) : null, desk && chat.made.length && wide ? (_jsxs(YStack, { "data-slot": "studio-desk", ref: split.aside, ...pane, ml: gap, position: "relative", shrink: 0, minH: 0, style: split.asideStyle, children: [split.grip ? (_jsx(Gutter, { ...split.grip, label: "Resize the tabs", inset: pane.borderWidth })) : null, _jsx(SideProvider, { value: split.side, children: deskPane(false) })] })) : null] }));
}
function brandOf(chat) {
    const m = chat.brand ? chat.made.find((x) => x.id === chat.brand) : null;
    return m ? m.title : 'Hanzo';
}
function Opening() {
    return (_jsxs(YStack, { items: "center", width: "100%", pt: "$6", pb: "$2", gap: "$2", children: [_jsx(SizableText, { render: "h2", size: "$9", fontWeight: "600", color: "$ink", text: "center", children: "What should we create?" }), _jsx(SizableText, { size: "$3", color: "$soft", text: "center", children: "Visuals, images, posters, presentations, documents, brand systems, ads & interactive apps. Upload any file \u2014 everything opens in a tab." })] }));
}
/** A composer chip: what it sets, and its value. */
/** A menu's trigger: the menu hands it its state and handlers, and they land on the button itself. */
function Pillish({ label, icon, value, ...trigger }) {
    return (_jsxs(XStack, { ...trigger, render: "button", "aria-label": `${label}: ${value}`, items: "center", gap: "$1.5", height: 32, px: "$2.5", rounded: 999, borderWidth: 1, borderColor: "$borderColor", cursor: "pointer", hoverStyle: { bg: '$hover' }, children: [icon, _jsx(SizableText, { size: "$2", numberOfLines: 1, maxW: 120, children: value }), _jsx(ChevronDown, { size: 12 })] }));
}
/** What a turn made, as a chip that opens its tab. */
function Chip({ made, wire, n, onPress }) {
    const k = kind(made.kind);
    const Icon = k.icon;
    const pic = current(made).files.find((f) => f.mime.startsWith('image/'));
    const { src } = useUrl(wire, pic?.key);
    return (_jsxs(XStack, { render: "button", "aria-label": `Open tab ${n}: ${made.title}`, onPress: onPress, items: "center", gap: "$2", p: "$1.5", pr: "$3", rounded: "$4", borderWidth: 1, borderColor: "$borderColor", cursor: "pointer", hoverStyle: { bg: '$hover' }, maxW: 280, children: [src ? (_jsx("img", { src: src, alt: "", width: 40, height: 40, style: { borderRadius: 8, objectFit: 'cover' } })) : (_jsx(XStack, { width: 40, height: 40, rounded: "$3", bg: "$hover", items: "center", justify: "center", children: _jsx(Icon, { size: 16 }) })), _jsxs(YStack, { minW: 0, children: [_jsx(SizableText, { size: "$2", numberOfLines: 1, children: made.title }), _jsx(SizableText, { size: "$1", color: "$soft", children: `Tab ${n} · ${k.label} · v${made.at + 1}` })] }), _jsx(Check, { size: 13 })] }));
}
function Thumb({ wire, file }) {
    const isImage = file.mime.startsWith('image/');
    const { src } = useUrl(wire, isImage ? file.key : undefined);
    if (isImage && src) {
        return _jsx("img", { src: src, alt: file.name, width: 56, height: 56, style: { borderRadius: 8, objectFit: 'cover' } });
    }
    const Icon = file.mime.startsWith('audio/') ? Music : file.mime.startsWith('video/') ? Clapperboard : isImage ? ImageIcon : FileText;
    return (_jsxs(XStack, { height: 56, px: "$2.5", gap: "$2", rounded: "$3", bg: "$hover", items: "center", justify: "center", maxW: 180, children: [_jsx(Icon, { size: 16 }), _jsx(SizableText, { size: "$1", numberOfLines: 2, children: file.name })] }));
}
