// @generated
/**
 * THE ONE CLIENT MODULE. Everything Studio asks of the network goes through
 * here, so the transport is one change when the native workflow plane
 * (`api.hanzo.ai/v1/studio/*`) answers.
 *
 * Three places are reached today:
 *
 *   gateway   api.hanzo.ai/v1: the models — the chat that decides what to make,
 *             image generation and edit, speech, music. Billed to `org`.
 *   store     this browser's IndexedDB, per person and org, and the person's
 *             private Library (api.hanzo.ai/v1/library) once it answers.
 *   engine    the studio engine: documents and decks, and the GPU lanes
 *             (Zen Image, Wan video, ACE music, mesh) dispatched to the org's
 *             GPUs. Same origin on studio.hanzo.ai; https://studio.hanzo.ai
 *             from anywhere else, with the bearer, never a cookie.
 *
 * A refusal is a `Refusal` carrying the status and the server's own sentence,
 * whichever envelope it came in (problem details, `{error}`, `{status:'error',
 * msg}`), and a 200 that says `status: "error"` is a refusal too.
 */
export interface Wire {
    /** The platform origin, no trailing slash. */
    api: string;
    /** The engine origin, no trailing slash: '' for this origin. */
    engine: string;
    /** The signed-in person's bearer, read at call time. */
    token: () => string | null;
    /** The org every call is scoped to (`X-Org-Id`). */
    org: string | null;
}
/** Where the engine is from a page that is not studio.hanzo.ai. */
export declare const ENGINE = "https://studio.hanzo.ai";
export declare class Refusal extends Error {
    readonly status: number;
    readonly code: string;
    constructor(status: number, message: string, code?: string);
}
type Base = 'api' | 'engine';
export interface Ask {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    /** A body sent as is (a form, a blob). */
    raw?: BodyInit;
    type?: string;
    signal?: AbortSignal;
    head?: Record<string, string>;
    /** Reads the headers of an answer that succeeded. */
    heard?: (h: Headers) => void;
}
/** One request. JSON in, JSON out, unless the answer is not JSON. */
export declare function ask<T>(w: Wire, base: Base, path: string, o?: Ask): Promise<T>;
/** `?a=1&b=2` from the defined, non-empty values. */
export declare function query(q: Record<string, string | number | boolean | null | undefined>): string;
export interface Call {
    id: string;
    name: string;
    /** The arguments as the model wrote them: JSON text. */
    args: string;
}
export interface Said {
    text: string;
    calls: Call[];
    /** The model that answered, as the gateway names it. */
    model: string;
}
export type Message = {
    role: 'system' | 'user';
    content: string | Part[];
} | {
    role: 'assistant';
    content: string;
    tool_calls?: {
        id: string;
        type: 'function';
        function: {
            name: string;
            arguments: string;
        };
    }[];
} | {
    role: 'tool';
    tool_call_id: string;
    content: string;
};
export type Part = {
    type: 'text';
    text: string;
} | {
    type: 'image_url';
    image_url: {
        url: string;
    };
};
export interface Tool {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: object;
    };
}
/**
 * One turn of the chat that decides what to make, streamed: `heard` gets the
 * words so far as they arrive. Answers the words and the tool calls in full.
 */
export declare function complete(w: Wire, body: {
    model: string;
    messages: Message[];
    tools?: Tool[];
    temperature?: number;
}, heard: (text: string) => void, signal?: AbortSignal): Promise<Said>;
/** A JSON answer from a model, asked for by schema: what a generator (a type system, a deck's words) is made of. */
export declare function structured<T>(w: Wire, model: string, system: string, user: string, schema: object, signal?: AbortSignal): Promise<T>;
export interface Picture {
    blob: Blob;
    mime: string;
}
/** A data: URL's bytes. */
export declare function bytes(url: string): Picture;
/**
 * An image from a gateway image model: words, and the pictures it starts from
 * (an edit). The image models are chat models with an image output, so this is
 * a chat completion asking for both modalities; the pictures come back on the
 * message (`images`) or among its content parts.
 */
export declare function draw(w: Wire, model: string, prompt: string, o?: {
    from?: string[];
    aspect?: string;
    signal?: AbortSignal;
}): Promise<Picture[]>;
/** Speech from words: the platform's voice. */
export declare function speak(w: Wire, input: string, voice: string, model: string, signal?: AbortSignal): Promise<Blob>;
/** Whether api.hanzo.ai/v1/library answers for this person. */
export declare function libraryLive(w: Wire): Promise<boolean>;
/** Keep bytes at a key: a made file in the Library, anything else in this browser. Answers the key. */
export declare function put(w: Wire, key: string, blob: Blob): Promise<string>;
/**
 * Carry up to the Library every made file this browser still holds the bytes
 * of, and drop them here once the Library has them. Answers how many went.
 */
