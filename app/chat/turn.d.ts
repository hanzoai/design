// @generated
/**
 * ONE TURN of the conversation: the person says what to make, the chat calls
 * a kind's tool, the kind makes it, and it opens as a tab.
 *
 * The chat model (api.hanzo.ai) is handed every kind that can run now as a
 * tool, plus `revise` (change a tab), and the list of open tabs by number, so
 * "make the poster in tab 2 warmer" is a call to revise {tab: 2}. Each call is
 * run here, in order; its result goes back to the model as the tool's answer,
 * and the model closes the turn with a line of its own. A kind that cannot run
 * now (no GPU for 3D) is not offered as a tool; the model is told why, so it
 * says so instead of pretending.
 *
 * Nothing a turn makes is held only in memory: each version's files are
 * stored as they are made, and the conversation is saved after every change.
 */
import { type Wire } from '../wire.ts';
import type { Available } from '../kinds/kind.ts';
import { type TypeSystem } from '../kinds/type/system.ts';
import { type Chat, type KindId, type Made, type Stored } from '../made.ts';
export interface Asked {
    text: string;
    attached: Stored[];
    /** The kind the person picked (a pill, the Kind chip); none for Auto. */
    kind?: KindId;
    /** Lane and shape choices from the composer's options. */
    options?: {
        model?: string;
        aspect?: string;
        count?: number;
    };
}
export interface Context extends Available {
    wire: Wire;
    /** The model the chat runs on: it calls the tools. */
    brain: string;
    /** The model a kind writes words with. */
    writer: string;
    /** The tabs, in their order: made ids. */
    order: () => string[];
    /** Open a made thing's tab and show it. */
    show: (id: string) => void;
    /** The conversation changed: draw it, and keep it. */
    changed: (chat: Chat) => void;
    signal: AbortSignal;
}
/** The brand a conversation draws in, read from its type system. */
export declare function brandOf(chat: Chat): TypeSystem | null;
/** Run one turn. Answers the conversation as it stands at the end. */
export declare function turn(start: Chat, asked: Asked, ctx: Context): Promise<Chat>;
/** An edit in place: a new version of one made thing from a patch to its spec, with no chat turn. */
export declare function edit(start: Chat, m: Made, patch: Record<string, unknown>, note: string, ctx: Omit<Context, 'show' | 'brain'>): Promise<Chat>;
