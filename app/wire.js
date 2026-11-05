// @generated
/**
 * THE ONE CLIENT MODULE. Everything Studio asks of the network goes through
 * here, so the transport is one change when the native workflow plane
 * (`api.hanzo.ai/v1/studio/*`) answers.
 *
 * Three places are reached today:
 *
 *   gateway   api.hanzo.ai/v1: the models — the chat that decides what to make,
 *             image generation and edit, speech, music. Billed to `org`.
 *   store     this browser's IndexedDB, per person and org, and the person's
 *             private Library (api.hanzo.ai/v1/library) once it answers.
 *   engine    the studio engine: documents and decks, and the GPU lanes
 *             (Zen Image, Wan video, ACE music, mesh) dispatched to the org's
 *             GPUs. Same origin on studio.hanzo.ai; https://studio.hanzo.ai
 *             from anywhere else, with the bearer, never a cookie.
 *
 * A refusal is a `Refusal` carrying the status and the server's own sentence,
 * whichever envelope it came in (problem details, `{error}`, `{status:'error',
 * msg}`), and a 200 that says `status: "error"` is a refusal too.
 */
/** Where the engine is from a page that is not studio.hanzo.ai. */
export const ENGINE = 'https://studio.hanzo.ai';
export class Refusal extends Error {
    status;
    code;
    constructor(status, message, code = '') {
        super(message);
        this.status = status;
        this.code = code;
        this.name = 'Refusal';
    }
}
const origin = (w, base) => (base === 'api' ? w.api : w.engine);
function headers(w, extra) {
    const h = new Headers(extra);
    const t = w.token();
    if (t)
        h.set('Authorization', `Bearer ${t}`);
    if (w.org)
        h.set('X-Org-Id', w.org);
    return h;
}
/** The sentence a refusal carries, and its code. */
async function reason(res) {
    try {
        const b = (await res.json());
        const err = b.error;
        const said = typeof err === 'string' ? err : err?.message;
        const msg = [b.detail, said, b.msg, b.message, b.title].find((v) => typeof v === 'string' && v);
        return [msg ?? '', String(b.code ?? (typeof err === 'object' ? err?.code : '') ?? '')];
    }
    catch {
        return ['', ''];
    }
}
/** A 200 in the `{status:'error', msg}` envelope is a refusal. */
function envelope(v) {
    const r = v;
    if (r && typeof r === 'object' && r.status === 'error') {
        throw new Refusal(400, typeof r.msg === 'string' && r.msg ? r.msg : 'The platform refused that.', String(r.code ?? ''));
    }
    return v;
}
/** One request. JSON in, JSON out, unless the answer is not JSON. */
export async function ask(w, base, path, o = {}) {
    const h = headers(w, o.head);
    let body = o.raw;
    if (o.body !== undefined) {
        h.set('Content-Type', 'application/json');
        body = JSON.stringify(o.body);
    }
    else if (o.type)
        h.set('Content-Type', o.type);
    const res = await fetch(`${origin(w, base)}${path}`, {
        method: o.method ?? (body === undefined ? 'GET' : 'POST'),
        headers: h,
        body,
        cache: 'no-store',
        credentials: base === 'engine' && !w.engine ? 'same-origin' : 'omit',
        signal: o.signal,
    });
    if (!res.ok) {
        const [msg, code] = await reason(res);
        throw new Refusal(res.status, msg || `${path.split('?')[0]} answered ${res.status}`, code);
    }
    o.heard?.(res.headers);
    if (res.status === 204)
        return undefined;
    const type = res.headers.get('content-type') ?? '';
    if (type.includes('json'))
        return envelope(await res.json());
    if (type.startsWith('text/'))
        return (await res.text());
    return (await res.blob());
}
/** `?a=1&b=2` from the defined, non-empty values. */
export function query(q) {
    const s = new URLSearchParams();
    for (const [k, v] of Object.entries(q))
        if (v !== undefined && v !== null && v !== '')
            s.set(k, String(v));
    const out = s.toString();
    return out ? `?${out}` : '';
}
const enc = encodeURIComponent;
/**
 * One turn of the chat that decides what to make, streamed: `heard` gets the
 * words so far as they arrive. Answers the words and the tool calls in full.
 */
