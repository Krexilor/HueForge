// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { toHex, toLch, rotateHsl } from "./Convert.js"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
export const ROLES = ["primary", "secondary", "accent", "highlight"]

export const PROPORTIONS = { 2: [70, 30], 3: [60, 30, 10], 4: [50, 25, 15, 10] }

export const TYPES = [
    { id: "complementary", label: "Complementary", description: "Opposite hues. Maximum contrast and energy.", hasSpread: false, offsets: () => [{ dh: 180 }] },
    { id: "analogous", label: "Analogous", description: "Neighbors on the wheel. Calm and cohesive.", hasSpread: true, offsets: spread => [{ dh: -spread }, { dh: spread }] },
    { id: "triadic", label: "Triadic", description: "Three evenly spaced hues. Balanced and lively.", hasSpread: false, offsets: () => [{ dh: 120 }, { dh: 240 }] },
    { id: "split", label: "Split complementary", description: "The complement softened into two neighbors. Contrast with less tension.", hasSpread: true, offsets: spread => [{ dh: 180 - spread }, { dh: 180 + spread }] },
    { id: "tetradic", label: "Tetradic", description: "Four hues in a square. Rich, so let one color lead.", hasSpread: false, offsets: () => [{ dh: 90 }, { dh: 180 }, { dh: 270 }] },
    { id: "monochromatic", label: "Monochromatic", description: "One hue at different lightness levels. Safe and refined.", hasSpread: false, offsets: () => [{ dl: -0.22 }, { dl: 0.18 }, { dl: 0.3 }] },
]

// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
export function buildHarmony(hex, typeId, spread, even) {
    const type = TYPES.find(item => item.id === typeId)
    const base = toLch(hex)

    const others = type.offsets(spread).map(({ dh = 0, dl = 0 }) => {
        if (dl) {
            const l = Math.min(0.97, Math.max(0.12, base.l + dl))

            return toHex({ l, c: base.c * (1 - Math.abs(dl)), h: base.h })
        }

        return even ? toHex({ l: base.l, c: base.c, h: (base.h + dh + 360) % 360 }) : rotateHsl(hex, dh)
    })

    return [hex, ...others]
}
