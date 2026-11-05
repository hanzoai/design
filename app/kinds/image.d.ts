// @generated
import { type Stored } from '../made.ts';
import { type Fleet, type Wire } from '../wire.ts';
import { type Kind, type Work } from './kind.ts';
/** The gateway's image models, best first. */
export declare const MODELS: readonly [{
    readonly id: 'google/gemini-3.1-flash-image';
    readonly label: 'Nano Banana 2';
}, {
    readonly id: 'google/gemini-3-pro-image';
    readonly label: 'Nano Banana Pro';
}, {
    readonly id: 'openai/gpt-5.4-image-2';
    readonly label: 'GPT Image 2';
}, {
    readonly id: 'openai/gpt-5-image-mini';
    readonly label: 'GPT Image Mini';
}, {
    readonly id: 'google/gemini-2.5-flash-image';
    readonly label: 'Nano Banana';
}];
export declare const ZEN = "zen-image";
export declare const ASPECTS: readonly ['1:1', '4:5', '3:4', '2:3', '9:16', '16:9', '3:2', '4:3', '21:9'];
/** Which lane a request takes: the one asked for, else Zen Image on a GPU that can run it, else the gateway. */
export declare function lane(model: string, fleet: Fleet | null): string;
/** Which lane an edit takes: the one asked for, else Qwen Edit on a GPU that can run it, else the gateway. */
export declare function editing(model: string, fleet: Fleet | null): string;
/** What a person reads when the gateway draws no picture: never a model, a provider or the plumbing between. */
export declare const UNDRAWN = "Couldn't draw the picture this time.";
/** Make pictures from words (and, for an edit, the pictures they start from), and keep them. */
export declare function picture(w: Work, o: {
    prompt: string;
    aspect: string;
    model: string;
    from?: Stored[];
    count?: number;
}): Promise<{
    files: Stored[];
    by: string;
}>;
export declare const image: Kind;
export declare function Shot({ wire, file, alt, max }: {
    wire: Wire;
    file: Stored;
    alt: string;
    max: string;
}): import("react").JSX.Element;
