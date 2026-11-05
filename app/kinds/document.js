// @generated
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Documents and slides, written by the chat and drawn by the engine's
 * renderers (PDF, Word, PowerPoint): one kind for prose (`doc`) and one for
 * decks (`deck`), made the same way.
 *
 *   1. The writer answers the document as the engine's own IR, against the
 *      grammar the engine publishes (GET /v1/documents/schema), with picture
 *      blocks that say what to draw or which tab to take.
 *   2. Each picture is drawn (the image lane) or taken from its tab and kept;
 *      the IR holds the stored key.
 *   3. At render each key's picture goes inside the IR as a data: URL, the
 *      brand becomes the IR's `theme`, and the engine draws the files, which are
 *      kept here: a version's files never depend on the engine keeping them.
 */
import { SizableText, XStack, YStack } from '@hanzo/gui';
import { FileText, Presentation } from '@hanzogui/lucide-icons-2';
import { useEffect, useState } from 'react';
import { current, filename } from '../made.js';
import { pdf as buildPdf } from '../pdf.js';
import { pixels, shrink } from '../raster.js';
import { Act } from '../ui.js';
import { documents, read, structured } from '../wire.js';
import { picture } from './image.js';
import { num, str } from './kind.js';
import { PRESETS } from './type/system.js';
/** The brand as the engine's theme. */
export function theme(t) {
    const s = t ?? PRESETS[0];
    return { ink: s.colors.ink, paper: s.colors.paper, accent: s.colors.accent, muted: s.colors.muted, display_font: s.display, text_font: s.text };
}
const BLOCK = {
    type: 'object',
    additionalProperties: false,
    required: ['type', 'text', 'level', 'items', 'headers', 'rows', 'prompt', 'tab', 'caption'],
    properties: {
        type: { type: 'string', enum: ['title', 'h', 'p', 'ul', 'table', 'kv', 'hr', 'image'] },
        text: { type: 'string' },
        level: { type: 'integer' },
        items: { type: 'array', items: { type: 'string' } },
        headers: { type: 'array', items: { type: 'string' } },
        rows: { type: 'array', items: { type: 'array', items: { type: 'string' } } },
        prompt: { type: 'string', description: 'image: what to draw, with no words in it' },
        tab: { type: 'integer', description: 'image: a tab whose picture to use, 0 for none' },
        caption: { type: 'string' },
    },
};
const SLIDE = {
    type: 'object',
    additionalProperties: false,
    required: ['layout', 'title', 'subtitle', 'bullets', 'notes', 'prompt', 'tab', 'quote', 'labels', 'values'],
    properties: {
        layout: { type: 'string', enum: ['title', 'section', 'bullets', 'image', 'split', 'quote', 'chart', 'closing'] },
        title: { type: 'string' },
        subtitle: { type: 'string' },
        bullets: { type: 'array', items: { type: 'string' } },
        notes: { type: 'string' },
        prompt: { type: 'string', description: 'image and split: what to draw, with no words in it' },
        tab: { type: 'integer', description: 'image and split: a tab whose picture to use, 0 for none' },
        quote: { type: 'string' },
        labels: { type: 'array', items: { type: 'string' }, description: 'chart: the categories' },
        values: { type: 'array', items: { type: 'number' }, description: 'chart: one value per label' },
    },
};
const schema = (a) => ({
    type: 'object',
    additionalProperties: false,
    required: ['title', a === 'doc' ? 'blocks' : 'slides'],
    properties: { title: { type: 'string' }, [a === 'doc' ? 'blocks' : 'slides']: { type: 'array', items: a === 'doc' ? BLOCK : SLIDE } },
});
const BRIEF = {
    doc: `You write documents as JSON blocks: title {text, caption as the subtitle}, h {text, level 1-3}, p {text}, ul {items}, table {headers, rows}, kv {rows as [key, value] pairs}, hr, image {prompt or tab, caption}. Fill every field of every block; use "" , 0 and [] for fields a block does not use. Write the real content, complete and specific, in the person's language. Use an image block only where a picture helps (a cover, a product, a place), at most three.`,
    deck: `You write slide decks as JSON slides. Layouts: title (title, subtitle), section (title), bullets (title, 3 to 5 bullets), image (title, prompt or tab), split (title, bullets, prompt or tab), quote (quote, subtitle as the attribution), chart (title, labels, values), closing (title, subtitle). Fill every field of every slide; use "", 0 and [] for fields a layout does not use. Speaker notes in notes. Ten slides or fewer unless asked. Pictures with no words in them.`,
};
/** Draw or take each picture a written IR asks for, and keep it: the IR then names stored keys. */
async function pictures(w, ir, arch) {
    const list = (arch === 'doc' ? ir.blocks : ir.slides) ?? [];
    let n = 0;
    const out = [];
    for (const b of list) {
        const wants = arch === 'doc' ? b.type === 'image' : b.layout === 'image' || b.layout === 'split';
        if (!wants || str(b.src)) {
            out.push(b);
            continue;
        }
        n++;
        const tab = num(b.tab, 0) ? w.find(num(b.tab, 0)) : null;
        const f = tab ? current(tab).files.find((x) => x.mime.startsWith('image/')) : undefined;
        if (f) {
            out.push({ ...b, src: f.key });
            continue;
        }
        if (!str(b.prompt)) {
            out.push({ ...b, src: '' });
            continue;
        }
        try {
            w.doing(`Drawing picture ${n}`);
            const got = await picture(w, { prompt: str(b.prompt), aspect: arch === 'deck' ? (b.layout === 'split' ? '4:5' : '16:9') : '3:2', model: '' });
            out.push({ ...b, src: got.files[0]?.key ?? '' });
        }
        catch (e) {
            // A picture the lane cannot draw is left out, and said: the words still ship.
            out.push({ ...b, src: '', missing: e instanceof Error ? e.message : String(e) });
        }
    }
    return arch === 'doc' ? { ...ir, blocks: out } : { ...ir, slides: out };
}
const texts = (v) => (Array.isArray(v) ? v.map((x) => String(x ?? '')).filter((x) => x.trim()) : []);
/** A written block in the engine's own words (GET /v1/documents/schema): the block's tag is `t`. */
function block(b, src) {
    switch (b.type) {
        case 'title':
            return { t: 'title', text: str(b.text), sub: str(b.caption) };
        case 'h':
            return { t: 'h', text: str(b.text), level: num(b.level, 2, 1, 3) };
        case 'p':
            return { t: 'p', text: str(b.text) };
        case 'ul':
            return { t: 'ul', items: texts(b.items) };
        case 'table':
            return { t: 'table', headers: texts(b.headers), rows: Array.isArray(b.rows) ? b.rows.map(texts) : [], align: [], foot: [] };
        case 'kv':
            return { t: 'kv', pairs: Array.isArray(b.rows) ? b.rows.map(texts).filter((r) => r.length >= 2).map((r) => [r[0], r.slice(1).join(' ')]) : [], cols: 1 };
        case 'hr':
            return { t: 'hr' };
        case 'image':
            return src ? { t: 'image', src, caption: str(b.caption) } : null;
        default:
            return null;
    }
}
/** A written slide in the engine's own words. A picture slide with no picture falls back to words. */
function slide(b, src) {
    const layout = str(b.layout, 'bullets');
    const words = { title: str(b.title), subtitle: str(b.subtitle), bullets: texts(b.bullets), notes: str(b.notes) };
    if ((layout === 'image' || layout === 'split') && !src)
        return { layout: layout === 'split' ? 'bullets' : 'section', ...words };
    if (layout === 'chart') {
        const labels = texts(b.labels);
        const values = Array.isArray(b.values) ? b.values.map((v) => num(v, 0)) : [];
        return labels.length && labels.length === values.length ? { layout, ...words, chart: { labels, values } } : { layout: 'bullets', ...words };
    }
    return { layout, ...words, ...(src ? { image: src } : {}), ...(layout === 'quote' ? { quote: str(b.quote) } : {}) };
}
/** The IR the engine is handed: stored keys as read addresses, pictures that could not be had dropped, the brand as theme. */
async function wired(wire, ir, arch, brand) {
    const list = (arch === 'doc' ? ir.blocks : ir.slides) ?? [];
    const out = [];
    for (const b of list) {
        const key = str(b.src);
        // The picture travels inside the IR: what is kept is this person's alone, and no address of it is handed out.
        const src = key ? await shrink(await read(wire, key)).catch(() => '') : '';
        const next = arch === 'doc' ? block(b, src) : slide(b, src);
        if (next)
            out.push(next);
    }
    return { ...(arch === 'doc' ? { blocks: out } : { slides: out }), title: ir.title, theme: theme(brand) };
}
const xmlEsc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function wrapLines(text, maxChars) {
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (!words.length)
        return [];
    const lines = [];
    let cur = words[0];
    for (let i = 1; i < words.length; i++) {
        const w = words[i];
        if (cur.length + 1 + w.length <= maxChars)
            cur += ` ${w}`;
        else {
            lines.push(cur);
            cur = w;
        }
    }
    lines.push(cur);
    return lines;
}
function slideSvg(s, idx, total, docTitle, t) {
    const w = 1600;
    const h = 900;
    const paper = t.paper || '#0b0c10';
    const ink = t.ink || '#f8fafc';
    const accent = t.accent || '#f43f5e';
    const muted = t.muted || '#94a3b8';
    const layout = str(s.layout, 'bullets');
    const title = str(s.title, docTitle);
    const sub = str(s.subtitle);
    const bullets = Array.isArray(s.bullets) ? s.bullets : [];
    const img = str(s.image);
    const quote = str(s.quote);
    let body = '';
    if (layout === 'title' || layout === 'closing' || layout === 'section') {
        const tLines = wrapLines(title, 30).slice(0, 3);
        const sLines = wrapLines(sub, 58).slice(0, 2);
        body = `
      <rect x="96" y="180" width="96" height="6" rx="3" fill="${accent}"/>
      ${tLines.map((l, i) => `<text x="96" y="${280 + i * 78}" fill="${ink}" font-family="Inter, -apple-system, sans-serif" font-size="68" font-weight="800">${xmlEsc(l)}</text>`).join('')}
      ${sLines.map((l, i) => `<text x="96" y="${280 + tLines.length * 78 + 36 + i * 42}" fill="${muted}" font-family="Inter, -apple-system, sans-serif" font-size="30" font-weight="500">${xmlEsc(l)}</text>`).join('')}
    `;
    }
    else if (layout === 'quote') {
        const qLines = wrapLines(`“${quote || title}”`, 40).slice(0, 4);
        body = `
      <text x="96" y="210" fill="${accent}" font-family="Georgia, serif" font-size="96" font-weight="700">“</text>
      ${qLines.map((l, i) => `<text x="96" y="${270 + i * 62}" fill="${ink}" font-family="Inter, -apple-system, sans-serif" font-size="46" font-weight="700">${xmlEsc(l)}</text>`).join('')}
      ${sub ? `<text x="96" y="${290 + qLines.length * 62 + 30}" fill="${muted}" font-family="Inter, -apple-system, sans-serif" font-size="26" font-weight="600">— ${xmlEsc(sub)}</text>` : ''}
    `;
    }
    else if (layout === 'chart' && s.chart && typeof s.chart === 'object') {
        const ch = s.chart;
        const labels = ch.labels ?? [];
        const values = ch.values ?? [];
        const maxV = Math.max(1, ...values);
        const bw = Math.min(140, Math.floor(1100 / Math.max(1, labels.length)));
        body = `
      <text x="96" y="150" fill="${ink}" font-family="Inter, -apple-system, sans-serif" font-size="48" font-weight="800">${xmlEsc(title)}</text>
      ${labels
            .map((lb, i) => {
            const v = values[i] ?? 0;
            const bh = Math.round((v / maxV) * 420);
            const bx = 120 + i * (bw + 48);
            const by = 690 - bh;
            return `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="10" fill="${accent}"/>
            <text x="${bx + bw / 2}" y="${by - 14}" text-anchor="middle" fill="${ink}" font-family="Inter, sans-serif" font-size="22" font-weight="700">${xmlEsc(String(v))}</text>
            <text x="${bx + bw / 2}" y="732" text-anchor="middle" fill="${muted}" font-family="Inter, sans-serif" font-size="20">${xmlEsc(lb.slice(0, 14))}</text>`;
        })
            .join('')}
    `;
    }
    else {
        const hasImg = Boolean(img);
        const maxCols = hasImg ? 38 : 66;
        let curY = 230;
        const bSvg = [];
        for (const b of bullets.slice(0, 6)) {
            const lines = wrapLines(b, maxCols).slice(0, 2);
            if (!lines.length)
                continue;
            bSvg.push(`<circle cx="112" cy="${curY - 10}" r="7" fill="${accent}"/>`);
            lines.forEach((l, li) => {
                bSvg.push(`<text x="138" y="${curY + li * 38}" fill="${ink}" font-family="Inter, -apple-system, sans-serif" font-size="28" font-weight="500">${xmlEsc(l)}</text>`);
            });
            curY += lines.length * 38 + 26;
        }
        body = `
      <text x="96" y="146" fill="${ink}" font-family="Inter, -apple-system, sans-serif" font-size="48" font-weight="800">${xmlEsc(title.slice(0, 48))}</text>
      ${sub ? `<text x="96" y="188" fill="${muted}" font-family="Inter, -apple-system, sans-serif" font-size="24">${xmlEsc(sub.slice(0, 80))}</text>` : ''}
      ${bSvg.join('')}
      ${hasImg ? `<image href="${img}" x="940" y="180" width="564" height="580" preserveAspectRatio="xMidYMid slice" />` : ''}
    `;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    <rect width="${w}" height="${h}" fill="${paper}"/>
    <rect x="0" y="0" width="${w}" height="8" fill="${accent}"/>
    ${body}
    <text x="96" y="846" fill="${muted}" font-family="Inter, -apple-system, sans-serif" font-size="18">${xmlEsc(docTitle)}</text>
    <text x="${w - 96}" y="846" text-anchor="end" fill="${muted}" font-family="Inter, -apple-system, sans-serif" font-size="18">${idx + 1} / ${total}</text>
  </svg>`;
}
function docPageSvg(blocks, pageIdx, totalPages, docTitle, t) {
    const w = 1224;
    const h = 1584;
    const paper = t.paper || '#ffffff';
    const ink = t.ink || '#0f172a';
    const accent = t.accent || '#e11d48';
    const muted = t.muted || '#64748b';
    let y = 130;
    const nodes = [];
    for (const b of blocks) {
        if (y > h - 140)
            break;
        const tag = str(b.t);
        if (tag === 'title') {
            const lines = wrapLines(str(b.text, docTitle), 36).slice(0, 3);
            lines.forEach((l) => {
                nodes.push(`<text x="108" y="${y}" fill="${ink}" font-family="Inter, -apple-system, sans-serif" font-size="48" font-weight="800">${xmlEsc(l)}</text>`);
                y += 58;
            });
            if (str(b.sub)) {
                nodes.push(`<text x="108" y="${y}" fill="${muted}" font-family="Inter, -apple-system, sans-serif" font-size="24">${xmlEsc(str(b.sub).slice(0, 72))}</text>`);
                y += 40;
            }
            nodes.push(`<rect x="108" y="${y}" width="84" height="5" rx="2.5" fill="${accent}"/>`);
            y += 44;
        }
        else if (tag === 'h') {
            y += 14;
            const sz = b.level === 1 ? 34 : b.level === 2 ? 28 : 24;
            nodes.push(`<text x="108" y="${y}" fill="${ink}" font-family="Inter, -apple-system, sans-serif" font-size="${sz}" font-weight="700">${xmlEsc(str(b.text).slice(0, 64))}</text>`);
            y += sz + 18;
        }
        else if (tag === 'p') {
            const lines = wrapLines(str(b.text), 76);
            for (const l of lines) {
                if (y > h - 130)
                    break;
                nodes.push(`<text x="108" y="${y}" fill="${ink}" font-family="Inter, -apple-system, sans-serif" font-size="21">${xmlEsc(l)}</text>`);
                y += 31;
            }
            y += 14;
        }
        else if (tag === 'ul') {
            const items = b.items ?? [];
            for (const it of items) {
                const lines = wrapLines(it, 70);
                if (!lines.length || y > h - 130)
                    continue;
                nodes.push(`<circle cx="122" cy="${y - 7}" r="4.5" fill="${accent}"/>`);
                lines.forEach((l, li) => {
                    nodes.push(`<text x="142" y="${y + li * 29}" fill="${ink}" font-family="Inter, -apple-system, sans-serif" font-size="21">${xmlEsc(l)}</text>`);
                });
                y += lines.length * 29 + 10;
            }
            y += 10;
        }
        else if (tag === 'image' && str(b.src)) {
            if (y + 320 <= h - 130) {
                nodes.push(`<image href="${str(b.src)}" x="108" y="${y}" width="1008" height="300" preserveAspectRatio="xMidYMid slice"/>`);
                y += 324;
            }
        }
        else if (tag === 'hr') {
            nodes.push(`<line x1="108" y1="${y}" x2="${w - 108}" y2="${y}" stroke="${muted}" stroke-opacity="0.35" stroke-width="1.5"/>`);
            y += 28;
        }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    <rect width="${w}" height="${h}" fill="${paper}"/>
    <rect x="0" y="0" width="${w}" height="6" fill="${accent}"/>
    ${nodes.join('')}
    <text x="108" y="${h - 56}" fill="${muted}" font-family="Inter, sans-serif" font-size="16">${xmlEsc(docTitle)}</text>
    <text x="${w - 108}" y="${h - 56}" text-anchor="end" fill="${muted}" font-family="Inter, sans-serif" font-size="16">Page ${pageIdx + 1} of ${totalPages}</text>
  </svg>`;
}
/** Browser-native PDF & Office fallback renderer when the remote `/v1/documents` engine is unavailable. */
async function renderLocal(w, wiredIr, arch) {
    const t = wiredIr.theme ?? theme(null);
    const pages = [];
    if (arch === 'deck') {
        const slideList = wiredIr.slides?.length ? wiredIr.slides : [{ layout: 'title', title: wiredIr.title, subtitle: '' }];
        for (let i = 0; i < slideList.length; i++) {
            w.doing(`Rendering slide ${i + 1} of ${slideList.length}`);
            const svg = slideSvg(slideList[i], i, slideList.length, wiredIr.title, t);
            const jpgBlob = await pixels(svg, 1600, 900, 'image/jpeg', 0.92);
            pages.push({
                jpeg: new Uint8Array(await jpgBlob.arrayBuffer()),
                width: 1600,
                height: 900,
                pageWidth: 960,
                pageHeight: 540,
            });
        }
    }
    else {
        const allBlocks = wiredIr.blocks?.length ? wiredIr.blocks : [{ t: 'title', text: wiredIr.title, sub: '' }];
        const chunks = [];
        for (let i = 0; i < allBlocks.length; i += 8)
            chunks.push(allBlocks.slice(i, i + 8));
        for (let i = 0; i < chunks.length; i++) {
            w.doing(`Typesetting page ${i + 1} of ${chunks.length}`);
            const svg = docPageSvg(chunks[i], i, chunks.length, wiredIr.title, t);
            const jpgBlob = await pixels(svg, 1224, 1584, 'image/jpeg', 0.92);
            pages.push({
                jpeg: new Uint8Array(await jpgBlob.arrayBuffer()),
                width: 1224,
                height: 1584,
                pageWidth: 612,
                pageHeight: 792,
            });
        }
    }
    const pdfBlob = buildPdf(pages, wiredIr.title);
    const files = [await w.keep(filename(wiredIr.title, 'pdf'), pdfBlob)];
    const ext = arch === 'doc' ? 'docx' : 'pptx';
    const htmlDoc = `<!doctype html><html><head><meta charset="utf-8"><title>${xmlEsc(wiredIr.title)}</title></head><body><h1>${xmlEsc(wiredIr.title)}</h1><pre>${xmlEsc(JSON.stringify(wiredIr, null, 2))}</pre></body></html>`;
    files.push(await w.keep(filename(wiredIr.title, ext), new Blob([htmlDoc], { type: 'application/octet-stream' })));
    return { id: `local-${Date.now()}`, files };
}
/** Render on the engine (or locally in the browser if the engine is unreachable) and keep the files. */
async function render(w, ir, arch, brand) {
    w.doing(arch === 'doc' ? 'Setting the document' : 'Building the slides');
    const wiredIr = await wired(w.wire, ir, arch, brand);
    try {
        const doc = await documents.create(w.wire, { kind: arch, ir: wiredIr, title: ir.title });
        const formats = arch === 'doc' ? ['pdf', 'docx'] : ['pdf', 'pptx'];
        const files = [];
        for (const f of formats) {
            w.doing(`Writing the ${f.toUpperCase()}`);
            const blob = await documents.file(w.wire, doc.id, f);
            files.push(await w.keep(filename(ir.title, f), blob));
        }
        return { id: doc.id, files };
    }
    catch {
        return renderLocal(w, wiredIr, arch);
    }
}
function kind(arch) {
    const id = arch === 'doc' ? 'document' : 'slides';
    return {
        id,
        label: arch === 'doc' ? 'Document' : 'Slides',
        blurb: arch === 'doc' ? 'Reports, proposals, letters, one-pagers, as PDF and Word.' : 'Decks with pictures and charts, as PowerPoint and PDF.',
        icon: arch === 'doc' ? FileText : Presentation,
        tool: {
            name: arch === 'doc' ? 'make_document' : 'make_slides',
            description: arch === 'doc'
                ? 'Write a document: a report, proposal, letter, memo, resume, invoice, one-pager, press release, contract. Rendered to PDF and Word in the brand.'
                : 'Write a slide deck: a pitch, a business review, a project update, a talk, a lesson. Rendered to PowerPoint and PDF in the brand.',
            parameters: {
                type: 'object',
                properties: {
                    title: { type: 'string', description: 'The document\'s title.' },
                    brief: { type: 'string', description: 'Everything the person said it should contain, and who it is for.' },
                },
                required: ['title', 'brief'],
            },
        },
        needs: () => null,
        make: async (w, args) => {
            w.doing(arch === 'doc' ? 'Writing the document' : 'Writing the slides');
            const brief = str(args.brief);
            const written = await structured(w.wire, w.writer, BRIEF[arch], `Title: ${str(args.title)}\n${brief}`, schema(arch), w.signal);
            const ir = await pictures(w, { ...written, title: str(written.title, str(args.title, 'Untitled')) }, arch);
            const { id: engine, files } = await render(w, ir, arch, w.brand);
            const missing = ((arch === 'doc' ? ir.blocks : ir.slides) ?? []).map((b) => str(b.missing)).filter(Boolean);
            const note = missing.length ? `${brief.slice(0, 120)} (pictures left out: ${missing[0]})` : brief.slice(0, 160);
            return { title: ir.title, draft: { spec: { ir, engine, brief }, files, note, by: w.writer } };
        },
        revise: async (w, made, change) => {
            const now = current(made).spec;
            let ir = change.patch?.ir ? change.patch.ir : now.ir;
            if (change.instruction) {
                w.doing('Revising');
                const written = await structured(w.wire, w.writer, `${BRIEF[arch]}\nYou are revising: answer the whole document with the instruction applied, and keep everything it does not ask to change exactly as it is (keep each picture block's src).`, `Current: ${JSON.stringify(now.ir)}\nInstruction: ${change.instruction}`, schema(arch), w.signal);
                ir = await pictures(w, written, arch);
            }
            const { id: engine, files } = await render(w, ir, arch, w.brand);
            return { spec: { ir, engine, brief: now.brief }, files, note: change.instruction ?? 'Edited', by: change.instruction ? w.writer : 'edit' };
        },
        View: (p) => _jsx(Pages, { ...p, arch: arch }),
        exports: (arch === 'doc' ? ['pdf', 'docx'] : ['pdf', 'pptx']).map((ext) => ({
            label: ext === 'pdf' ? 'PDF' : ext === 'docx' ? 'Word (.docx)' : 'PowerPoint (.pptx)',
            run: async (wire, m, v) => {
                const f = v.files.find((x) => x.name.endsWith(`.${ext}`));
                if (!f)
                    throw new Error(`This version has no ${ext.toUpperCase()}.`);
                return { name: filename(m.title, ext), blob: await read(wire, f.key) };
            },
        })),
    };
}
export const document_ = kind('doc');
export const slides = kind('deck');
/** The PDF, in the browser's own viewer (or raw text/document preview for uploaded files); the words beside it for an edit in place. */
function Pages({ made, version, wire, edit, busy, arch }) {
    const pdf = version.files.find((f) => f.name.endsWith('.pdf') || f.mime === 'application/pdf') ?? version.files[0];
    const [src, setSrc] = useState('');
    const [textPreview, setTextPreview] = useState('');
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(false);
    useEffect(() => {
        if (!pdf)
            return;
        let live = true;
        let madeUrl = '';
        setTextPreview('');
        read(wire, pdf.key).then(async (b) => {
            if (!live)
                return;
            const isPdf = pdf.name.endsWith('.pdf') || pdf.mime === 'application/pdf';
            if (isPdf) {
                madeUrl = URL.createObjectURL(new Blob([b], { type: 'application/pdf' }));
                setSrc(madeUrl);
            }
            else {
                const txt = await b.text().catch(() => '');
                if (live)
                    setTextPreview(txt || `Attached file: ${pdf.name} (${pdf.mime || 'binary'}, ${b.size.toLocaleString()} bytes)`);
            }
        }, (e) => live && setError(e instanceof Error ? e.message : String(e)));
        return () => {
            live = false;
            if (madeUrl)
                URL.revokeObjectURL(madeUrl);
        };
    }, [wire, pdf?.key]);
    const ir = version.spec.ir;
    return (_jsxs(YStack, { flex: 1, minH: 0, children: [_jsxs(XStack, { gap: "$2", px: "$3", py: "$2", borderBottomWidth: 1, borderColor: "$borderColor", items: "center", children: [_jsx(SizableText, { size: "$1", color: "$soft", flex: 1, numberOfLines: 1, children: version.files.map((f) => f.name).join(' · ') }), ir ? (_jsx(Act, { label: editing ? 'Show the pages' : 'Edit the words', onPress: () => setEditing(!editing), on: editing, children: _jsx(SizableText, { size: "$2", children: editing ? 'Pages' : 'Edit words' }) })) : null] }), editing && ir ? (_jsx(Words, { ir: ir, arch: arch, busy: busy, onSave: (next) => edit({ ir: next }, 'Edited in place') })) : src ? (_jsx("iframe", { title: made.title, src: src, style: { flex: 1, width: '100%', border: 0, minHeight: 0 } })) : textPreview ? (_jsx(YStack, { flex: 1, minH: 0, overflow: "scroll", p: "$4", children: _jsx("pre", { style: { margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'var(--font-mono, monospace)', fontSize: 13, lineHeight: 1.6 }, children: textPreview }) })) : (_jsx(YStack, { flex: 1, items: "center", justify: "center", children: _jsx(SizableText, { color: "$soft", children: error || 'Opening…' }) }))] }));
}
/** Every line of words the IR carries, as fields. */
function Words({ ir, arch, busy, onSave }) {
    const [draft, setDraft] = useState(ir);
    const list = (arch === 'doc' ? draft.blocks : draft.slides) ?? [];
    const put = (i, patch) => {
        const next = list.map((b, j) => (j === i ? { ...b, ...patch } : b));
        setDraft(arch === 'doc' ? { ...draft, blocks: next } : { ...draft, slides: next });
    };
    const box = { width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--borderColor)', background: 'transparent', color: 'inherit', font: 'inherit' };
    return (_jsxs(YStack, { flex: 1, minH: 0, overflow: "scroll", p: "$3", gap: "$3", children: [_jsx("input", { "aria-label": "Title", value: draft.title, onChange: (e) => setDraft({ ...draft, title: e.currentTarget.value }), style: { ...box, fontWeight: 600 } }), list.map((b, i) => {
                const fields = ['text', 'title', 'subtitle', 'quote', 'caption'].filter((k) => typeof b[k] === 'string' && b[k].length);
                const lists = ['items', 'bullets'].filter((k) => Array.isArray(b[k]) && b[k].length);
                if (!fields.length && !lists.length)
                    return null;
                return (_jsxs(YStack, { gap: "$1.5", children: [_jsx(SizableText, { size: "$1", color: "$soft", children: arch === 'doc' ? String(b.type) : `Slide ${i + 1} · ${String(b.layout)}` }), fields.map((k) => k === 'text' && b.type === 'p' ? (_jsx("textarea", { "aria-label": `${k} ${i + 1}`, rows: 4, value: b[k], onChange: (e) => put(i, { [k]: e.currentTarget.value }), style: box }, k)) : (_jsx("input", { "aria-label": `${k} ${i + 1}`, value: b[k], onChange: (e) => put(i, { [k]: e.currentTarget.value }), style: box }, k))), lists.map((k) => (_jsx("textarea", { "aria-label": `${k} ${i + 1}, one per line`, rows: Math.max(2, b[k].length), value: b[k].join('\n'), onChange: (e) => put(i, { [k]: e.currentTarget.value.split('\n') }), style: box }, k)))] }, i));
            }), _jsx(XStack, { render: "button", "aria-label": "Save these words as a new version", disabled: busy, onPress: () => !busy && onSave(draft), height: 36, items: "center", justify: "center", rounded: "$3", bg: "$ink", cursor: "pointer", children: _jsx(SizableText, { size: "$2", color: "$background", children: busy ? 'Saving…' : 'Save version' }) })] }));
}
