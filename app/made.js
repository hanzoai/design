// @generated
/**
 * What a Design conversation is, and what it makes, as kept.
 */
import { fresh } from './route.js';
export const KINDS = ['image', 'poster', 'document', 'slides', 'type', 'ad', 'app'];
export const blank = (id = fresh()) => ({ id, title: 'New creation', created: Date.now(), updated: Date.now(), turns: [], made: [] });
/** The version a made thing shows. */
export const current = (m) => m.versions[Math.min(Math.max(0, m.at), m.versions.length - 1)];
/** Where a version's files live. */
export const dir = (chat, m, version) => `files/${m.kind}/${chat}/${m.id}/${version}`;
/** A file name a person reads: the title, slugged, and the extension. */
export function filename(title, ext) {
    const base = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60);
    return `${base || 'untitled'}.${ext}`;
}
