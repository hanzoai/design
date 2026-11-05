// @generated
export type KindId = 'image' | 'poster' | 'document' | 'slides' | 'type' | 'ad' | 'app';
export declare const KINDS: readonly KindId[];
export interface Stored {
    key: string;
    mime: string;
    name: string;
    width?: number;
    height?: number;
}
export interface Version {
    id: string;
    at: number;
    spec: Record<string, unknown>;
    files: Stored[];
    note: string;
    by?: string;
}
export interface Made {
    id: string;
    kind: KindId;
    title: string;
    versions: Version[];
    at: number;
}
export interface Turn {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    at: number;
    made?: string[];
    doing?: string;
    failed?: string;
    by?: string;
    attached?: Stored[];
}
export interface Chat {
    id: string;
    title: string;
    created: number;
    updated: number;
    turns: Turn[];
    made: Made[];
    brand?: string;
}
export declare const blank: (id?: string) => Chat;
export declare const current: (m: Made) => Version;
export declare const dir: (chat: string, m: Pick<Made, 'id' | 'kind'>, version: string) => string;
export declare function filename(title: string, ext: string): string;
