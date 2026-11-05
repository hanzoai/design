// @generated
import { jsx as _jsx } from "react/jsx-runtime";
import { Activity, LayoutTemplate, Library, SquarePen } from '@hanzogui/lucide-icons-2';
import { path, route } from './route.js';
/** The id of the row that starts a new conversation: a rail with a New control of its own draws that instead. */
export const NEW = 'new';
export function nav(host, go) {
    const r = route(host.path);
    const to = (p) => () => go(p);
    return [
        {
            id: 'make',
            label: 'Create',
            links: [
                { id: NEW, label: 'New creation', icon: _jsx(SquarePen, { size: 16 }), onPress: to(''), active: r.kind === 'new' },
                { id: 'explore', label: 'Explore', icon: _jsx(LayoutTemplate, { size: 16 }), onPress: to(path({ kind: 'explore' })), active: r.kind === 'explore' },
                { id: 'library', label: 'Library', icon: _jsx(Library, { size: 16 }), onPress: to(path({ kind: 'library' })), active: r.kind === 'library' },
                { id: 'activity', label: 'Activity', icon: _jsx(Activity, { size: 16 }), onPress: to(path({ kind: 'activity' })), active: r.kind === 'activity' },
            ],
        },
    ];
}
