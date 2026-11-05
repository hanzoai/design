// @generated
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Ads: one message at every size it runs at. The social set (1:1, 4:5, 9:16,
 * 1.91:1) and the display banners (300x250, 728x90, 160x600, 320x50), each
 * laid out for its shape by the poster composer, in the brand, from one
 * picture and one set of words. A version keeps one PNG per size; the set
 * downloads as a ZIP.
 */
import { SizableText, XStack, YStack } from '@hanzo/gui';
import { Megaphone } from '@hanzogui/lucide-icons-2';
import { current, filename } from '../made.js';
import { pixels } from '../raster.js';
import { useUrl } from '../use.js';
import { read } from '../wire.js';
import { zip } from '../zip.js';
import { picture } from './image.js';
import { num, str } from './kind.js';
import { svg } from './poster/index.js';
import { PRESETS, settle } from './type/system.js';
export const UNITS = [
    { id: 'feed', label: 'Feed 1:1', width: 1080, height: 1080, set: 'social' },
    { id: 'portrait', label: 'Feed 4:5', width: 1080, height: 1350, set: 'social' },
    { id: 'story', label: 'Story 9:16', width: 1080, height: 1920, set: 'social' },
    { id: 'link', label: 'Link 1.91:1', width: 1200, height: 628, set: 'social' },
    { id: 'rectangle', label: '300 × 250', width: 300, height: 250, set: 'banner' },
    { id: 'leaderboard', label: '728 × 90', width: 728, height: 90, set: 'banner' },
    { id: 'skyscraper', label: '160 × 600', width: 160, height: 600, set: 'banner' },
    { id: 'mobile', label: '320 × 50', width: 320, height: 50, set: 'banner' },
];
const spec = (v) => ({
    headline: str(v.headline, 'Untitled'),
    subhead: str(v.subhead),
    cta: str(v.cta, 'Learn more'),
    picture: str(v.picture),
    prompt: str(v.prompt),
    sets: Array.isArray(v.sets) && v.sets.length ? v.sets.filter((s) => s === 'social' || s === 'banner') : ['social', 'banner'],
    system: settle((v.system ?? {}), PRESETS[0]),
});
/** Every unit of the set, drawn and kept. */
async function draw(w, s) {
    const files = [];
    for (const u of UNITS.filter((x) => s.sets.includes(x.set))) {
        w.doing(`Laying out ${u.label}`);
        // Small units carry the headline alone: a subhead at 50px tall is noise.
        const small = u.width * u.height < 200_000;
        const text = await svg(w.wire, {
            format: 'square',
            layout: u.width / u.height > 1.5 ? 'split' : 'hero',
            headline: s.headline,
            subhead: small ? '' : s.subhead,
            details: '',
            cta: s.cta,
            picture: s.picture,
            prompt: s.prompt,
            system: s.system,
            size: { width: u.width, height: u.height },
        });
        files.push(await w.keep(`${u.id}-${u.width}x${u.height}.png`, await pixels(text, u.width, u.height), { width: u.width, height: u.height }));
    }
    return files;
}
export const ad = {
    id: 'ad',
    label: 'Ads',
    blurb: 'One ad at every size: the social set and the display banners.',
    icon: Megaphone,
    tool: {
        name: 'make_ad',
        description: 'Make an ad set: one picture and one message laid out at every size it runs at (feed, portrait, story, link, and the 300x250, 728x90, 160x600 and 320x50 banners).',
        parameters: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'A short name for the tab.' },
                headline: { type: 'string', description: 'Four to eight words.' },
                subhead: { type: 'string', description: 'One supporting line.' },
                cta: { type: 'string', description: 'One to three words: Shop now, Learn more, Book a table.' },
                image_prompt: { type: 'string', description: 'The picture, with no words in it.' },
                image_tab: { type: 'integer', description: 'A tab whose picture to use instead.' },
                sets: { type: 'array', items: { type: 'string', enum: ['social', 'banner'] }, description: 'Both unless asked.' },
            },
            required: ['title', 'headline'],
        },
    },
    needs: () => null,
    make: async (w, args) => {
        const s = spec({ ...args, prompt: str(args.image_prompt), system: w.brand ?? PRESETS[0] });
        let why = '';
        const tab = num(args.image_tab, 0) ? w.find(num(args.image_tab, 0)) : null;
        const f = tab ? current(tab).files.find((x) => x.mime.startsWith('image/')) : undefined;
        if (f)
            s.picture = f.key;
        else if (s.prompt) {
            try {
                s.picture = (await picture(w, { prompt: s.prompt, aspect: '4:5', model: '' })).files[0]?.key ?? '';
            }
            catch (e) {
                why = e instanceof Error ? e.message : String(e);
            }
        }
        const files = await draw(w, s);
        return { title: str(args.title, s.headline), draft: { spec: s, files, note: why ? `Set in type alone. ${why}` : s.headline, by: 'Studio layout' } };
    },
    revise: async (w, made, change) => {
        const s = spec({ ...current(made).spec, ...(change.patch ?? {}), system: w.brand ?? current(made).spec.system });
        if (change.instruction)
            s.headline = change.instruction.length < 60 ? change.instruction : s.headline;
        return { spec: s, files: await draw(w, s), note: change.instruction ?? 'Edited', by: 'Studio layout' };
    },
    View: Set,
    exports: [
        {
            label: 'All sizes (ZIP)',
            run: async (w, m, v) => ({ name: filename(m.title, 'zip'), blob: await zip(await Promise.all(v.files.map(async (f) => ({ name: f.name, blob: await read(w, f.key) })))) }),
        },
    ],
};
function Set({ version, wire, made }) {
    return (_jsx(YStack, { flex: 1, minH: 0, overflow: "scroll", p: "$3", children: _jsx(XStack, { flexWrap: "wrap", gap: "$3", items: "flex-start", children: version.files.map((f) => (_jsx(Unit, { wire: wire, file: f, alt: `${made.title}, ${f.name}` }, f.key))) }) }));
}
function Unit({ wire, file, alt }) {
    const { src } = useUrl(wire, file.key);
    const scale = Math.min(1, 260 / (file.width ?? 260), 320 / (file.height ?? 320));
    return (_jsxs(YStack, { gap: "$1", children: [src ? _jsx("img", { src: src, alt: alt, width: Math.round((file.width ?? 260) * scale), height: Math.round((file.height ?? 260) * scale), style: { borderRadius: 6, background: 'var(--hover)' } }) : null, _jsx(SizableText, { size: "$1", color: "$soft", children: file.name.replace(/\.png$/, '') })] }));
}
