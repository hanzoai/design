// @generated
import type { ReactNode } from 'react';
export interface Option {
    value: string;
    label?: string;
}
export declare function Choice({ value, options, onChange, label }: {
    value: string;
    options: readonly Option[];
    onChange: (v: string) => void;
    label: string;
}): import("react").JSX.Element;
export declare function Text1({ value, onChange, label, placeholder }: {
    value: string;
    onChange: (v: string) => void;
    label: string;
    placeholder?: string;
}): import("react").JSX.Element;
export declare function TextN({ value, onChange, label, rows }: {
    value: string;
    onChange: (v: string) => void;
    label: string;
    rows?: number;
}): import("react").JSX.Element;
export declare function Color({ value, onChange, label }: {
    value: string;
    onChange: (v: string) => void;
    label: string;
}): import("react").JSX.Element;
/** A label above a control. */
export declare function Row({ label, children }: {
    label: string;
    children: ReactNode;
}): import("react").JSX.Element;
/** A pill that is on or off: a category, a filter. */
export declare function Pill({ on, onPress, children, label }: {
    on: boolean;
    onPress: () => void;
    children: ReactNode;
    label?: string;
}): import("react").JSX.Element;
/** A small press with an icon and a word: the tab bar's controls. */
export declare function Act({ onPress, children, label, on, disabled }: {
    onPress: () => void;
    children: ReactNode;
    label: string;
    on?: boolean;
    disabled?: boolean;
}): import("react").JSX.Element;
/** Save bytes as a file the person keeps. */
export declare function download(name: string, blob: Blob): void;
