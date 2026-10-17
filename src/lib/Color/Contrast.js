// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { toHex, toLch, getContrast, hexToRgb } from "./Convert.js"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
export const WCAG_RULES = [
    { id: "normalAA", label: "Normal text", level: "AA", min: 4.5 },
    { id: "normalAAA", label: "Normal text", level: "AAA", min: 7 },
    { id: "largeAA", label: "Large text", level: "AA", min: 3 },
    { id: "largeAAA", label: "Large text", level: "AAA", min: 4.5 },
    { id: "ui", label: "UI components", level: "AA", min: 3 },
]

const APCA_LEVELS = [
    { min: 90, label: "Fluent reading", detail: "Body text from 14px, regular weight or heavier." },
    { min: 75, label: "Body text", detail: "18px regular, or 14px bold, and up." },
    { min: 60, label: "Content text", detail: "24px regular, or 16px bold, and up." },
    { min: 45, label: "Large text", detail: "36px regular, or 24px bold, and up." },
    { min: 30, label: "Spot text only", detail: "Placeholders, disabled text or very large display text." },
    { min: 15, label: "Non-text only", detail: "Decorative elements. Too faint for reading." },
]

const SUGGESTION_TARGETS = [3, 4.5, 7]
const SUGGESTION_SIDES = ["text", "background"]

// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
function screenLuminance(hex) {
    const { r, g, b } = hexToRgb(hex)
    const y = 0.2126729 * Math.pow(r / 255, 2.4) + 0.7151522 * Math.pow(g / 255, 2.4) + 0.072175 * Math.pow(b / 255, 2.4)

    return y < 0.022 ? y + Math.pow(0.022 - y, 1.414) : y
}

export function apca(text, background) {
    const yText = screenLuminance(text)
    const yBackground = screenLuminance(background)

    if (Math.abs(yBackground - yText) < 0.0005) return 0

    if (yBackground > yText) {
        const value = (Math.pow(yBackground, 0.56) - Math.pow(yText, 0.57)) * 1.14

        return value < 0.1 ? 0 : (value - 0.027) * 100
    }

    const value = (Math.pow(yBackground, 0.65) - Math.pow(yText, 0.62)) * 1.14

    return value > -0.1 ? 0 : (value + 0.027) * 100
}

export function describePair(text, background) {
    const ratio = getContrast(text, background)
    const wcag = Object.fromEntries(WCAG_RULES.map(rule => [rule.id, ratio >= rule.min]))

    return { text, background, ratio, apca: Math.abs(apca(text, background)), wcag }
}

export function apcaLevel(lc) {
    return APCA_LEVELS.find(level => lc >= level.min) ?? { label: "Not readable", detail: "Too faint to use for text." }
}

export function requiredLc(size, weight) {
    const steps = weight >= 700
        ? [[24, 45], [16, 60], [14, 75]]
        : [[36, 45], [24, 60], [18, 75], [14, 90]]

    const match = steps.find(([minimum]) => size >= minimum)

    return match ? match[1] : 100
}

function nudge(color, other, target, direction) {
    for (let step = 1; step <= 200; step++) {
        const l = color.l + direction * step * 0.005

        if (l < 0 || l > 1) return null

        const hex = toHex({ l, c: color.c, h: color.h })

        if (getContrast(hex, other) >= target) return { hex, distance: step }
    }

    return null
}

export function fixColor(hex, other, target) {
    if (getContrast(hex, other) >= target) return { hex, distance: 0 }

    const color = toLch(hex)
    const options = [nudge(color, other, target, 1), nudge(color, other, target, -1)].filter(Boolean)

    return options.sort((a, b) => a.distance - b.distance)[0] ?? null
}

export function buildSuggestions(text, background) {
    const current = getContrast(text, background)
    const seen = new Set()
    const results = []

    for (const target of SUGGESTION_TARGETS) {
        if (target <= current) continue

        for (const side of SUGGESTION_SIDES) {
            const fixed = side === "text" ? fixColor(text, background, target) : fixColor(background, text, target)

            if (!fixed) continue

            const key = `${side}:${fixed.hex}`

            if (seen.has(key)) continue

            seen.add(key)

            results.push({
                side,
                target,
                hex: fixed.hex,
                ratio: side === "text" ? getContrast(fixed.hex, background) : getContrast(text, fixed.hex),
            })
        }
    }

    return results
}