export async function complete(w, body, heard, signal) {
    const res = await fetch(`${w.api}/v1/chat/completions`, {
        method: 'POST',
        headers: headers(w, { 'Content-Type': 'application/json', Accept: 'text/event-stream' }),
        body: JSON.stringify({ ...body, stream: true }),
        cache: 'no-store',
        credentials: 'omit',
        signal,
    });
    if (!res.ok || !res.body) {
        const [msg, code] = await reason(res);
        throw new Refusal(res.status, msg || `The model answered ${res.status}`, code);
    }
    const type = res.headers.get('content-type') ?? '';
    // A gateway that answers whole (an error envelope, or no stream) is read whole.
    if (!type.includes('event-stream')) {
        const whole = envelope(await res.json());
        const m = whole.choices?.[0]?.message;
        const text = m?.content ?? '';
        heard(text);
        return { text, model: whole.model ?? body.model, calls: (m?.tool_calls ?? []).map((c) => ({ id: c.id, name: c.function.name, args: c.function.arguments })) };
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let text = '';
    let model = body.model;
    const calls = new Map();
    for (;;) {
        const { value, done } = await reader.read();
        if (done)
            break;
        buffer += decoder.decode(value, { stream: true });
        let cut;
        while ((cut = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, cut).trim();
            buffer = buffer.slice(cut + 1);
            if (!line.startsWith('data:'))
                continue;
            const data = line.slice(5).trim();
            if (data === '[DONE]')
                continue;
            let chunk;
            try {
                chunk = JSON.parse(data);
            }
            catch {
                continue;
            }
            if (chunk.error)
                throw new Refusal(502, chunk.error.message ?? 'The model stopped with an error.', chunk.error.code ?? '');
            if (chunk.model)
                model = chunk.model;
            const delta = chunk.choices?.[0]?.delta;
            if (delta?.content) {
                text += delta.content;
                heard(text);
            }
            for (const t of delta?.tool_calls ?? []) {
                const had = calls.get(t.index) ?? { id: '', name: '', args: '' };
                calls.set(t.index, {
                    id: t.id || had.id,
                    name: had.name + (t.function?.name ?? ''),
                    args: had.args + (t.function?.arguments ?? ''),
                });
            }
        }
    }
    return { text, model, calls: [...calls.values()].filter((c) => c.name).map((c, i) => ({ ...c, id: c.id || `call_${i}` })) };
}
/** A JSON answer from a model, asked for by schema: what a generator (a type system, a deck's words) is made of. */
export async function structured(w, model, system, user, schema, signal) {
    const out = await ask(w, 'api', '/v1/chat/completions', {
        body: {
            model,
            messages: [
                { role: 'system', content: system },
                { role: 'user', content: user },
            ],
            response_format: { type: 'json_schema', json_schema: { name: 'answer', strict: true, schema } },
        },
        signal,
    });
    const text = out.choices?.[0]?.message?.content ?? '';
    const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
    try {
        return JSON.parse(json);
    }
    catch {
        throw new Refusal(502, 'The model answered with no JSON.');
    }
}
/** A data: URL's bytes. */
export function bytes(url) {
    const comma = url.indexOf(',');
    const head = url.slice(5, comma);
    const mime = head.split(';')[0] || 'image/png';
    const bin = atob(url.slice(comma + 1));
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++)
        out[i] = bin.charCodeAt(i);
    return { blob: new Blob([out], { type: mime }), mime };
}
/**
 * An image from a gateway image model: words, and the pictures it starts from
 * (an edit). The image models are chat models with an image output, so this is
 * a chat completion asking for both modalities; the pictures come back on the
 * message (`images`) or among its content parts.
 */
export async function draw(w, model, prompt, o = {}) {
    let held;
    const content = [{ type: 'text', text: prompt }, ...(o.from ?? []).map((url) => ({ type: 'image_url', image_url: { url } }))];
    const out = await ask(w, 'api', '/v1/chat/completions', {
        body: {
            model,
            modalities: ['image', 'text'],
            messages: [{ role: 'user', content }],
            ...(o.aspect ? { image_config: { aspect_ratio: o.aspect } } : {}),
        },
        signal: o.signal,
        heard: (h) => (held = h),
    });
    const m = out.choices?.[0]?.message;
    const urls = [
        ...(m?.images ?? []).map((i) => i.image_url?.url ?? ''),
        ...(Array.isArray(m?.content) ? m.content.map((p) => (p.type === 'image_url' ? (p.image_url?.url ?? '') : '')) : []),
    ].filter((u) => u.startsWith('data:image/'));
    if (!urls.length)
        throw withheld(model, held);
    return urls.map(bytes);
}
/*
 * The gateway answers a request it will not serve with a model it will, in
 * words: X-Hanzo-Usage-Reason says why and X-Hanzo-Upgrade-Url or
 * X-Hanzo-Topup-Url what lifts it. A picture request answered that way is a
 * refusal of the lane, said in the gateway's own reason.
 */
