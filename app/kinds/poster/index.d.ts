// @generated
import { type Wire } from '../../wire.ts';
import { type Kind } from '../kind.ts';
import { type TypeSystem } from '../type/system.ts';
import { type Layout } from './compose.ts';
export interface Spec {
    format: string;
    layout: Layout;
    headline: string;
    subhead: string;
    details: string;
    cta: string;
    /** The picture: a stored file's key, or '' for none. */
    picture: string;
    /** What the picture was drawn from, to draw it again. */
    prompt: string;
    system: TypeSystem;
    [k: string]: unknown;
}
/** The SVG for a spec: its picture read back from the store. */
export declare function svg(wire: Wire, s: Spec): Promise<string>;
export declare const poster: Kind;
