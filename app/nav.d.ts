// @generated
/**
 * Studio's places, once, for every rail that lists them: Studio's own rail on
 * studio.hanzo.ai, and the Hanzo app's column at hanzo.ai/studio (the shape
 * @hanzo/build's `nav` gives Dev, so a host draws both one way). Every row
 * moves Studio through `go` with an address `path` writes.
 */
import type { Host } from '@hanzo/build';
import type { RailLink } from '@hanzo/ui/chat';
/** Studio's places, as one run: a host draws no heading over its first group. */
export interface Group {
    id: 'make';
    label: string;
    links: RailLink[];
}
/** The id of the row that starts a new conversation: a rail with a New control of its own draws that instead. */
export declare const NEW = "new";
export declare function nav(host: Host, go: (path: string) => void): Group[];
