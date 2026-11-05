// @generated
/**
 * Small hooks every tab uses: a stored file's address, and its text.
 */
import { useEffect, useState } from 'react';
import { read, url } from './wire.js';
/** A stored file's read address, minted when drawn; '' until it is, and on failure. */
export function useUrl(w, key) {
    const [state, setState] = useState({ src: '', error: '' });
    useEffect(() => {
        if (!key)
            return;
        let live = true;
        url(w, key).then((src) => live && setState({ src, error: '' }), (e) => live && setState({ src: '', error: e instanceof Error ? e.message : String(e) }));
        return () => {
            live = false;
        };
    }, [w, key]);
    return state;
}
/** A stored file's text, read when drawn. */
export function useText(w, key) {
    const [state, setState] = useState({ text: null, error: '' });
    useEffect(() => {
        if (!key)
            return;
        let live = true;
        read(w, key)
            .then((b) => b.text())
            .then((text) => live && setState({ text, error: '' }), (e) => live && setState({ text: null, error: e instanceof Error ? e.message : String(e) }));
        return () => {
            live = false;
        };
    }, [w, key]);
    return state;
}
