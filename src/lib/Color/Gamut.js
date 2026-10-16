// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
function toLinear(l, c, hue) {
    const angle = (hue * Math.PI) / 180
    const a = c * Math.cos(angle)
    const b = c * Math.sin(angle)

    const lp = Math.pow(l + 0.3963377774 * a + 0.2158037573 * b, 3)
    const mp = Math.pow(l - 0.1055613458 * a - 0.0638541728 * b, 3)
    const sp = Math.pow(l - 0.0894841775 * a - 1.291485548 * b, 3)

    return [
        4.0767416621 * lp - 3.3077115913 * mp + 0.2309699292 * sp,
        -1.2684380046 * lp + 2.6097574011 * mp - 0.3413193965 * sp,
        -0.0041960863 * lp - 0.7034186147 * mp + 1.707614701 * sp,
    ]
}

function encode(value) {
    const x = Math.min(1, Math.max(0, value))

    return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055)
}

function fits(l, c, hue) {
    return toLinear(l, c, hue).every(channel => channel >= -0.0005 && channel <= 1.0005)
}

export function maxChroma(l, hue) {
    if (l <= 0 || l >= 1) return 0

    let low = 0
    let high = 0.4

    for (let step = 0; step < 14; step++) {
        const middle = (low + high) / 2

        if (fits(l, middle, hue)) low = middle
        else high = middle
    }

    return low
}

export function oklchToRgb(l, c, hue) {
    return toLinear(l, c, hue).map(encode)
}
