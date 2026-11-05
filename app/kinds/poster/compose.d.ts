// @generated
import type { TypeSystem } from '../type/system.ts';
export interface Format {
    id: string;
    label: string;
    /** Pixels drawn. */
    width: number;
    height: number;
    /** The page, in points, for the PDF. */
    points: [number, number];
}
export declare const FORMATS: readonly Format[];
export declare const format: (id: string) => Format;
/** The aspect a picture for this format is drawn at (the image lane's names). */
export declare function aspect(f: Format, layout: Layout): string;
export declare const LAYOUTS: readonly ['hero', 'center', 'split', 'frame', 'type'];
export type Layout = (typeof LAYOUTS)[number];
export declare const LAYOUT_NAMES: Record<Layout, string>;
export interface Words {
    headline: string;
    subhead: string;
    /** Lines: a date, a place, a price. */
    details: string;
    cta: string;
}
export interface Poster extends Words {
    format: string;
    /** Pixels, for a size no format names (an ad unit). */
    size?: {
        width: number;
        height: number;
    };
    layout: Layout;
    /** A data: URL of the picture, or '' for none. */
    picture: string;
    system: TypeSystem;
}
/** Load the faces a poster draws in, so measuring and drawing use them. */
export declare function ready(t: TypeSystem): Promise<void>;
/** The poster as SVG, faces and picture inside it. */
export declare function compose(p: Poster): Promise<string>;
