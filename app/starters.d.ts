// @generated
import type { KindId } from './made.js';
export type Category = 'image' | 'edit' | 'poster' | 'document' | 'slides' | 'type' | 'ad' | 'fashion';
export declare const CATEGORIES: readonly {
    id: Category | 'all';
    label: string;
}[];
export interface Starter {
    id: string;
    kind: KindId;
    category: Category;
    badge?: string;
    title: string;
    subtitle: string;
    prompt: string;
    picture?: boolean;
    thumb?: string;
}
export declare const RUNTIME: Record<KindId, string>;
export declare const STARTERS: readonly Starter[];