const WITHHELD = {
    paid_plan_required: 'Pictures from this model need a paid plan',
    plan_allowance_used: "This plan's pictures are used for now",
    usage_cap_exceeded: "This org's usage cap is reached",
    free_plan_cap: 'The free plan has no more pictures today',
    model_cap: "This model's share is used for now",
};
function withheld(model, h) {
    const why = h?.get('X-Hanzo-Usage-Reason') ?? '';
    if (!why)
        return new Refusal(502, `${model} answered with no picture.`);
    const fix = h?.get('X-Hanzo-Upgrade-Url') || h?.get('X-Hanzo-Topup-Url') || '';
    return new Refusal(402, `${WITHHELD[why] ?? 'Pictures are not available on this plan'}${fix ? `: ${fix}` : '.'}`, why);
}
/** Speech from words: the platform's voice. */
export async function speak(w, input, voice, model, signal) {
    return ask(w, 'api', '/v1/audio/speech', { body: { model, input, voice, response_format: 'mp3' }, signal });
}
/** The person the bearer names: whose database this is. */
function subject(w) {
    const t = w.token();
    if (!t)
        return '';
    try {
        const part = t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const c = JSON.parse(atob(part + '='.repeat((4 - (part.length % 4)) % 4)));
        return typeof c.sub === 'string' ? c.sub : '';
    }
    catch {
        return '';
    }
}
const dbs = new Map();
/** This person's database in this org, opened once. */
function db(w) {
    const who = subject(w);
    if (!who || !w.org)
        return Promise.reject(new Refusal(401, 'Sign in to keep what you make.'));
    const name = `hanzo-studio:${w.org}:${who}`;
    let open = dbs.get(name);
    if (!open) {
        open = new Promise((resolve, reject) => {
            const req = indexedDB.open(name, 1);
            req.onupgradeneeded = () => req.result.createObjectStore('files', { keyPath: 'key' });
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(new Refusal(507, 'This browser would not keep the file.'));
        });
        dbs.set(name, open);
        open.catch(() => dbs.delete(name));
    }
    return open;
}
function tx(d, mode, run) {
    return new Promise((resolve, reject) => {
        const req = run(d.transaction('files', mode).objectStore('files'));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(new Refusal(507, 'This browser would not keep the file.'));
    });
}
const get = async (w, key) => (await tx(await db(w), 'readonly', (s) => s.get(key))) ?? null;
const keep = async (w, r) => void (await tx(await db(w), 'readwrite', (s) => s.put(r)));
const all = async (w) => tx(await db(w), 'readonly', (s) => s.getAll());
/* The Library: answered or not, asked once per page. */
let library = null;
/** Whether api.hanzo.ai/v1/library answers for this person. */
export function libraryLive(w) {
    library ??= ask(w, 'api', '/v1/library?limit=1&source=studio').then(() => true, (e) => {
        library = null;
        return e instanceof Refusal && e.status !== 404 && e.status !== 405 ? Promise.reject(e) : false;
    });
    return library.catch(() => false);
}
/** The most a browser may send the Library in one save (its inline limit). */
const INLINE = 10 * 1024 * 1024;
const KINDS_LIB = { image: 'image', poster: 'image', ad: 'image', video: 'video', voice: 'audio', music: 'audio', document: 'document', slides: 'slides', type: 'type', mesh: 'model', app: 'app' };
/** Whether a key and its bytes belong in the Library: a made file the Library can take from a browser. */
const shelvable = (key, blob) => key.startsWith('files/') && key.split('/').length > 3 && blob.size <= INLINE;
const base64 = async (b) => {
    const buf = new Uint8Array(await b.arrayBuffer());
    let bin = '';
    for (let i = 0; i < buf.length; i += 0x8000)
        bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    return btoa(bin);
};
/** Save one made file to the Library. Answers its item; the key makes a repeat the same item. */
async function shelve(w, key, blob) {
    const [, kind, chat] = key.split('/');
    const item = await ask(w, 'api', '/v1/library', {
        body: {
            name: key.split('/').pop(),
            mime: blob.type || 'application/octet-stream',
            data: await base64(blob),
            source: 'studio',
            kind: KINDS_LIB[kind] ?? 'file',
            ref: chat,
            origin: `/design/c/${chat}`,
            key,
        },
    });
    if (!item.id)
        throw new Refusal(502, 'The Library took the file and named no item.');
    return item.id;
}
/** What this page made or read, held for its life: a file is never fetched twice. */
const held = new Map();
/** Keep bytes at a key: a made file in the Library, anything else in this browser. Answers the key. */
export async function put(w, key, blob) {
    const r = { key, mime: blob.type || 'application/octet-stream', size: blob.size, modified: Date.now() };
    const lib = shelvable(key, blob) && (await libraryLive(w)) ? await shelve(w, key, blob).catch(() => undefined) : undefined;
    await keep(w, lib ? { ...r, lib } : { ...r, blob });
    held.set(key, blob);
    forget(key);
    return key;
}
/**
 * Carry up to the Library every made file this browser still holds the bytes
 * of, and drop them here once the Library has them. Answers how many went.
 */
