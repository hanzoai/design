// @generated
/**
 * A render on the org's GPUs, start to finish: dispatch through the engine's
 * one funnel, follow its work-log row until the engine's integrity gate says
 * done (or failed), and read back what landed.
 *
 * The engine's word is the only verdict: `done` is the row its gate closed, a
 * `failed` row carries the engine's reason, and a row still `queued` when the
 * wait runs out is said to be still rendering, never called finished.
 */
import { dispatch, type Wire } from './wire.ts';
export type Lane = Parameters<typeof dispatch>[1];
export declare function render(w: Wire, lane: Lane, body: object, doing: (line: string) => void, signal: AbortSignal): Promise<{
    blob: Blob;
    path: string;
}[]>;
