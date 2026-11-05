// @generated
import { type Made } from './made.ts';
import type { Wire } from './wire.ts';
export interface DeskProps {
    made: Made;
    wire: Wire;
    others: readonly Made[];
    /** Show version `at`. */
    onPick: (at: number) => void;
    onEdit: (patch: Record<string, unknown>, note: string) => void;
    busy: boolean;
    /** Why the last edit failed, for this tab. */
    failed?: string;
}
export declare function Desk({ made, wire, others, onPick, onEdit, busy, failed }: DeskProps): import("react").JSX.Element;
