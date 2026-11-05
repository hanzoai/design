// @generated
export declare function pixels(svg: string, width: number, height: number, type?: 'image/png' | 'image/jpeg', quality?: number): Promise<Blob>;
/** One page of PDF at a physical size (points), the SVG drawn at `width`x`height` pixels. */
export declare function page(svg: string, width: number, height: number, points: [number, number], title: string): Promise<Blob>;
/** A stored picture as a data: URL. */
export declare function data(blob: Blob): Promise<string>;
/** A picture as a JPEG data: URL no larger than `side` on its long edge: what a document carries inline. */
export declare function shrink(blob: Blob, side?: number, quality?: number): Promise<string>;
