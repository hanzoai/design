// @generated
export interface Colors {
    ink: string;
    paper: string;
    accent: string;
    muted: string;
    /** A second accent, for charts and tags. */
    second: string;
}
export interface TypeSystem {
    name: string;
    blurb: string;
    display: string;
    text: string;
    mono: string;
    scale: {
        base: number;
        ratio: number;
    };
    weights: {
        display: number;
        heading: number;
        body: number;
        strong: number;
    };
    leading: {
        display: number;
        heading: number;
        body: number;
    };
    /** Letter-spacing, em: display sizes and all-caps labels. */
    tracking: {
        display: number;
        caps: number;
    };
    colors: Colors;
}
/** The named steps, smallest first, and the power of the ratio each is. */
export declare const STEPS: readonly [readonly ['caption', -2], readonly ['small', -1], readonly ['body', 0], readonly ['lead', 1], readonly ['h4', 2], readonly ['h3', 3], readonly ['h2', 4], readonly ['h1', 5], readonly ['display', 7]];
export type Step = (typeof STEPS)[number][0];
export declare function size(t: TypeSystem, step: Step): number;
/** The ratios a scale may take, by their musical names. */
export declare const RATIOS: readonly [readonly [1.125, 'Major second'], readonly [1.2, 'Minor third'], readonly [1.25, 'Major third'], readonly [1.333, 'Perfect fourth'], readonly [1.414, 'Augmented fourth'], readonly [1.5, 'Perfect fifth'], readonly [1.618, 'Golden']];
export declare const PRESETS: readonly TypeSystem[];
/** A type system as the model or a person wrote it, made safe to draw: unknown faces, bad colours and wild numbers fall back. */
export declare function settle(v: Partial<TypeSystem> & Record<string, unknown>, base?: TypeSystem): TypeSystem;
/** The JSON Schema a model fills to write one. */
export declare const SCHEMA: {
    readonly type: 'object';
    readonly additionalProperties: false;
    readonly required: readonly ['name', 'blurb', 'display', 'text', 'mono', 'scale', 'weights', 'leading', 'tracking', 'colors'];
    readonly properties: {
        readonly name: {
            readonly type: 'string';
        };
        readonly blurb: {
            readonly type: 'string';
        };
        readonly display: {
            readonly type: 'string';
            readonly enum: readonly string[];
        };
        readonly text: {
            readonly type: 'string';
            readonly enum: readonly string[];
        };
        readonly mono: {
            readonly type: 'string';
            readonly enum: string[];
        };
        readonly scale: {
            readonly type: 'object';
            readonly additionalProperties: false;
            readonly required: readonly ['base', 'ratio'];
            readonly properties: {
                readonly base: {
                    readonly type: 'number';
                };
                readonly ratio: {
                    readonly type: 'number';
                };
            };
        };
        readonly weights: {
            readonly type: 'object';
            readonly additionalProperties: false;
            readonly required: readonly ['display', 'heading', 'body', 'strong'];
            readonly properties: {
                readonly display: {
                    readonly type: 'number';
                };
                readonly heading: {
                    readonly type: 'number';
                };
                readonly body: {
                    readonly type: 'number';
                };
                readonly strong: {
                    readonly type: 'number';
                };
            };
        };
        readonly leading: {
            readonly type: 'object';
            readonly additionalProperties: false;
            readonly required: readonly ['display', 'heading', 'body'];
            readonly properties: {
                readonly display: {
                    readonly type: 'number';
                };
                readonly heading: {
                    readonly type: 'number';
                };
                readonly body: {
                    readonly type: 'number';
                };
            };
        };
        readonly tracking: {
            readonly type: 'object';
            readonly additionalProperties: false;
            readonly required: readonly ['display', 'caps'];
            readonly properties: {
                readonly display: {
                    readonly type: 'number';
                };
                readonly caps: {
                    readonly type: 'number';
                };
            };
        };
        readonly colors: {
            readonly type: 'object';
            readonly additionalProperties: false;
            readonly required: readonly ['ink', 'paper', 'accent', 'muted', 'second'];
            readonly properties: {
                readonly ink: {
                    readonly type: 'string';
                };
                readonly paper: {
                    readonly type: 'string';
                };
                readonly accent: {
                    readonly type: 'string';
                };
                readonly muted: {
                    readonly type: 'string';
                };
                readonly second: {
                    readonly type: 'string';
                };
            };
        };
    };
};
/** What a writer is told: the faces it may use, and the rules a pairing keeps. */
export declare const BRIEF: string;
/** WCAG relative luminance contrast of two #rrggbb colours. */
export declare function contrast(a: string, b: string): number;
/** CSS custom properties: the one export every web surface reads. */
export declare function css(t: TypeSystem): string;
/** Design tokens in the W3C Design Tokens format ($value / $type). */
export declare function tokens(t: TypeSystem): string;
/** A @hanzo/gui theme module: the faces as gui fonts, the colours as a theme. */
export declare function gui(t: TypeSystem): string;
