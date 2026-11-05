// @generated
/**
 * Every kind Studio makes, in the order the home and the pills list them.
 */
import type { KindId } from '../made.ts';
import type { Kind } from './kind.ts';
export declare const ALL: readonly Kind[];
export declare const kind: (id: KindId) => Kind;
/** The kind a tool name calls. */
export declare const called: (tool: string) => Kind | null;
