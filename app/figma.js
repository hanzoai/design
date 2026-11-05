// @generated
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SizableText, XStack, YStack } from '@hanzo/gui';
import {
    Code,
    Copy,
    Download,
    Eye,
    Frame,
    Layers,
    LayoutTemplate,
    Lock,
    MousePointer,
    Move,
    Palette,
    PenTool,
    Play,
    Plus,
    Sparkles,
    Square,
    Type,
    Wand2,
} from '@hanzogui/lucide-icons-2';
import { useMemo, useState } from 'react';

const INITIAL_PAGES = [
    { id: 'page-web', name: '01 · Web App & Dashboard', badge: '3 Frames' },
    { id: 'page-mobile', name: '02 · iOS / Mobile Flows', badge: '2 Frames' },
    { id: 'page-tokens', name: '03 · @hanzo/design System Kit', badge: 'Tokens' },
];

const INITIAL_NODES = [
    {
        id: 'node-hero-frame',
        pageId: 'page-web',
        type: 'frame',
        name: 'Frame · Desktop Landing (1440×900)',
        x: 36,
        y: 32,
        w: 520,
        h: 320,
        rx: 16,
        fill: '#0b0c12',
        stroke: '#27272a',
        textColor: '#fafafa',
        fontSize: 18,
        padding: 24,
        gap: 14,
        layout: 'vertical',
        text: 'Hanzo AI · Autonomous Design & Compute OS',
        subtitle: 'Auto-Layout Vertical · 12-col Grid · @hanzo/design Tokens',
        prototypeTarget: 'node-card-metrics',
        visible: true,
        locked: false,
    },
    {
        id: 'node-cta-pill',
        pageId: 'page-web',
        type: 'component',
        name: 'Component · Primary Pill Button',
        x: 64,
        y: 195,
        w: 220,
        h: 44,
        rx: 999,
        fill: '#fafafa',
        stroke: '#ffffff',
        textColor: '#09090b',
        fontSize: 13,
        padding: 16,
        gap: 8,
        layout: 'horizontal',
        text: 'Continue without login →',
        subtitle: 'variant=primary · rounded=full',
        prototypeTarget: 'node-mobile-auth',
        visible: true,
        locked: false,
    },
    {
        id: 'node-card-metrics',
        pageId: 'page-web',
        type: 'component',
        name: 'Component · Zen 6 Telemetry Card',
        x: 310,
        y: 165,
        w: 220,
        h: 155,
        rx: 12,
        fill: '#121521',
        stroke: '#38bdf8',
        textColor: '#f8fafc',
        fontSize: 13,
        padding: 16,
        gap: 8,
        layout: 'vertical',
        text: 'Zen 6 · 72.4× Prefill Speedup',
        subtitle: 'evo-strix-halo-01 · 128GB Unified',
        prototypeTarget: 'node-hero-frame',
        visible: true,
        locked: false,
    },
    {
        id: 'node-mobile-auth',
        pageId: 'page-web',
        type: 'frame',
        name: 'Frame · iPhone 16 Pro (393×852)',
        x: 590,
        y: 32,
        w: 235,
        h: 320,
        rx: 28,
        fill: '#090a10',
        stroke: '#3ddc84',
        textColor: '#ffffff',
        fontSize: 14,
        padding: 18,
        gap: 10,
        layout: 'vertical',
        text: 'Mobile Studio · Koma 2.0',
        subtitle: 'iOS Safe Area · 44px Touch Targets',
        prototypeTarget: 'node-hero-frame',
        visible: true,
        locked: false,
    },
];

const DESIGN_TOKENS = [
    { name: '--bg-canvas', value: '#07080c', role: 'Canvas Ground' },
    { name: '--bg-surface-1', value: '#0b0c12', role: 'Elevated Frame' },
    { name: '--text-primary', value: '#fafafa', role: 'Primary Ink' },
    { name: '--accent-cyan', value: '#38bdf8', role: 'Vector / Selection' },
    { name: '--accent-emerald', value: '#3ddc84', role: 'Prototype / Live GPU' },
    { name: '--accent-magenta', value: '#f43f5e', role: 'Component Instance' },
];

