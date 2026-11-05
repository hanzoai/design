// @generated
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * The few controls Studio draws itself, on gui tokens: a choice from a list
 * (the browser's own <select>), a colour, a line or a paragraph of text, a pill
 * that is on or off, and a quiet labelled row. Everything larger is @hanzo/ui's
 * or @hanzo/build's.
 */
import { SizableText, styled, XStack, YStack } from '@hanzo/gui';
const field = {
    size: '$2',
    minW: 0,
    rounded: '$3',
    borderWidth: 1,
    borderColor: '$borderColor',
    bg: 'transparent',
    color: '$ink',
    focusVisibleStyle: { outlineWidth: 2, outlineStyle: 'solid', outlineColor: '$outlineColor' },
};
const Select = styled(SizableText, { name: 'StudioChoice', render: 'select', height: 32, px: '$2', cursor: 'pointer', ...field });
const Line = styled(SizableText, { name: 'StudioLine', render: 'input', height: 32, px: '$2.5', ...field });
const Lines = styled(SizableText, { name: 'StudioLines', render: 'textarea', p: '$2.5', minH: 72, ...field });
export function Choice({ value, options, onChange, label }) {
    const all = value === '' || options.some((o) => o.value === value) ? options : [{ value }, ...options];
    return (_jsx(Select, { ...{ value }, onChange: (e) => onChange(e.currentTarget.value), "aria-label": label, children: all.map((o) => (_jsx("option", { value: o.value, children: o.label ?? o.value }, o.value))) }));
}
export function Text1({ value, onChange, label, placeholder }) {
    return (_jsx(Line, { ...{ value, placeholder }, onChange: (e) => onChange(e.currentTarget.value), "aria-label": label }));
}
export function TextN({ value, onChange, label, rows = 3 }) {
    return _jsx(Lines, { ...{ value, rows }, onChange: (e) => onChange(e.currentTarget.value), "aria-label": label });
}
export function Color({ value, onChange, label }) {
    return (_jsx("input", { type: "color", value: value, "aria-label": label, onChange: (e) => onChange(e.currentTarget.value), style: { width: 32, height: 32, padding: 0, border: '1px solid var(--borderColor)', borderRadius: 8, background: 'transparent', cursor: 'pointer' } }));
}
/** A label above a control. */
export function Row({ label, children }) {
    return (_jsxs(YStack, { gap: "$1", minW: 0, children: [_jsx(SizableText, { size: "$1", color: "$soft", children: label }), children] }));
}
/** A pill that is on or off: a category, a filter. */
export function Pill({ on, onPress, children, label }) {
    return (_jsx(XStack, { render: "button", role: "button", "aria-pressed": on, "aria-label": label, onPress: onPress, items: "center", gap: "$1.5", height: 32, px: "$3", rounded: 999, borderWidth: 1, borderColor: on ? '$ink' : '$borderColor', bg: on ? '$ink' : 'transparent', cursor: "pointer", hoverStyle: { bg: on ? '$ink' : '$hover' }, focusVisibleStyle: { outlineWidth: 2, outlineStyle: 'solid', outlineColor: '$outlineColor' }, shrink: 0, children: _jsx(SizableText, { size: "$2", color: on ? '$background' : '$ink', children: children }) }));
}
/** A small press with an icon and a word: the tab bar's controls. */
export function Act({ onPress, children, label, on = false, disabled = false }) {
    return (_jsx(XStack, { render: "button", role: "button", "aria-label": label, "aria-pressed": on || undefined, disabled: disabled, onPress: disabled ? undefined : onPress, items: "center", gap: "$1.5", height: 30, px: "$2.5", rounded: "$3", bg: on ? '$hover' : 'transparent', opacity: disabled ? 0.4 : 1, cursor: disabled ? 'default' : 'pointer', hoverStyle: disabled ? undefined : { bg: '$hover' }, focusVisibleStyle: { outlineWidth: 2, outlineStyle: 'solid', outlineColor: '$outlineColor' }, shrink: 0, children: children }));
}
/** Save bytes as a file the person keeps. */
export function download(name, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
