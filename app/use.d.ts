// @generated
import { type Wire } from './wire.ts';
/** A stored file's read address, minted when drawn; '' until it is, and on failure. */
export declare function useUrl(w: Wire, key: string | undefined): {
    src: string;
    error: string;
};
/** A stored file's text, read when drawn. */
export declare function useText(w: Wire, key: string | undefined): {
    text: string | null;
    error: string;
};
