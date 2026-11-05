// @generated
/**
 * The host Studio is mounted under, for every pane: @hanzo/build's `Host`, the
 * same value Dev takes, so hanzo.ai mounts both one way. It is also handed to
 * @hanzo/build's own provider, which its side panel reads.
 */
import { type Host } from '@hanzo/build';
import { type ReactNode } from 'react';
export declare function StudioHost({ host, children }: {
    host: Host;
    children: ReactNode;
}): import("react").JSX.Element;
export declare function useHost(): Host;