export declare function sync(w: Wire): Promise<number>;
/** An address a page can draw a kept file at. */
export declare function url(w: Wire, key: string): Promise<string>;
/** A kept file's bytes: from this page, this browser, or the Library. */
export declare function read(w: Wire, key: string): Promise<Blob>;
export interface Entry {
    /** Relative to the prefix listed. */
    key: string;
    size: number;
    /** Unix milliseconds. */
    modified: number;
}
/** What is kept under a prefix (one that ends in '/'), keys relative to it. */
export declare function list(w: Wire, prefix: string): Promise<Entry[]>;
/** Delete a kept file: its Library item and bytes first, then this browser's record. */
export declare function remove(w: Wire, key: string): Promise<void>;
/** A kept JSON document, or null when there is none. */
export declare function load<T>(w: Wire, key: string): Promise<T | null>;
export declare const save: (w: Wire, key: string, value: unknown) => Promise<string>;
export interface Shelf {
    id: string;
    kind: string;
    name: string;
    mime: string;
    bytes: number;
    ref: string;
    origin: string;
    url: string;
    download: string;
    preview: string;
    created: string;
    shared: boolean;
}
/** Every Studio item in the person's Library, read a page at a time. */
export declare function shelf(w: Wire, signal?: AbortSignal): Promise<Shelf[]>;
/** Delete one item from the Library, and this browser's record of it. */
export declare function discard(w: Wire, id: string): Promise<void>;
export interface Node {
    identity: string;
    name?: string;
    online?: boolean;
    /** The lanes this GPU can run now: every file its graph loads is present. */
    lanes?: string[];
}
export interface Fleet {
    state: 'busy' | 'ready' | 'offline';
    online: number;
    total: number;
    nodes: Node[];
}
/** The org's GPUs and what each can run. A fleet the engine cannot read is an error, never an empty fleet. */
export declare const gpus: (w: Wire, signal?: AbortSignal) => Promise<Fleet>;
export interface Submitted {
    prompt_id?: string;
    id?: string;
    node?: string | null;
    output?: string;
    outputs?: string[];
}
/** Dispatch a lane to the org's GPUs (the engine's one funnel). */
export declare const dispatch: (w: Wire, lane: 'image' | 'video' | 'fix' | 'model3d' | 'music', body: object, signal?: AbortSignal) => Promise<Submitted>;
export interface Row {
    id: string;
    status: string;
    kind?: string;
    output?: string;
    outputs?: string[];
    error?: string;
    prompt_id?: string;
}
/** The engine's record of what was dispatched and what landed. */
export declare const worklog: (w: Wire, signal?: AbortSignal) => Promise<Row[]>;
/** A landed file of the engine library, as bytes. */
export declare const landed: (w: Wire, path: string) => Promise<Blob>;
/** Documents and decks: the engine's renderers. */
export declare const documents: {
    schema: (w: Wire) => Promise<object>;
    create: (w: Wire, body: {
        kind: string;
        ir: object;
        title?: string;
    }) => Promise<{
        id: string;
    }>;
    generate: (w: Wire, body: {
        templateId: string;
        description?: string;
        fields?: object;
    }) => Promise<{
        id: string;
    }>;
    patch: (w: Wire, id: string, body: object) => Promise<{
        id: string;
    }>;
    get: (w: Wire, id: string) => Promise<{
        id: string;
        kind: string;
        ir: object;
        title: string;
    }>;
    file: (w: Wire, id: string, format: string) => Promise<Blob>;
};
/** Stage a picture in the engine's input folder for a lane that starts from one. Answers the name the lane takes. */
export declare function stage(w: Wire, blob: Blob, name: string): Promise<string>;
/** A clip from a gateway video model: started, followed, read back (the async /v1/videos API). */
export declare function film(w: Wire, model: string, prompt: string, o: {
    size?: string;
    seconds?: number;
    doing: (l: string) => void;
    signal: AbortSignal;
}): Promise<Blob>;
/** The gateway's catalog of models that make something other than words. */
export declare function makers(w: Wire, signal?: AbortSignal): Promise<{
    id: string;
    name: string;
    inputs: string[];
    outputs: string[];
}[]>;
export {};
