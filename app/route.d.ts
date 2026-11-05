// @generated
/**
 * Studio's addresses, said once. The host hands Studio the path under its
 * mount (`Host.path`, no leading slash) and moves it with `Host.go`; hanzo.ai
 * mounts Studio at /studio and studio.hanzo.ai at its root, so the same
 * grammar reads both.
 *
 *   ''              New: the composer and the starters
 *   c/<id>          one conversation, its tabs beside it
 *   library         everything this org has made
 *   explore         the starters, every kind, with what each needs
 *   activity        what is rendering, queued, done or failed
 *
 * No address here may be a word the engine answers on studio.hanzo.ai, because
 * the edge sends those to it (universe static-sites, the studio route split):
 * /templates, /settings, /models, /history, /view, /upload, /prompt, /login,
 * /callback, /logout, /v1, /ws. That is why the starters are `explore`.
 */
export type Route = {
    kind: 'new';
} | {
    kind: 'chat';
    id: string;
} | {
    kind: 'library';
} | {
    kind: 'explore';
} | {
    kind: 'activity';
};
export declare function route(at: string): Route;
export declare function path(r: Route): string;
/** A fresh conversation id: time-ordered, so a listing sorts by name. */
export declare function fresh(): string;
