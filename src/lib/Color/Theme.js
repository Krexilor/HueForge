// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
import { getContrast } from "./Convert.js"
import { DEFAULT_OPTIONS, buildScale, buildNeutral } from "./Scale.js"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
export const ROLES = [
    { id: "primary", label: "Primary" },
    { id: "secondary", label: "Secondary" },
    { id: "accent", label: "Accent" },
    { id: "success", label: "Success" },
    { id: "warning", label: "Warning" },
    { id: "danger", label: "Danger" }
]

export const DEFAULT_COLORS = {
    primary: "#2f6fed",
    secondary: "#8b5cf6",
    accent: "#f97316",
    success: "#1f9d5b",
    warning: "#e8a33d",
    danger: "#d6453a"
}

const WHITE = "#ffffff"
const INK = "#111111"

// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
function clamp(index, length) {
    return Math.min(length - 1, Math.max(0, index))
}

function ensure(scale, start, background, minimum, direction) {
    for (let index = start; index >= 0 && index < scale.length; index += direction) {
        if (getContrast(scale[index].hex, background) >= minimum) return scale[index].hex
    }

    return scale[direction > 0 ? scale.length - 1 : 0].hex
}

function solid(scale, start) {
    const base = scale[start].hex
    const useInk = getContrast(base, INK) > getContrast(base, WHITE)
    const on = useInk ? INK : WHITE
    const direction = useInk ? -1 : 1
    let index = start

    while (index > 0 && index < scale.length - 1 && getContrast(scale[index].hex, on) < 4.5) index += direction

    return { hex: scale[index].hex, hover: scale[clamp(index + direction, scale.length)].hex, on }
}

function roleTokens(scale, mode, background) {
    const dark = mode === "dark"
    const fill = solid(scale, dark ? 4 : 5)
    const soft = scale[dark ? 9 : 1].hex

    return {
        solid: fill.hex,
        hover: fill.hover,
        on: fill.on,
        soft,
        onSoft: ensure(scale, dark ? 2 : 8, soft, 4.5, dark ? -1 : 1),
        text: ensure(scale, dark ? 4 : 6, background, 4.5, dark ? -1 : 1)
    }
}

export function buildPalette(colors) {
    return {
        scales: Object.fromEntries(ROLES.map(role => [role.id, buildScale(colors[role.id], DEFAULT_OPTIONS)])),
        neutral: buildNeutral(colors.primary, 0.985, 0.16)
    }
}

export function buildTheme(palette, mode) {
    const dark = mode === "dark"
    const { neutral } = palette
    const n = index => neutral[index].hex
    const bg = dark ? n(10) : n(0)
    const surface = dark ? n(9) : WHITE

    return {
        mode,
        bg,
        surface,
        surfaceAlt: dark ? n(8) : n(1),
        border: dark ? n(7) : n(2),
        borderStrong: ensure(neutral, dark ? 6 : 5, surface, 3, dark ? -1 : 1),
        text: ensure(neutral, dark ? 1 : 9, bg, 7, dark ? -1 : 1),
        muted: ensure(neutral, dark ? 4 : 6, surface, 4.5, dark ? -1 : 1),
        roles: Object.fromEntries(ROLES.map(role => [role.id, roleTokens(palette.scales[role.id], mode, bg)]))
    }
}

export function variables(theme) {
    const list = [
        ["bg", theme.bg],
        ["surface", theme.surface],
        ["surface-alt", theme.surfaceAlt],
        ["border", theme.border],
        ["border-strong", theme.borderStrong],
        ["text", theme.text],
        ["muted", theme.muted]
    ]

    ROLES.forEach(({ id }) => {
        const role = theme.roles[id]

        list.push(
            [id, role.solid],
            [`${id}-hover`, role.hover],
            [`on-${id}`, role.on],
            [`${id}-soft`, role.soft],
            [`on-${id}-soft`, role.onSoft],
            [`${id}-text`, role.text]
        )
    })

    return list
}

export function previewStyle(theme, radius) {
    const style = Object.fromEntries(variables(theme).map(([name, value]) => [`--pv-${name}`, value]))

    style["--pv-radius"] = `${radius}px`
    style["--pv-radius-sm"] = `${Math.max(2, radius - 4)}px`

    return style
}

export function checks(theme) {
    const items = [
        { label: "Text on background", fg: theme.text, bg: theme.bg, min: 4.5 },
        { label: "Text on surface", fg: theme.text, bg: theme.surface, min: 4.5 },
        { label: "Muted text on surface", fg: theme.muted, bg: theme.surface, min: 4.5 },
        { label: "Input border on surface", fg: theme.borderStrong, bg: theme.surface, min: 3 }
    ]

    ROLES.forEach(({ id, label }) => {
        const role = theme.roles[id]

        items.push(
            { label: `${label} button text`, fg: role.on, bg: role.solid, min: 4.5 },
            { label: `${label} text on background`, fg: role.text, bg: theme.bg, min: 4.5 },
            { label: `${label} badge text`, fg: role.onSoft, bg: role.soft, min: 4.5 }
        )
    })

    return items.map(item => ({ ...item, ratio: getContrast(item.fg, item.bg) }))
}
