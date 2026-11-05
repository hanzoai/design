// @generated
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SizableText, XStack, YStack } from '@hanzo/gui';
import { SessionRail } from '@hanzo/ui/chat';
import { useState } from 'react';
import { StudioHost, useHost } from './host.js';
import { useChats, useWire } from './live.js';
import { nav, NEW } from './nav.js';
import { Activity, Explore, Library } from './places.js';
import { path, route } from './route.js';
import { Talk } from './talk.js';

const DOT = { making: 'running', done: 'done', failed: 'error' };

function Pane() {
    const host = useHost();
    const r = route(host.path);
    if (r.kind === 'library')
        return _jsx(Library, {});
    if (r.kind === 'explore')
        return _jsx(Explore, {});
    if (r.kind === 'activity')
        return _jsx(Activity, {});
    return _jsx(Talk, { id: r.kind === 'chat' ? r.id : null });
}

/** Design's own rail: New creation, the places, the conversations, and the account. */
function Rail() {
    const host = useHost();
    const wire = useWire(host);
    const { rows, error } = useChats(wire);
    const [collapsed, setCollapsed] = useState(false);
    const [drawer, setDrawer] = useState(false);
    const r = route(host.path);
    const go = (p) => {
        setDrawer(false);
        host.go(p);
    };
    const links = nav(host, go)
        .flatMap((g) => g.links)
        .filter((l) => l.id !== NEW);
    const recents = rows.map((row) => ({ id: row.id, title: row.title, status: DOT[row.state] }));
    return (_jsx(SessionRail, { onNew: () => go(''), newLabel: "New creation", fresh: r.kind === 'new', links: links, recents: recents, recentsLabel: "Recent", active: r.kind === 'chat' ? r.id : null, onOpen: (id) => go(path({ kind: 'chat', id })), empty: _jsx(SizableText, { size: "$1", color: "$soft", px: "$2", children: error || 'Nothing made yet.' }), account: host.person
            ? {
                name: host.person.name || host.person.email,
                sub: host.org ?? undefined,
                email: host.person.email,
                onSignOut: host.signOut,
            }
            : { name: 'Sign in', onPress: () => host.signIn?.() }, collapsed: collapsed, onCollapse: setCollapsed, open: drawer, onOpenChange: setDrawer, label: "Design" }));
}

/**
 * Hanzo Design. `rail={false}` leaves the left column to the host, which lists
 * Design's places with `nav`; Design is then a pane of the host's and paints
 * no ground of its own.
 */
export function Design({ host, rail = true }) {
    const effectiveHost = host.person ? host : { ...host, person: { sub: 'local-guest', email: 'local@hanzo.ai', name: 'Local User' } };
    return (_jsx(StudioHost, { host: effectiveHost, children: _jsxs(XStack, { "data-slot": "design-app", flex: 1, minH: 0, minW: 0, height: "100%", bg: rail ? '$background' : undefined, gap: rail ? 'var(--pane-gap, var(--space-2))' : 0, p: rail ? 'var(--pane-gap, var(--space-2))' : 0, children: [rail ? _jsx(Rail, {}) : null, _jsx(YStack, { flex: 1, minW: 0, minH: 0, children: _jsx(Pane, {}) })] }) }));
}

export { Design as Studio };
