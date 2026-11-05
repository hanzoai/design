// @generated
/**
 * The faces a type system may pair: Zen (the Hanzo family, @hanzo/font) and a
 * short list of open fonts. Every one is SIL OFL 1.1, read from its own OFL.txt
 * in github.com/google/fonts on 2026-10-16 (`licence` is that file), so a
 * poster, a document or a deck drawn in any of them is free to ship.
 *
 * A face is loaded in the page by its stylesheet, and drawn into a picture
 * (a poster's PNG, its PDF) by its bytes: `face()` reads the woff2 the
 * stylesheet names and hands it back as a data: URL an SVG can embed.
 */
export type Role = 'sans' | 'serif' | 'display' | 'mono';
export interface Font {
    family: string;
    role: Role;
    /** The weights it carries; a variable face carries the range. */
    weights: readonly number[];
    italic: boolean;
    /** The stylesheet that loads it; '' for Zen, which the host already loads. */
    css: string;
    licence: string;
}
export declare const FONTS: readonly Font[];
export declare const FAMILIES: readonly string[];
export declare const font: (family: string) => Font;
/** A CSS font-family value with a fallback of its own role. */
export declare function stack(family: string): string;
/** Load a face in this page, once. */
export declare function use(family: string): void;
/** The @font-face rules for a face with its bytes inline, for an SVG that is drawn to a picture. */
export declare function face(family: string): Promise<string>;
