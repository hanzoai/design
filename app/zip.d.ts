// @generated
/**
 * A ZIP of files, stored (no compression): what an ad set downloads as. PNGs
 * are compressed already, so storing them costs nothing and keeps the writer
 * to the format's two records and a CRC.
 */
export declare function zip(files: readonly {
    name: string;
    blob: Blob;
}[]): Promise<Blob>;
