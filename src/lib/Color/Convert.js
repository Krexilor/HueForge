// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { parse, converter, formatHex, formatRgb, clampChroma, displayable, wcagContrast } from "culori"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
const toOklch = converter("oklch")
const toHsl = converter("hsl")
const toHsv = converter("hsv")

// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
export function parseColor(input) {
    const text = input.trim()
    const color = parse(/^[0-9a-f]{6}$/i.test(text) ? "#" + text : text)

    return color ? toOklch(color) : null
}

export function toHex(color) {
    return formatHex(clampChroma({ mode: "oklch", ...color }, "oklch"))
}

export function toLch(hex) {
    const { l, c, h = 0 } = toOklch(hex)

    return { l, c, h }
}

export function hexToHsv(hex) {
    const { h = 0, s, v } = toHsv(hex)

    return { h, s, v }
}

export function hsvToHex({ h, s, v }) {
    return formatHex({ mode: "hsv", h, s, v })
}

export function hexToRgb(hex) {
    const number = parseInt(hex.slice(1), 16)

    return { r: number >> 16, g: (number >> 8) & 255, b: number & 255 }
}

export function rgbToHex({ r, g, b }) {
    return "#" + [r, g, b].map(channel => channel.toString(16).padStart(2, "0")).join("")
}

export function isInGamut(lch) {
    return displayable({ mode: "oklch", ...lch })
}

export function randomColor() {
    return clampChroma({ mode: "oklch", l: 0.5 + Math.random() * 0.25, c: 0.08 + Math.random() * 0.14, h: Math.random() * 360 }, "oklch")
}

export function getFormats(hex) {
    const { l, c, h } = toLch(hex)
    const hsl = toHsl(hex)

    return [
        { label: "HEX", value: hex },
        { label: "RGB", value: formatRgb(hex) },
        { label: "HSL", value: `hsl(${Math.round(hsl.h ?? 0)} ${Math.round(hsl.s * 100)}% ${Math.round(hsl.l * 100)}%)` },
        { label: "OKLCH", value: `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(3)} ${h.toFixed(1)})` },
    ]
}

export function getContrast(hex, other) {
    return wcagContrast(hex, other)
}

export function getRating(ratio) {
    if (ratio >= 7) return "AAA"
    if (ratio >= 4.5) return "AA"
    if (ratio >= 3) return "AA Large"

    return "Fail"
}

export function getReadable(hex) {
    return getContrast(hex, "#ffffff") >= getContrast(hex, "#111111") ? "#ffffff" : "#111111"
}

