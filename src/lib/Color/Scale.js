// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { toHex, toLch, isInGamut, getContrast } from "./Convert.js"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
export const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

export const DEFAULT_OPTIONS = { pin: 5, lightest: 0.97, darkest: 0.22, taper: 0.7, shift: 0, neutral: true }

// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
function mix(from, to, amount) {
    return from + (to - from) * amount
}

function lightnessAt(index, pin, baseL, top, bottom) {
    if (index <= pin) return mix(top, baseL, index / pin)

    return mix(baseL, bottom, (index - pin) / (STEPS.length - 1 - pin))
}

export function buildScale(hex, { pin, lightest, darkest, taper, shift }) {
    const { l: baseL, c: baseC, h: baseH } = toLch(hex)
    const top = Math.max(lightest, baseL)
    const bottom = Math.min(darkest, baseL)
    const reach = Math.max(pin, STEPS.length - 1 - pin)

    return STEPS.map((step, index) => {
        const distance = Math.abs(index - pin) / reach
        const color = {
            mode: "oklch",
            l: index === pin ? baseL : lightnessAt(index, pin, baseL, top, bottom),
            c: baseC * (1 - taper * Math.pow(distance, 1.5)),
            h: (baseH + shift * ((pin - index) / reach) + 360) % 360,
        }

        return { step, hex: toHex(color), clamped: !isInGamut(color) }
    })
}

export function buildNeutral(hex, lightest, darkest) {
    const { h } = toLch(hex)

    return STEPS.map((step, index) => {
        const color = { mode: "oklch", l: mix(lightest, darkest, index / (STEPS.length - 1)), c: 0.012, h }

        return { step, hex: toHex(color), clamped: false }
    })
}

export function findPassing(scale, background, target) {
    const indexes = scale.map((_, index) => index)
    const order = background === "#ffffff" ? indexes : indexes.reverse()

    return order.find(index => getContrast(scale[index].hex, background) >= target) ?? -1
}
