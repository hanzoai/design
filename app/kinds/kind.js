// @generated
/** The first gateway model that makes `output`. */
export const maker = (a, output) => a.models.find((m) => m.outputs.includes(output)) ?? null;
/** Whether an online GPU of the org advertises `lane`. */
export function lit(fleet, lane) {
    return Boolean(fleet?.nodes.some((n) => n.online !== false && n.lanes?.includes(lane)));
}
/** A string argument, trimmed, or `or`. */
export const str = (v, or = '') => (typeof v === 'string' && v.trim() ? v.trim() : or);
/** A number argument within bounds, or `or`. */
export const num = (v, or, lo = -Infinity, hi = Infinity) => {
    const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
    return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : or;
};
