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
import { type Chat } from '../made.ts';
import type { Wire } from '../wire.ts';
export interface Listed {
    id: string;
    title: string;
    updated: number;
    /** making while a turn works, failed when the last turn failed, else done. */
    state: 'making' | 'done' | 'failed';
    /** A stored picture to show for it. */
    cover?: string;
    /** How many things it made. */
    count: number;
}
export declare function listed(c: Chat): Listed;
export declare function index(w: Wire): Promise<Listed[]>;
/** Save a conversation, and its row in the index. */
export declare function keep(w: Wire, c: Chat): Promise<void>;
export declare const open: (w: Wire, id: string) => Promise<Chat | null>;
/** Write the index again from the conversations stored. */
export declare function rebuild(w: Wire): Promise<Listed[]>;
export declare function forget(w: Wire, id: string): Promise<void>;
