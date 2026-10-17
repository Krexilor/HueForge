// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { converter } from "culori"

// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
import { hexToRgb, rgbToHex } from "./Convert.js"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
export const THRESHOLD = 0.08

export const TYPES = [
    {
        id: "protanopia",
        label: "Protanopia",
        short: "Red-blind",
        description: "Red cones are missing. Reds look dark, and red, orange and green blur together.",
        note: "Affects about 1% of men."
    },
    {
        id: "deuteranopia",
        label: "Deuteranopia",
        short: "Green-blind",
        description: "Green cones are missing. Reds and greens blur together.",
        note: "Affects about 1% of men, and the milder form is far more common."
    },
    {
        id: "tritanopia",
        label: "Tritanopia",
        short: "Blue-yellow",
        description: "Blue cones are missing. Blues and greens blur together, and yellows and pinks look alike.",
        note: "Very rare."
    },
    {
        id: "achromatopsia",
        label: "Achromatopsia",
        short: "No color",
        description: "No color vision. Only differences in lightness are visible.",
        note: "Very rare."
    },
]

const MATRICES = {
    protanopia: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
    deuteranopia: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
    tritanopia: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.3039]],
    achromatopsia: [[0.2126, 0.7152, 0.0722], [0.2126, 0.7152, 0.0722], [0.2126, 0.7152, 0.0722]]
}

const IDENTITY = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]

const toOklab = converter("oklab")

// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
function decode(value) {
    const x = value / 255

    return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
}

function encode(value) {
    const x = Math.min(1, Math.max(0, value))

    return Math.round(255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055))
}

export function getMatrix(typeId, severity) {
    const target = MATRICES[typeId]

    return IDENTITY.map((row, i) => row.map((value, j) => value + (target[i][j] - value) * severity))
}

export function simulate(hex, typeId, severity = 1) {
    if (!typeId) return hex

    const { r, g, b } = hexToRgb(hex)
    const linear = [r, g, b].map(decode)
    const [nr, ng, nb] = getMatrix(typeId, severity).map(row => encode(row[0] * linear[0] + row[1] * linear[1] + row[2] * linear[2]))

    return rgbToHex({ r: nr, g: ng, b: nb })
}

export function filterValues(typeId, severity) {
    const rows = getMatrix(typeId, severity).map(row => `${row.map(value => value.toFixed(5)).join(" ")} 0 0`)

    return `${rows.join(" ")} 0 0 0 1 0`
}

export function distance(a, b) {
    const x = toOklab(a)
    const y = toOklab(b)

    return Math.hypot(x.l - y.l, x.a - y.a, x.b - y.b)
}

export function analyze(palette, typeId, severity) {
    const colors = palette.map(hex => simulate(hex, typeId, severity))
    const risky = []

    for (let a = 0; a < palette.length; a++) {
        for (let b = a + 1; b < palette.length; b++) {
            const original = distance(palette[a], palette[b])
            const simulated = distance(colors[a], colors[b])

            if (simulated < THRESHOLD) risky.push({ a, b, original, simulated, inherent: original < THRESHOLD })
        }
    }

    return { colors, risky }
}
