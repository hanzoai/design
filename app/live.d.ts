// @generated
/**
 * What Studio reads while it is open: the call target from the host, what can
 * run (the org's GPUs and the gateway's makers), and the list of conversations.
 * One reader each, shared by every pane, so the home, the composer and the
 * tools agree about what is on offer.
 */
import type { Host } from '@hanzo/build';
import { type Listed } from './chat/store.ts';
import type { Available } from './kinds/kind.ts';
import { type Fleet, type Wire } from './wire.ts';
/**
 * Where the engine is from this page: this origin on studio.hanzo.ai, a dev
 * server's /engine proxy on a laptop, studio.hanzo.ai from anywhere else.
 */
export declare function engineFrom(hostname: string): string;
/**
 * The models Studio's own words come from. The chat that decides what to make
 * calls tools; the writer answers JSON a kind asks for (a type system, a deck).
 * Measured 2026-10-16 on api.hanzo.ai: zen5 calls tools in ~3 s and zen5-flash
 * answers a strict schema in ~2 s, where zen5 spent 30 s reasoning over the same
 * schema and zen5-flash answered tools in prose.
 */
export declare const BRAIN = "zen5";
export declare const WRITER = "zen5-flash";
export declare function useWire(host: Host): Wire;
/** The org's GPUs and the gateway's makers, read every 15 s while a Studio pane is drawn. */
export declare function useAvailable(w: Wire): Available & {
    error: string;
};
export declare function reloadChats(w: Wire): Promise<void>;
/** A conversation's row changed here: shown at once, before the index is read again. */
export declare function touch(row: Listed): void;
export declare function useChats(w: Wire): {
    rows: Listed[];
    error: string;
};
/**
 * Whether the person's Library answers: asked once, and on the first yes
 * every made file this browser still holds is carried up to it and dropped here.
 */
export declare function useLibrary(w: Wire): boolean | null;
export type { Fleet };