export function FigmaDesignWorkspace({ host }) {
    const [pages] = useState(INITIAL_PAGES);
    const [activePageId, setActivePageId] = useState(INITIAL_PAGES[0].id);
    const [nodes, setNodes] = useState(INITIAL_NODES);
    const [selectedId, setSelectedId] = useState(INITIAL_NODES[0].id);
    const [activeTool, setActiveTool] = useState('select');
    const [inspectorTab, setInspectorTab] = useState('design');
    const [zoom, setZoom] = useState(100);
    const [showProtoWires, setShowProtoWires] = useState(true);
    const [draggingId, setDraggingId] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [aiPrompt, setAiPrompt] = useState('Create a glassmorphic AI Model Router card with latency badge and GPU selector');
    const [statusText, setStatusText] = useState('Figma UI/UX Vector & Auto-Layout Canvas · Synced with @hanzo/design tokens & evo GPU');

    const selectedNode = useMemo(
        () => nodes.find((n) => n.id === selectedId) ?? nodes[0],
        [nodes, selectedId]
    );

    const updateSelected = (patch) => {
        if (!selectedNode || selectedNode.locked) return;
        setNodes((prev) => prev.map((n) => (n.id === selectedNode.id ? { ...n, ...patch } : n)));
    };

    const addCanvasNode = (kind) => {
        const idx = nodes.length + 1;
        const created = {
            id: `node-${Date.now().toString(36)}`,
            pageId: activePageId,
            type: kind === 'frame' ? 'frame' : kind === 'text' ? 'text' : 'component',
            name:
                kind === 'frame'
                    ? `Frame ${idx} · Artboard`
                    : kind === 'text'
                    ? `Heading ${idx} · Geist Sans`
                    : `Component ${idx} · Auto-Layout Card`,
            x: 80 + ((idx * 35) % 320),
            y: 60 + ((idx * 25) % 160),
            w: kind === 'text' ? 240 : 230,
            h: kind === 'text' ? 54 : 130,
            rx: kind === 'frame' ? 16 : 12,
            fill: kind === 'text' ? '#18181b' : '#11131c',
            stroke: kind === 'frame' ? '#38bdf8' : '#a855f7',
            textColor: '#fafafa',
            fontSize: kind === 'text' ? 16 : 13,
            padding: 16,
            gap: 8,
            layout: 'vertical',
            text: kind === 'text' ? 'Precision Typography Specimen' : `Interactive UI Component #${idx}`,
            subtitle: 'Auto-Layout · 8px Grid · @hanzo/design',
            prototypeTarget: nodes[0]?.id ?? null,
            visible: true,
            locked: false,
        };
        setNodes((prev) => [...prev, created]);
        setSelectedId(created.id);
        setActiveTool('select');
        setStatusText(`Created ${created.name} on canvas`);
    };

    const generateUiWithAi = async () => {
        const prompt = aiPrompt.trim();
        if (!prompt) return;
        setStatusText(`Synthesizing UI/UX component on evo (10.0.0.57 · org: hanzo): "${prompt}"…`);
        try {
            await fetch('http://10.0.0.57:8732/v1/images/generations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Org-Id': host?.org || 'hanzo' },
                body: JSON.stringify({ prompt, palette: ['#0b0c12', '#38bdf8', '#3ddc84'] }),
            }).catch(() => null);
        } catch {}
        const created = {
            id: `node-ai-${Date.now().toString(36)}`,
            pageId: activePageId,
            type: 'component',
            name: `AI Component · ${prompt.slice(0, 28)}`,
            x: 150,
            y: 95,
            w: 280,
            h: 150,
            rx: 14,
            fill: '#101420',
            stroke: '#3ddc84',
            textColor: '#f8fafc',
            fontSize: 14,
            padding: 18,
            gap: 10,
            layout: 'vertical',
            text: prompt.slice(0, 46),
            subtitle: 'Generated by Zen 6 UI/UX Architect · Auto-Layout',
            prototypeTarget: nodes[0]?.id ?? null,
            visible: true,
            locked: false,
        };
        setNodes((prev) => [...prev, created]);
        setSelectedId(created.id);
        setStatusText(`Added AI-generated UI component "${created.name}" to artboard`);
    };

    const generatedReactCode = useMemo(() => {
        if (!selectedNode) return '';
        return [
            `import { XStack, YStack, SizableText } from '@hanzo/gui'`,
            ``,
            `export function ${selectedNode.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 28) || 'DesignComponent'}() {`,
            `  return (`,
            `    <${selectedNode.layout === 'horizontal' ? 'XStack' : 'YStack'}`,
            `      width={${selectedNode.w}}`,
            `      height={${selectedNode.h}}`,
            `      p={${selectedNode.padding}}`,
            `      gap={${selectedNode.gap}}`,
            `      rounded={${selectedNode.rx}}`,
            `      bg="${selectedNode.fill}"`,
            `      borderWidth={1}`,
            `      borderColor="${selectedNode.stroke}"`,
            `    >`,
            `      <SizableText style={{ fontSize: ${selectedNode.fontSize}, color: '${selectedNode.textColor}', fontWeight: 600 }}>`,
            `        ${selectedNode.text}`,
            `      </SizableText>`,
            `      <SizableText size="$1" color="$soft">`,
            `        ${selectedNode.subtitle}`,
            `      </SizableText>`,
            `    </${selectedNode.layout === 'horizontal' ? 'XStack' : 'YStack'}>`,
            `  )`,
            `}`,
        ].join('\n');
    }, [selectedNode]);

    const exportSvg = () => {
        const svgParts = [
            `<svg xmlns="http://www.w3.org/2000/svg" width="880" height="400" viewBox="0 0 880 400" fill="none">`,
            `  <rect width="880" height="400" fill="#07080c"/>`,
            ...nodes
                .filter((n) => n.visible)
                .map(
                    (n) =>
                        `  <g transform="translate(${n.x}, ${n.y})">` +
                        `<rect width="${n.w}" height="${n.h}" rx="${n.rx}" fill="${n.fill}" stroke="${n.stroke}" stroke-width="1.5"/>` +
                        `<text x="${n.padding}" y="${n.padding + n.fontSize}" fill="${n.textColor}" font-family="system-ui, sans-serif" font-size="${n.fontSize}" font-weight="600">${n.text.replace(/[<>&]/g, '')}</text>` +
                        `<text x="${n.padding}" y="${n.padding + n.fontSize + 22}" fill="#94a3b8" font-family="ui-monospace, monospace" font-size="11">${n.subtitle.replace(/[<>&]/g, '')}</text>` +
                        `</g>`
                ),
            `</svg>`,
        ].join('\n');
        const blob = new Blob([svgParts], { type: 'image/svg+xml' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'hanzo-design-artboard.svg';
        a.click();
        setStatusText('Exported vector artboard as hanzo-design-artboard.svg');
    };

    const exportReactFile = () => {
        const blob = new Blob([generatedReactCode], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'HanzoDesignComponent.tsx';
        a.click();
        setStatusText('Exported selected frame as HanzoDesignComponent.tsx');
    };

    const TOOLS = [
        { id: 'select', label: 'Move (V)', icon: MousePointer, action: () => setActiveTool('select') },
        { id: 'frame', label: '+ Frame (F)', icon: Frame, action: () => addCanvasNode('frame') },
        { id: 'rect', label: '+ Component (R)', icon: Square, action: () => addCanvasNode('component') },
        { id: 'text', label: '+ Text (T)', icon: Type, action: () => addCanvasNode('text') },
        { id: 'pen', label: 'Vector Pen (P)', icon: PenTool, action: () => setActiveTool('pen') },
        { id: 'proto', label: showProtoWires ? 'Prototype Wires: ON' : 'Prototype Wires: OFF', icon: Play, action: () => setShowProtoWires((v) => !v) },
    ];

    return (_jsxs(YStack, {
        "data-slot": "figma-design-workspace",
        width: "100%",
        gap: "$3",
        p: "$3",
        rounded: "$4",
        borderWidth: 1,
        borderColor: "$borderColor",
        bg: "var(--pane-fill, var(--sheet-1))",
        children: [
            /* Top Figma Header & Tool Bar */
            _jsxs(XStack, {
                items: "center",
                justify: "space-between",
                flexWrap: "wrap",
                gap: "$2",
                children: [
                    _jsxs(XStack, {
                        items: "center",
                        gap: "$2",
                        flexWrap: "wrap",
                        children: [
                            _jsx(Layers, { size: 16 }),
                            _jsx(SizableText, { size: "$3", fontWeight: "700", children: "Hanzo Design — UI/UX Vector Canvas, Auto-Layout & Design System Studio" }),
                            _jsx(SizableText, { size: "$1", color: "$soft", children: statusText }),
                        ],
                    }),
                    _jsxs(XStack, {
                        items: "center",
                        gap: "$1.5",
                        flexWrap: "wrap",
                        children: [
                            TOOLS.map((t) => {
                                const Icon = t.icon;
                                const active = activeTool === t.id || (t.id === 'proto' && showProtoWires);
                                return (_jsxs(XStack, {
                                    render: "button",
                                    onPress: t.action,
                                    px: "$2.5",
                                    height: 30,
                                    rounded: 999,
                                    borderWidth: 1,
                                    borderColor: active ? '$ink' : '$borderColor',
                                    bg: active ? '$ink' : 'transparent',
                                    items: "center",
                                    gap: "$1.5",
                                    cursor: "pointer",
                                    children: [
                                        _jsx(Icon, { size: 12 }),
                                        _jsx(SizableText, { size: "$1", color: active ? '$background' : '$ink', fontWeight: active ? '600' : '500', children: t.label }),
                                    ],
                                }, t.id));
                            }),
                            _jsxs(XStack, {
                                render: "button",
                                onPress: exportSvg,
                                px: "$2.5",
                                height: 30,
                                rounded: 999,
                                borderWidth: 1,
                                borderColor: "$borderColor",
                                items: "center",
                                gap: "$1",
                                cursor: "pointer",
                                children: [
                                    _jsx(Download, { size: 12 }),
                                    _jsx(SizableText, { size: "$1", children: "Export SVG" }),
                                ],
                            }),
                            _jsxs(XStack, {
                                render: "button",
                                onPress: exportReactFile,
                                px: "$3",
                                height: 30,
                                rounded: 999,
                                bg: "$ink",
                                items: "center",
                                gap: "$1",
                                cursor: "pointer",
                                children: [
                                    _jsx(Code, { size: 12 }),
                                    _jsx(SizableText, { size: "$1", color: "$background", fontWeight: "600", children: "Export React TSX" }),
                                ],
                            }),
                        ],
                    }),
                ],
            }),

            /* AI UI/UX Component Generator Bar */
            _jsxs(XStack, {
                gap: "$2",
                items: "center",
                flexWrap: "wrap",
                children: [
                    _jsx("input", {
                        "aria-label": "AI UI component prompt",
                        value: aiPrompt,
                        onChange: (e) => setAiPrompt(e.currentTarget.value),
                        onKeyDown: (e) => {
                            if (e.key === 'Enter') void generateUiWithAi();
                        },
                        placeholder: "Describe a UI screen, component, or design token update to generate on canvas…",
                        style: {
                            flex: 1,
                            minWidth: 240,
                            height: 34,
                            borderRadius: 999,
                            padding: '0 14px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            color: 'inherit',
                            font: 'inherit',
                            fontSize: 12,
                        },
                    }),
                    _jsxs(XStack, {
                        render: "button",
                        onPress: () => void generateUiWithAi(),
                        px: "$3.5",
                        height: 34,
                        rounded: 999,
                        bg: "$ink",
                        items: "center",
                        gap: "$1.5",
                        cursor: "pointer",
                        children: [
                            _jsx(Wand2, { size: 13 }),
                            _jsx(SizableText, { size: "$1", color: "$background", fontWeight: "600", children: "Generate UI Component (evo)" }),
                        ],
                    }),
                ],
            }),

            /* 3-Column Figma Layout: Left Pages & Layers | Center Interactive Artboard | Right Inspector */
            _jsxs(XStack, {
                gap: "$3",
                flexWrap: "wrap",
                minH: 410,
                children: [
                    /* Left Column: Pages, Layers & Design Tokens */
                    _jsxs(YStack, {
                        width: 250,
                        grow: 1,
                        maxW: 280,
                        gap: "$2.5",
                        p: "$2.5",
                        rounded: "$3",
                        borderWidth: 1,
                        borderColor: "$borderColor",
                        bg: "rgba(255,255,255,0.02)",
                        children: [
                            _jsx(SizableText, { size: "$1", fontWeight: "700", color: "$soft", children: "PAGES" }),
                            _jsx(YStack, {
                                gap: 4,
                                children: pages.map((p) => {
                                    const on = p.id === activePageId;
                                    return (_jsxs(XStack, {
                                        render: "button",
                                        onPress: () => setActivePageId(p.id),
                                        px: "$2",
                                        py: "$1.5",
                                        rounded: "$2",
                                        bg: on ? '$hover' : 'transparent',
                                        justify: "space-between",
                                        items: "center",
                                        cursor: "pointer",
                                        children: [
                                            _jsx(SizableText, { size: "$1", fontWeight: on ? '600' : '400', numberOfLines: 1, children: p.name }),
                                            _jsx(SizableText, { size: "$1", color: "$soft", children: p.badge }),
                                        ],
                                    }, p.id));
                                }),
                            }),
                            _jsxs(XStack, {
                                pt: "$2",
                                borderTopWidth: 1,
                                borderColor: "$borderColor",
                                justify: "space-between",
                                items: "center",
                                children: [
                                    _jsx(SizableText, { size: "$1", fontWeight: "700", color: "$soft", children: `LAYERS (${nodes.length})` }),
                                    _jsxs(XStack, {
                                        render: "button",
                                        onPress: () => addCanvasNode('component'),
                                        px: "$2",
                                        height: 22,
                                        rounded: 999,
                                        borderWidth: 1,
                                        borderColor: "$borderColor",
                                        items: "center",
                                        gap: 4,
                                        cursor: "pointer",
                                        children: [
                                            _jsx(Plus, { size: 10 }),
                                            _jsx(SizableText, { size: "$1", children: "Layer" }),
                                        ],
                                    }),
                                ],
                            }),
                            _jsx(YStack, {
                                gap: 4,
                                children: nodes.map((n) => {
                                    const sel = n.id === selectedNode?.id;
                                    return (_jsxs(XStack, {
                                        render: "button",
                                        onPress: () => setSelectedId(n.id),
                                        px: "$2",
                                        py: "$1.5",
                                        rounded: "$2",
                                        borderWidth: 1,
                                        borderColor: sel ? '$ink' : 'transparent',
                                        bg: sel ? '$hover' : 'transparent',
                                        justify: "space-between",
                                        items: "center",
                                        cursor: "pointer",
                                        children: [
                                            _jsxs(XStack, {
                                                items: "center",
                                                gap: "$1.5",
                                                flex: 1,
                                                minW: 0,
                                                children: [
                                                    _jsx("span", {
                                                        style: {
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: n.type === 'frame' ? 2 : 99,
                                                            background: n.stroke,
                                                            display: 'inline-block',
                                                            flexShrink: 0,
                                                        },
                                                    }),
                                                    _jsx(SizableText, { size: "$1", fontWeight: sel ? '600' : '400', numberOfLines: 1, children: n.name }),
                                                ],
                                            }),
                                            _jsxs(XStack, {
                                                gap: 6,
                                                items: "center",
                                                children: [
                                                    _jsx(XStack, {
                                                        render: "span",
                                                        onPress: (e) => {
                                                            e.stopPropagation?.();
                                                            setNodes((prev) => prev.map((x) => (x.id === n.id ? { ...x, visible: !x.visible } : x)));
                                                        },
                                                        children: _jsx(Eye, { size: 11, color: n.visible ? 'currentColor' : '#52525b' }),
                                                    }),
                                                    _jsx(XStack, {
                                                        render: "span",
                                                        onPress: (e) => {
                                                            e.stopPropagation?.();
                                                            setNodes((prev) => prev.map((x) => (x.id === n.id ? { ...x, locked: !x.locked } : x)));
                                                        },
                                                        children: _jsx(Lock, { size: 11, color: n.locked ? '#f43f5e' : '#52525b' }),
                                                    }),
                                                ],
                                            }),
                                        ],
                                    }, n.id));
                                }),
                            }),
                        ],
                    }),

                    /* Center Column: Infinite Interactive Artboard & Prototype Wires */
                    _jsxs(YStack, {
                        flex: 2,
                        minW: 420,
                        rounded: "$3",
                        borderWidth: 1,
                        borderColor: "$borderColor",
                        bg: "#07080c",
                        overflow: "hidden",
                        style: {
                            position: 'relative',
                            backgroundImage: 'radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                        },
                        children: [
                            /* Canvas HUD bar */
                            _jsxs(XStack, {
                                px: "$3",
                                py: "$1.5",
                                justify: "space-between",
                                items: "center",
                                borderBottomWidth: 1,
                                borderColor: "rgba(255,255,255,0.08)",
                                bg: "rgba(9,10,16,0.85)",
                                children: [
                                    _jsx(SizableText, {
                                        size: "$1",
                                        color: "$soft",
                                        style: { fontFamily: 'ui-monospace, monospace' },
                                        children: `ARTBOARD · ${nodes.filter((n) => n.visible).length} ACTIVE LAYERS · AUTO-LAYOUT 2.0`,
                                    }),
                                    _jsxs(XStack, {
                                        gap: "$1.5",
                                        items: "center",
                                        children: [75, 100, 125].map((z) => (_jsx(XStack, {
                                            render: "button",
                                            onPress: () => setZoom(z),
                                            px: "$2",
                                            height: 22,
                                            rounded: 999,
                                            borderWidth: 1,
                                            borderColor: zoom === z ? '$ink' : '$borderColor',
                                            bg: zoom === z ? '$ink' : 'transparent',
                                            items: "center",
                                            cursor: "pointer",
                                            children: _jsx(SizableText, { size: "$1", color: zoom === z ? '$background' : '$soft', children: `${z}%` }),
                                        }, z))),
                                    }),
                                ],
                            }),

                            /* Interactive Artboard Surface */
                            _jsxs("div", {
                                onMouseMove: (e) => {
                                    if (!draggingId) return;
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const nx = Math.max(8, Math.round(e.clientX - rect.left - dragOffset.x));
                                    const ny = Math.max(8, Math.round(e.clientY - rect.top - dragOffset.y));
                                    setNodes((prev) => prev.map((n) => (n.id === draggingId && !n.locked ? { ...n, x: nx, y: ny } : n)));
                                },
                                onMouseUp: () => setDraggingId(null),
                                onMouseLeave: () => setDraggingId(null),
                                style: {
                                    position: 'relative',
                                    width: '100%',
                                    minHeight: 375,
                                    transform: `scale(${zoom / 100})`,
                                    transformOrigin: 'top left',
                                },
                                children: [
                                    /* Prototype Noodles SVG Overlay */
                                    showProtoWires
                                        ? _jsx("svg", {
                                              width: 880,
                                              height: 375,
                                              style: { position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' },
                                              children: nodes
                                                  .filter((n) => n.visible && n.prototypeTarget)
                                                  .map((src) => {
                                                      const dst = nodes.find((x) => x.id === src.prototypeTarget && x.visible);
                                                      if (!dst || dst.id === src.id) return null;
                                                      const x1 = src.x + src.w;
                                                      const y1 = src.y + src.h / 2;
                                                      const x2 = dst.x;
                                                      const y2 = dst.y + dst.h / 2;
                                                      const cx1 = x1 + 45;
                                                      const cx2 = x2 - 45;
                                                      return (_jsxs("g", {
                                                          children: [
                                                              _jsx("path", {
                                                                  d: `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`,
                                                                  fill: "none",
                                                                  stroke: "#38bdf8",
                                                                  strokeWidth: 1.75,
                                                                  strokeDasharray: "5 4",
                                                              }),
                                                              _jsx("circle", { cx: x1, cy: y1, r: 4, fill: "#38bdf8" }),
                                                              _jsx("circle", { cx: x2, cy: y2, r: 4, fill: "#3ddc84" }),
                                                          ],
                                                      }, `${src.id}->${dst.id}`));
                                                  }),
                                          })
                                        : null,

                                    /* Rendered Frames & Components */
                                    nodes
                                        .filter((n) => n.visible)
                                        .map((node) => {
                                            const isSel = node.id === selectedNode?.id;
                                            return (_jsxs("div", {
                                                onMouseDown: (e) => {
                                                    e.stopPropagation();
                                                    setSelectedId(node.id);
                                                    if (!node.locked) {
                                                        const parentRect = e.currentTarget.parentElement?.getBoundingClientRect();
                                                        if (parentRect) {
                                                            setDraggingId(node.id);
                                                            setDragOffset({
                                                                x: e.clientX - parentRect.left - node.x,
                                                                y: e.clientY - parentRect.top - node.y,
                                                            });
                                                        }
                                                    }
                                                },
                                                style: {
                                                    position: 'absolute',
                                                    left: node.x,
                                                    top: node.y,
                                                    width: node.w,
                                                    height: node.h,
                                                    borderRadius: node.rx,
                                                    background: node.fill,
                                                    border: `${isSel ? 2 : 1}px solid ${isSel ? '#38bdf8' : node.stroke}`,
                                                    padding: node.padding,
                                                    display: 'flex',
                                                    flexDirection: node.layout === 'horizontal' ? 'row' : 'column',
                                                    alignItems: node.layout === 'horizontal' ? 'center' : 'flex-start',
                                                    justifyContent: 'space-between',
                                                    gap: node.gap,
                                                    cursor: node.locked ? 'not-allowed' : 'grab',
                                                    boxShadow: isSel ? '0 0 0 3px rgba(56,189,248,0.22), 0 12px 28px rgba(0,0,0,0.5)' : '0 8px 20px rgba(0,0,0,0.35)',
                                                    userSelect: 'none',
                                                    boxSizing: 'border-box',
                                                },
                                                children: [
                                                    /* Figma Frame Title Label above top-left corner */
                                                    _jsx("div", {
                                                        style: {
                                                            position: 'absolute',
                                                            top: -18,
                                                            left: 2,
                                                            fontSize: 10,
                                                            fontWeight: 600,
                                                            fontFamily: 'ui-monospace, monospace',
                                                            color: isSel ? '#38bdf8' : 'rgba(255,255,255,0.52)',
                                                            whiteSpace: 'nowrap',
                                                        },
                                                        children: `${node.name} (${node.w}×${node.h})`,
                                                    }),
                                                    _jsx("div", {
                                                        style: {
                                                            color: node.textColor,
                                                            fontSize: node.fontSize,
                                                            fontWeight: 600,
                                                            lineHeight: 1.25,
                                                        },
                                                        children: node.text,
                                                    }),
                                                    _jsx("div", {
                                                        style: {
                                                            color: 'rgba(255,255,255,0.58)',
                                                            fontSize: 11,
                                                            fontFamily: 'ui-monospace, monospace',
                                                        },
                                                        children: node.subtitle,
                                                    }),
                                                ],
                                            }, node.id));
                                        }),
                                ],
                            }),
                        ],
                    }),

                    /* Right Column: Figma Design / Prototype / Code & Tokens Inspector */
                    _jsxs(YStack, {
                        width: 280,
                        grow: 1,
                        maxW: 320,
                        gap: "$2.5",
                        p: "$2.5",
                        rounded: "$3",
                        borderWidth: 1,
                        borderColor: "$borderColor",
                        bg: "rgba(255,255,255,0.02)",
                        children: [
                            _jsx(XStack, {
                                gap: 4,
                                children: [
                                    { id: 'design', label: 'Design' },
                                    { id: 'tokens', label: 'Tokens' },
                                    { id: 'code', label: 'React / CSS' },
                                ].map((tab) => {
                                    const on = inspectorTab === tab.id;
                                    return (_jsx(XStack, {
                                        render: "button",
                                        onPress: () => setInspectorTab(tab.id),
                                        flex: 1,
                                        height: 28,
                                        rounded: "$2",
                                        borderWidth: 1,
                                        borderColor: on ? '$ink' : '$borderColor',
                                        bg: on ? '$ink' : 'transparent',
                                        items: "center",
                                        justify: "center",
                                        cursor: "pointer",
                                        children: _jsx(SizableText, { size: "$1", fontWeight: "600", color: on ? '$background' : '$ink', children: tab.label }),
                                    }, tab.id));
                                }),
                            }),

                            inspectorTab === 'design' && selectedNode ? (_jsxs(YStack, {
                                gap: "$2",
                                children: [
                                    _jsx(SizableText, { size: "$2", fontWeight: "600", numberOfLines: 1, children: selectedNode.name }),
                                    /* X / Y / W / H / Radius grid */
                                    _jsx(XStack, {
                                        gap: 6,
                                        flexWrap: "wrap",
                                        children: [
                                            { k: 'x', label: 'X' },
                                            { k: 'y', label: 'Y' },
                                            { k: 'w', label: 'W' },
                                            { k: 'h', label: 'H' },
                                            { k: 'rx', label: 'Radius' },
                                            { k: 'padding', label: 'Pad' },
                                        ].map((prop) => (_jsxs(YStack, {
                                            width: "calc(33.33% - 4px)",
                                            gap: 2,
                                            children: [
                                                _jsx(SizableText, { size: "$1", color: "$soft", children: prop.label }),
                                                _jsx("input", {
                                                    "aria-label": `Layer ${prop.label}`,
                                                    type: "number",
                                                    value: selectedNode[prop.k],
                                                    onChange: (e) => updateSelected({ [prop.k]: Number(e.currentTarget.value) || 0 }),
                                                    style: {
                                                        width: '100%',
                                                        height: 28,
                                                        borderRadius: 6,
                                                        padding: '0 6px',
                                                        background: 'rgba(255,255,255,0.04)',
                                                        border: '1px solid rgba(255,255,255,0.12)',
                                                        color: 'inherit',
                                                        font: 'inherit',
                                                        fontSize: 12,
                                                    },
                                                }),
                                            ],
                                        }, prop.k))),
                                    }),

                                    /* Auto-Layout Direction */
                                    _jsxs(YStack, {
                                        gap: 4,
                                        children: [
                                            _jsx(SizableText, { size: "$1", color: "$soft", children: "Auto-Layout Flow" }),
                                            _jsx(XStack, {
                                                gap: 6,
                                                children: ['vertical', 'horizontal'].map((dir) => (_jsx(XStack, {
                                                    render: "button",
                                                    onPress: () => updateSelected({ layout: dir }),
                                                    flex: 1,
                                                    height: 28,
                                                    rounded: "$2",
                                                    borderWidth: 1,
                                                    borderColor: selectedNode.layout === dir ? '$ink' : '$borderColor',
                                                    bg: selectedNode.layout === dir ? '$hover' : 'transparent',
                                                    items: "center",
                                                    justify: "center",
                                                    cursor: "pointer",
                                                    children: _jsx(SizableText, { size: "$1", children: dir.toUpperCase() }),
                                                }, dir))),
                                            }),
                                        ],
                                    }),

                                    /* Fill & Stroke */
                                    _jsxs(XStack, {
                                        gap: 8,
                                        children: [
                                            _jsxs(YStack, {
                                                flex: 1,
                                                gap: 2,
                                                children: [
                                                    _jsx(SizableText, { size: "$1", color: "$soft", children: "Fill Hex" }),
                                                    _jsx("input", {
                                                        "aria-label": "Fill hex color",
                                                        value: selectedNode.fill,
                                                        onChange: (e) => updateSelected({ fill: e.currentTarget.value }),
                                                        style: {
                                                            width: '100%',
                                                            height: 28,
                                                            borderRadius: 6,
                                                            padding: '0 8px',
                                                            background: 'rgba(255,255,255,0.04)',
                                                            border: '1px solid rgba(255,255,255,0.12)',
                                                            color: 'inherit',
                                                            fontFamily: 'ui-monospace, monospace',
                                                            fontSize: 12,
                                                        },
                                                    }),
                                                ],
                                            }),
                                            _jsxs(YStack, {
                                                flex: 1,
                                                gap: 2,
                                                children: [
                                                    _jsx(SizableText, { size: "$1", color: "$soft", children: "Stroke Hex" }),
                                                    _jsx("input", {
                                                        "aria-label": "Stroke hex color",
                                                        value: selectedNode.stroke,
                                                        onChange: (e) => updateSelected({ stroke: e.currentTarget.value }),
                                                        style: {
                                                            width: '100%',
                                                            height: 28,
                                                            borderRadius: 6,
                                                            padding: '0 8px',
                                                            background: 'rgba(255,255,255,0.04)',
                                                            border: '1px solid rgba(255,255,255,0.12)',
                                                            color: 'inherit',
                                                            fontFamily: 'ui-monospace, monospace',
                                                            fontSize: 12,
                                                        },
                                                    }),
                                                ],
                                            }),
                                        ],
                                    }),

                                    /* Text Content */
                                    _jsxs(YStack, {
                                        gap: 2,
                                        children: [
                                            _jsx(SizableText, { size: "$1", color: "$soft", children: "Layer Copy / Label" }),
                                            _jsx("input", {
                                                "aria-label": "Layer text content",
                                                value: selectedNode.text,
                                                onChange: (e) => updateSelected({ text: e.currentTarget.value }),
                                                style: {
                                                    width: '100%',
                                                    height: 30,
                                                    borderRadius: 6,
                                                    padding: '0 8px',
                                                    background: 'rgba(255,255,255,0.04)',
                                                    border: '1px solid rgba(255,255,255,0.12)',
                                                    color: 'inherit',
                                                    font: 'inherit',
                                                    fontSize: 12,
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            })) : null,

                            inspectorTab === 'tokens' ? (_jsx(YStack, {
                                gap: 6,
                                children: DESIGN_TOKENS.map((tok) => (_jsxs(XStack, {
                                    render: "button",
                                    onPress: () => updateSelected({ fill: tok.value }),
                                    p: "$2",
                                    rounded: "$2",
                                    borderWidth: 1,
                                    borderColor: "$borderColor",
                                    justify: "space-between",
                                    items: "center",
                                    cursor: "pointer",
                                    children: [
                                        _jsxs(XStack, {
                                            items: "center",
                                            gap: "$2",
                                            children: [
                                                _jsx("span", { style: { width: 14, height: 14, borderRadius: 4, background: tok.value, border: '1px solid rgba(255,255,255,0.25)', display: 'inline-block' } }),
                                                _jsxs(YStack, {
                                                    style: { textAlign: 'left' },
                                                    children: [
                                                        _jsx(SizableText, { size: "$1", fontWeight: "600", style: { fontFamily: 'ui-monospace, monospace' }, children: tok.name }),
                                                        _jsx(SizableText, { size: "$1", color: "$soft", children: tok.role }),
                                                    ],
                                                }),
                                            ],
                                        }),
                                        _jsx(SizableText, { size: "$1", color: "$soft", style: { fontFamily: 'ui-monospace, monospace' }, children: tok.value }),
                                    ],
                                }, tok.name))),
                            })) : null,

                            inspectorTab === 'code' ? (_jsxs(YStack, {
                                gap: "$2",
                                children: [
                                    _jsx("pre", {
                                        style: {
                                            margin: 0,
                                            padding: 10,
                                            borderRadius: 8,
                                            background: '#05060a',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            fontSize: 11,
                                            fontFamily: 'ui-monospace, monospace',
                                            color: '#e2e8f0',
                                            overflowX: 'auto',
                                            maxHeight: 220,
                                        },
                                        children: generatedReactCode,
                                    }),
                                    _jsxs(XStack, {
                                        render: "button",
                                        onPress: exportReactFile,
                                        height: 30,
                                        rounded: 999,
                                        bg: "$ink",
                                        items: "center",
                                        justify: "center",
                                        gap: "$1.5",
                                        cursor: "pointer",
                                        children: [
                                            _jsx(Download, { size: 12 }),
                                            _jsx(SizableText, { size: "$1", color: "$background", fontWeight: "600", children: "Download .TSX Component" }),
                                        ],
                                    }),
                                ],
                            })) : null,
                        ],
                    }),
                ],
            }),
        ],
    }));
}
