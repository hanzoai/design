// @generated
/**
 * A PDF of pictures, one per page, each page the physical size asked for.
 * The pictures are JPEG, which PDF carries as they are (DCTDecode), so this is
 * the whole writer: a catalog, the pages, one image each, and the cross
 * reference table. No fonts, no text: what is drawn is the picture.
 */
export interface Sheet {
    jpeg: Uint8Array;
    /** The picture's pixels. */
    width: number;
    height: number;
    /** The page, in points (1/72 inch). */
    pageWidth: number;
    pageHeight: number;
}
export declare function pdf(sheets: readonly Sheet[], title: string): Blob;
