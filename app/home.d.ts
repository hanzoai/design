// @generated
import type { Available } from './kinds/kind.ts';
import type { KindId } from './made.ts';
import { type Starter } from './starters.ts';
export declare function Home({ available, onStart, onUpload, }: {
    available: Available;
    onStart: (s: Starter) => void;
    onUpload?: (accept?: string, prompt?: string, kind?: KindId) => void;
}): import("react").JSX.Element;
