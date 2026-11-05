// @generated
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * The host Studio is mounted under, for every pane: @hanzo/build's `Host`, the
 * same value Dev takes, so hanzo.ai mounts both one way. It is also handed to
 * @hanzo/build's own provider, which its side panel reads.
 */
import { HostProvider } from '@hanzo/build';
import { createContext, useContext } from 'react';
const Ctx = createContext(null);
export function StudioHost({ host, children }) {
    return (_jsx(HostProvider, { host: host, children: _jsx(Ctx.Provider, { value: host, children: children }) }));
}
export function useHost() {
    const h = useContext(Ctx);
    if (!h)
        throw new Error('Studio was drawn without a host');
    return h;
}