export async function sync(w) {
    if (!(await libraryLive(w)))
        return 0;
    let n = 0;
    for (const r of await all(w)) {
        if (!r.blob || !shelvable(r.key, r.blob))
            continue;
        const lib = r.lib ?? (await shelve(w, r.key, r.blob).catch(() => undefined));
        if (!lib)
            continue;
        const { blob, ...rest } = r;
        await keep(w, { ...rest, size: blob.size, lib });
        n++;
    }
    return n;
}
/** Addresses handed out, kept while they work: an object URL for the page's life, a Library URL until it expires. */
const shown = new Map();
function forget(key) {
    const hit = shown.get(key);
    if (hit?.url.startsWith('blob:'))
        URL.revokeObjectURL(hit.url);
    shown.delete(key);
}
/** An address a page can draw a kept file at. */
export async function url(w, key) {
    const hit = shown.get(key);
    if (hit && hit.until > Date.now())
        return hit.url;
    const local = held.get(key) ?? (await get(w, key))?.blob;
    if (local) {
        const made = URL.createObjectURL(local);
        shown.set(key, { url: made, until: Number.POSITIVE_INFINITY });
        return made;
    }
    const r = await get(w, key);
    if (!r?.lib)
        throw new Refusal(404, 'This file is not in your Library.');
    const item = await ask(w, 'api', `/v1/library/${enc(r.lib)}`);
    if (!item.url)
        throw new Refusal(502, 'The Library named no address for the file.');
    shown.set(key, { url: item.url, until: item.expires ? Date.parse(item.expires) - 60_000 : Date.now() + 240_000 });
    return item.url;
}
/** A kept file's bytes: from this page, this browser, or the Library. */
export async function read(w, key) {
    const hit = held.get(key);
    if (hit)
        return hit;
    const r = await get(w, key);
    if (!r)
        throw new Refusal(404, 'This file is not in your Library.');
    if (r.blob)
        return r.blob;
    const res = await fetch(await url(w, key), { cache: 'no-store', credentials: 'omit' });
    if (!res.ok)
        throw new Refusal(res.status, 'The Library would not hand the file back.');
    const b = await res.blob();
    held.set(key, b);
    return b;
}
/** What is kept under a prefix (one that ends in '/'), keys relative to it. */
export async function list(w, prefix) {
    const range = IDBKeyRange.bound(prefix, `${prefix}￿`);
    const rows = await tx(await db(w), 'readonly', (s) => s.getAll(range));
    return rows.map((r) => ({ key: r.key.slice(prefix.length), size: r.size ?? r.blob?.size ?? 0, modified: r.modified }));
}
/** Delete a kept file: its Library item and bytes first, then this browser's record. */
export async function remove(w, key) {
    const r = await get(w, key);
    if (r?.lib)
        await unshelve(w, r.lib);
    await tx(await db(w), 'readwrite', (s) => s.delete(key));
    held.delete(key);
    forget(key);
}
/** Delete one Library item. One already gone is gone. */
async function unshelve(w, id) {
    await ask(w, 'api', `/v1/library/${enc(id)}`, { method: 'DELETE' }).catch((e) => {
        if (!(e instanceof Refusal && e.status === 404))
            throw e;
    });
}
/** A kept JSON document, or null when there is none. */
export async function load(w, key) {
    const r = await get(w, key);
    if (!r?.blob)
        return null;
    try {
        return JSON.parse(await r.blob.text());
    }
    catch {
        return null;
    }
}
export const save = (w, key, value) => put(w, key, new Blob([JSON.stringify(value)], { type: 'application/json' }));
/** Every Studio item in the person's Library, read a page at a time. */
export async function shelf(w, signal) {
    const out = [];
    let cursor = '';
    do {
        const page = await ask(w, 'api', `/v1/library${query({ source: 'studio', scope: 'mine', limit: 200, cursor })}`, { signal });
        out.push(...(page.data ?? []));
        cursor = page.next ?? '';
    } while (cursor);
    return out;
}
/** Delete one item from the Library, and this browser's record of it. */
export async function discard(w, id) {
    await unshelve(w, id);
    for (const r of await all(w))
        if (r.lib === id)
            await tx(await db(w), 'readwrite', (s) => s.delete(r.key));
}
/** The org's GPUs and what each can run. A fleet the engine cannot read is an error, never an empty fleet. */
export const gpus = (w, signal) => ask(w, 'engine', '/v1/gpu-status', { signal });
/** Dispatch a lane to the org's GPUs (the engine's one funnel). */
export const dispatch = (w, lane, body, signal) => ask(w, 'engine', `/v1/library/${lane}`, { body, signal });
/** The engine's record of what was dispatched and what landed. */
export const worklog = (w, signal) => ask(w, 'engine', '/v1/worklog', { signal }).then((r) => r.items ?? []);
/** A landed file of the engine library, as bytes. */
export const landed = (w, path) => ask(w, 'engine', `/v1/library/file${query({ path })}`);
/** Documents and decks: the engine's renderers. */
export const documents = {
    schema: (w) => ask(w, 'engine', '/v1/documents/schema'),
    create: (w, body) => ask(w, 'engine', '/v1/documents', { body }),
    generate: (w, body) => ask(w, 'engine', '/v1/documents/generate', { body }),
    patch: (w, id, body) => ask(w, 'engine', `/v1/documents/${enc(id)}`, { method: 'PATCH', body }),
    get: (w, id) => ask(w, 'engine', `/v1/documents/${enc(id)}`),
    file: (w, id, format) => ask(w, 'engine', `/v1/documents/${enc(id)}/download${query({ format })}`),
};
/** Stage a picture in the engine's input folder for a lane that starts from one. Answers the name the lane takes. */
export async function stage(w, blob, name) {
    const form = new FormData();
    form.append('image', blob, name);
    form.append('type', 'input');
    form.append('overwrite', 'false');
    const r = await ask(w, 'engine', '/v1/upload/image', { raw: form });
    return r.subfolder ? `${r.subfolder}/${r.name}` : r.name;
}
/** A clip from a gateway video model: started, followed, read back (the async /v1/videos API). */
export async function film(w, model, prompt, o) {
    const job = await ask(w, 'api', '/v1/videos/generations', { body: { model, prompt, size: o.size, seconds: o.seconds }, signal: o.signal });
    const id = job.id ?? job.data?.[0]?.id;
    if (!id)
        throw new Refusal(502, `${model} took the clip but named no job.`);
    const until = Date.now() + 20 * 60_000;
    for (;;) {
        const s = await ask(w, 'api', `/v1/videos/${enc(id)}`, { signal: o.signal });
        const status = (s.status ?? '').toLowerCase();
        if (['completed', 'succeeded', 'done'].includes(status))
            break;
        if (['failed', 'error', 'cancelled'].includes(status))
            throw new Refusal(502, typeof s.error === 'string' ? s.error : (s.error?.message ?? `The clip ${status}.`));
        if (Date.now() > until)
            throw new Refusal(504, 'The clip is still rendering.');
        o.doing(status === 'queued' ? 'Waiting for the video model' : 'Rendering the clip');
        await new Promise((r) => setTimeout(r, 4000));
    }
    return ask(w, 'api', `/v1/videos/${enc(id)}/content`, { signal: o.signal });
}
/** The gateway's catalog of models that make something other than words. */
export async function makers(w, signal) {
    const out = await ask(w, 'api', '/v1/models', { signal });
    return (out.data ?? [])
        .filter((m) => (m.outputs ?? []).some((o) => ['image', 'audio', 'video', '3d', 'mesh'].includes(o)))
        .map((m) => ({ id: m.id, name: m.name ?? m.id, inputs: m.inputs ?? [], outputs: m.outputs ?? [] }));
}
