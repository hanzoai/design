// @generated
/**
 * Conversations as stored, and the list of them.
 *
 *   chats/<id>.json     one conversation, whole
 *   chats/index.json    every conversation's id, title, time, state and
 *                              the picture to show for it: the list Recent and
 *                              the rail read without opening each one
 *
 * The index is rewritten on every save of a conversation; a lost race between
 * two tabs loses only a row's freshness, and `rebuild` lists the folder to
 * write it again from the conversations themselves.
 */
import { current } from '../made.js';
import { list, load, save } from '../wire.js';
const INDEX = 'chats/index.json';
export function listed(c) {
    const last = c.turns.at(-1);
    const state = last?.doing ? 'making' : last?.failed ? 'failed' : 'done';
    let cover;
    for (const m of [...c.made].reverse()) {
        const f = current(m).files.find((x) => x.mime.startsWith('image/'));
        if (f) {
            cover = f.key;
            break;
        }
    }
    return { id: c.id, title: c.title, updated: c.updated, state, cover, count: c.made.length };
}
export async function index(w) {
    const rows = (await load(w, INDEX)) ?? [];
    return rows.sort((a, b) => b.updated - a.updated);
}
/** Save a conversation, and its row in the index. */
export async function keep(w, c) {
    await save(w, `chats/${c.id}.json`, c);
    const rows = (await load(w, INDEX)) ?? [];
    const next = [listed(c), ...rows.filter((r) => r.id !== c.id)].slice(0, 500);
    await save(w, INDEX, next);
}
export const open = (w, id) => load(w, `chats/${id}.json`);
/** Write the index again from the conversations stored. */
export async function rebuild(w) {
    const entries = (await list(w, 'chats/')).filter((e) => e.key.endsWith('.json') && e.key !== 'index.json');
    const rows = [];
    for (const e of entries) {
        const c = await open(w, e.key.replace(/\.json$/, ''));
        if (c)
            rows.push(listed(c));
    }
    await save(w, INDEX, rows);
    return rows.sort((a, b) => b.updated - a.updated);
}
export async function forget(w, id) {
    const rows = (await load(w, INDEX)) ?? [];
    await save(w, INDEX, rows.filter((r) => r.id !== id));
}
