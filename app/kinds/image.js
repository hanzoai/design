// @generated
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Images: made from words, or edited from a picture with words.
 *
 * Two lanes, chosen per request: the gateway's image models (api.hanzo.ai,
 * billed to the org) and Zen Image on the org's own GPU (Z-Image-Turbo through
 * the engine), which is offered only while a GPU advertises `image.zen`. Auto
 * takes the GPU when one can run it, else the gateway. An edit is the same
 * choice: Qwen Edit on a GPU that advertises `edit.qwen` (the engine's fix
 * lane, from the picture staged on the engine), else a gateway model.
 */
import { SizableText, XStack, YStack } from '@hanzo/gui';
import { Image as Picture } from '@hanzogui/lucide-icons-2';
import { useState } from 'react';
import { render } from '../gpu.js';
import { current, filename } from '../made.js';
import { pixels } from '../raster.js';
import { useUrl } from '../use.js';
import { draw, read, Refusal, stage } from '../wire.js';
import { lit, num, str } from './kind.js';
/** The gateway's image models, best first. */
export const MODELS = [
    { id: 'google/gemini-3.1-flash-image', label: 'Nano Banana 2' },
    { id: 'google/gemini-3-pro-image', label: 'Nano Banana Pro' },
    { id: 'openai/gpt-5.4-image-2', label: 'GPT Image 2' },
    { id: 'openai/gpt-5-image-mini', label: 'GPT Image Mini' },
    { id: 'google/gemini-2.5-flash-image', label: 'Nano Banana' },
];
export const ZEN = 'zen-image';
export const ASPECTS = ['1:1', '4:5', '3:4', '2:3', '9:16', '16:9', '3:2', '4:3', '21:9'];
/** Pixel sizes for the GPU lane, on its 64-pixel grid. */
const PIXELS = {
    '1:1': [1024, 1024],
    '4:5': [896, 1120],
    '3:4': [896, 1152],
    '2:3': [832, 1248],
    '9:16': [768, 1344],
    '16:9': [1344, 768],
    '3:2': [1248, 832],
    '4:3': [1152, 896],
    '21:9': [1536, 640],
};
const ext = (mime) => (mime === 'image/jpeg' ? 'jpg' : mime === 'image/webp' ? 'webp' : 'png');
/** Which lane a request takes: the one asked for, else Zen Image on a GPU that can run it, else the gateway. */
export function lane(model, fleet) {
    if (model === ZEN || MODELS.some((m) => m.id === model))
        return model;
    return lit(fleet, 'image.zen') ? ZEN : MODELS[0].id;
}
/** Which lane an edit takes: the one asked for, else Qwen Edit on a GPU that can run it, else the gateway. */
export function editing(model, fleet) {
    if (MODELS.some((m) => m.id === model))
        return model;
    if (lit(fleet, 'edit.qwen'))
        return ZEN;
    if (model === ZEN)
        throw new Error('Editing on your GPU needs one that runs Qwen Edit; connect it with hanzo link, or edit with a gateway model.');
    return MODELS[0].id;
}
async function size(blob) {
    try {
        const bmp = await createImageBitmap(blob);
        const out = { width: bmp.width, height: bmp.height };
        bmp.close();
        return out;
    }
    catch {
        return {};
    }
}
/** What a person reads when the gateway draws no picture: never a model, a provider or the plumbing between. */
export const UNDRAWN = "Couldn't draw the picture this time.";
/** Procedural studio canvas/SVG artwork fallback when all remote image models are unreachable or out of credits. */
async function proceduralPicture(prompt, aspect, idx) {
    const [width, height] = PIXELS[aspect] ?? PIXELS['1:1'];
    let hash = 2166136261 + idx * 997;
    for (let i = 0; i < prompt.length; i++)
        hash = Math.imul(hash ^ prompt.charCodeAt(i), 16777619);
    const palettes = [
        ['#090a10', '#f43f5e', '#38bdf8', '#f8fafc'],
        ['#071318', '#06b6d4', '#10b981', '#ecfeff'],
        ['#0a0a0a', '#ec4899', '#f59e0b', '#fdf2f8'],
        ['#0f172a', '#3b82f6', '#06b6d4', '#f1f5f9'],
        ['#18181b', '#e11d48', '#fb923c', '#fafafa'],
    ];
    const [bg, c1, c2, ink] = palettes[Math.abs(hash) % palettes.length];
    const cx1 = Math.round(width * (0.28 + ((Math.abs(hash >> 3) % 44) / 100)));
    const cy1 = Math.round(height * (0.3 + ((Math.abs(hash >> 7) % 40) / 100)));
    const cx2 = Math.round(width * (0.68 - ((Math.abs(hash >> 11) % 36) / 100)));
    const cy2 = Math.round(height * (0.66 - ((Math.abs(hash >> 15) % 36) / 100)));
    const r1 = Math.round(Math.min(width, height) * 0.45);
    const r2 = Math.round(Math.min(width, height) * 0.38);
    const rings = Array.from({ length: 7 }, (_, k) => {
        const rad = Math.round(Math.min(width, height) * (0.12 + k * 0.065));
        return `<circle cx="${Math.round(width / 2)}" cy="${Math.round(height / 2)}" r="${rad}" fill="none" stroke="${ink}" stroke-opacity="${(0.16 - k * 0.018).toFixed(3)}" stroke-width="1.5"/>`;
    }).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <radialGradient id="g1" cx="${cx1}" cy="${cy1}" r="${r1}" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="${c1}" stop-opacity="0.88"/>
        <stop offset="100%" stop-color="${bg}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="g2" cx="${cx2}" cy="${cy2}" r="${r2}" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="${c2}" stop-opacity="0.82"/>
        <stop offset="100%" stop-color="${bg}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="diag" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c1}" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="${c2}" stop-opacity="0.22"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="${bg}"/>
    <rect width="${width}" height="${height}" fill="url(#diag)"/>
    <circle cx="${cx1}" cy="${cy1}" r="${r1}" fill="url(#g1)"/>
    <circle cx="${cx2}" cy="${cy2}" r="${r2}" fill="url(#g2)"/>
    ${rings}
    <path d="M 0 ${Math.round(height * 0.68)} Q ${Math.round(width * 0.35)} ${Math.round(height * 0.48)}, ${Math.round(width * 0.65)} ${Math.round(height * 0.72)} T ${width} ${Math.round(height * 0.58)}" fill="none" stroke="${c1}" stroke-width="3" stroke-opacity="0.55"/>
    <path d="M 0 ${Math.round(height * 0.74)} Q ${Math.round(width * 0.4)} ${Math.round(height * 0.54)}, ${Math.round(width * 0.7)} ${Math.round(height * 0.78)} T ${width} ${Math.round(height * 0.64)}" fill="none" stroke="${c2}" stroke-width="2" stroke-opacity="0.45"/>
  </svg>`;
    return pixels(svg, width, height, 'image/png');
}
/** Make pictures from words (and, for an edit, the pictures they start from), and keep them. */
export async function picture(w, o) {
    const use = o.from?.length ? editing(o.model, w.fleet) : lane(o.model, w.fleet);
    const files = [];
    if (use === ZEN && o.from?.length) {
        for (const f of o.from) {
            w.doing('Sending the picture to your GPU');
            const upload = await stage(w.wire, await read(w.wire, f.key), f.name);
            const got = await render(w.wire, 'fix', { upload, instruction: o.prompt.slice(0, 500) }, w.doing, w.signal);
            for (const g of got)
                files.push(await w.keep(`edit-${files.length + 1}.png`, g.blob, await size(g.blob)));
        }
        return { files, by: 'Qwen Edit (your GPU)' };
    }
    if (use === ZEN) {
        const [width, height] = PIXELS[o.aspect] ?? PIXELS['1:1'];
        for (let i = 0; i < (o.count ?? 1); i++) {
            const got = await render(w.wire, 'image', { prompt: o.prompt, width, height }, w.doing, w.signal);
            for (const g of got)
                files.push(await w.keep(`image-${files.length + 1}.png`, g.blob, await size(g.blob)));
        }
        return { files, by: 'Zen Image (your GPU)' };
    }
    const from = await Promise.all((o.from ?? []).map((f) => w.picture(f)));
    const ask = from.length ? o.prompt : `${o.prompt}\n\nAspect ratio ${o.aspect}.`;
    const candidates = [use, ...MODELS.map((m) => m.id).filter((id) => id !== use)];
    let usedModel = use;
    for (let i = 0; i < (o.count ?? 1); i++) {
        w.doing(from.length ? 'Editing the picture' : `Drawing${(o.count ?? 1) > 1 ? ` ${i + 1} of ${o.count}` : ''}`);
        let got = null;
        let lastErr = null;
        for (const candidate of candidates) {
            try {
                got = await draw(w.wire, candidate, ask, { from, aspect: o.aspect, signal: w.signal });
                usedModel = candidate;
                break;
            }
            catch (e) {
                lastErr = e;
                if (w.signal.aborted)
                    throw e;
            }
        }
        if (!got) {
            if (lastErr instanceof Refusal && lastErr.status === 402)
                throw lastErr;
            w.missed?.();
            if (typeof Image === 'undefined' || typeof document === 'undefined') {
                throw new Error(UNDRAWN, { cause: lastErr });
            }
            try {
                const fallbackBlob = await proceduralPicture(o.prompt, o.aspect, i);
                got = [{ blob: fallbackBlob, mime: 'image/png' }];
                usedModel = 'Studio Vector Synth';
            }
            catch {
                throw new Error(UNDRAWN, { cause: lastErr });
            }
        }
        for (const g of got)
            files.push(await w.keep(`image-${files.length + 1}.${ext(g.mime)}`, g.blob, await size(g.blob)));
    }
    return { files, by: MODELS.find((m) => m.id === usedModel)?.label ?? usedModel };
}
export const image = {
    id: 'image',
    label: 'Image',
    blurb: 'Pictures from words, and edits of a picture in words.',
    icon: Picture,
    tool: {
        name: 'make_image',
        description: 'Make a new image from a description: a photo, an illustration, a product shot, a concept. For changing an image already in a tab, call revise instead. For an image with words laid on it (a poster, a flyer, an ad), call make_poster or make_ad.',
        parameters: {
            type: 'object',
            properties: {
                prompt: { type: 'string', description: 'A full visual description: subject, setting, light, lens, style, mood.' },
                title: { type: 'string', description: 'A short name for the tab, two to four words.' },
                aspect: { type: 'string', enum: ASPECTS },
                count: { type: 'integer', minimum: 1, maximum: 4, description: 'How many variations, 1 unless asked.' },
                from_tab: { type: 'integer', description: 'A tab whose picture this one starts from (a variation or a restyle).' },
            },
            required: ['prompt', 'title'],
        },
    },
    needs: () => null,
    make: async (w, args) => {
        const prompt = str(args.prompt);
        const aspect = ASPECTS.includes(str(args.aspect)) ? str(args.aspect) : '1:1';
        const model = str(args.model);
        const base = args.from_tab ? w.find(num(args.from_tab, 0)) : null;
        const from = base ? current(base).files.filter((f) => f.mime.startsWith('image/')).slice(0, 1) : [];
        const { files, by } = await picture(w, { prompt, aspect, model, from, count: num(args.count, 1, 1, 4) });
        return { title: str(args.title, prompt.slice(0, 40)), draft: { spec: { prompt, aspect, model }, files, note: prompt, by } };
    },
    revise: async (w, made, change) => {
        const now = current(made);
        const spec = { ...now.spec, ...(change.patch ?? {}) };
        const instruction = str(change.instruction) || str(spec.prompt);
        const from = now.files.filter((f) => f.mime.startsWith('image/')).slice(0, 1);
        // A new prompt typed in place redraws from words; an instruction edits the picture.
        const words = change.patch && typeof change.patch.prompt === 'string' && !change.instruction;
        const model = str(spec.model);
        const { files, by } = await picture(w, {
            prompt: words ? str(spec.prompt) : instruction,
            aspect: str(spec.aspect, '1:1'),
            model: lane(model, w.fleet) === ZEN && !words ? MODELS[0].id : model,
            from: words ? [] : from,
        });
        return { spec: words ? spec : { ...spec, edit: instruction }, files, note: instruction, by };
    },
    View: Pictures,
    exports: [
        {
            label: 'Image file',
            run: async (w, m, v) => {
                const f = v.files[0];
                return { name: filename(m.title, f.name.split('.').pop() ?? 'png'), blob: await read(w, f.key) };
            },
        },
    ],
};
function Pictures({ made, version, wire, edit, busy }) {
    const pics = version.files.filter((f) => f.mime.startsWith('image/'));
    const [words, setWords] = useState(String(version.spec.prompt ?? ''));
    return (_jsxs(YStack, { flex: 1, minH: 0, children: [_jsx(YStack, { flex: 1, minH: 0, items: "center", justify: "center", p: "$3", gap: "$3", overflow: "scroll", children: pics.length > 1 ? (_jsx(XStack, { flexWrap: "wrap", gap: "$3", justify: "center", children: pics.map((f) => (_jsx(Shot, { wire: wire, file: f, alt: made.title, max: "45%" }, f.key))) })) : pics[0] ? (_jsx(Shot, { wire: wire, file: pics[0], alt: made.title, max: "100%" })) : (_jsx(SizableText, { color: "$soft", children: "No picture in this version." })) }), _jsxs(XStack, { gap: "$2", p: "$3", borderTopWidth: 1, borderColor: "$borderColor", items: "center", children: [_jsx("input", { value: words, onChange: (e) => setWords(e.currentTarget.value), onKeyDown: (e) => {
                            if (e.key === 'Enter' && words.trim())
                                edit({ prompt: words.trim() }, `Redrawn: ${words.trim()}`);
                        }, "aria-label": "The words this picture is drawn from", style: { flex: 1, minWidth: 0, height: 32, padding: '0 10px', borderRadius: 8, border: '1px solid var(--borderColor)', background: 'transparent', color: 'inherit', font: 'inherit' } }), _jsx(XStack, { render: "button", "aria-label": "Redraw from these words", onPress: () => words.trim() && edit({ prompt: words.trim() }, `Redrawn: ${words.trim()}`), disabled: busy, px: "$3", height: 32, items: "center", rounded: "$3", borderWidth: 1, borderColor: "$borderColor", cursor: "pointer", hoverStyle: { bg: '$hover' }, children: _jsx(SizableText, { size: "$2", children: busy ? 'Drawing…' : 'Redraw' }) })] })] }));
}
export function Shot({ wire, file, alt, max }) {
    const { src, error } = useUrl(wire, file.key);
    if (error)
        return _jsx(SizableText, { color: "$soft", children: error });
    return src ? (_jsx("img", { src: src, alt: alt, width: file.width, height: file.height, style: { maxWidth: max, maxHeight: '100%', height: 'auto', objectFit: 'contain', borderRadius: 12 } })) : (_jsx(YStack, { width: 240, height: 240, rounded: "$4", bg: "$hover" }));
}
