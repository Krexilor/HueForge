// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { converter, formatHex } from "culori"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
export const GRADIENT_TYPES = [
    { id: "linear", label: "Linear" },
    { id: "radial", label: "Radial" },
    { id: "conic", label: "Conic" }
]

export const SPACES = [
    { id: "srgb", label: "sRGB", polar: false, description: "The browser default. Colors can turn gray or muddy halfway between two very different hues." },
    { id: "oklab", label: "OKLab", polar: false, description: "Blends lightness and color evenly, so the middle stays clean and keeps its brightness." },
    { id: "oklch", label: "OKLCH", polar: true, description: "Blends through hues like a color wheel, so blue to yellow passes through green instead of gray." },
    { id: "hsl", label: "HSL", polar: true, description: "Blends through hues too, but brightness can jump around because HSL is not perceptual." }
]

export const DEFAULT_CONFIG = {
    type: "linear",
    angle: 135,
    shape: "circle",
    x: 50,
    y: 50,
    from: 0,
    space: "oklch",
    hue: "shorter",
    stops: [
        { id: "start", color: "#2f6fed", position: 0 },
        { id: "end", color: "#f5b83d", position: 100 }
    ]
}

const SHAPES = ["circle", "ellipse"]
const HEX_PATTERN = /^[0-9a-f]{6}$/i
const toOklab = converter("oklab")

// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
export function makeId() {
    return Math.random().toString(36).slice(2, 8)
}

export function sortStops(stops) {
    return [...stops].sort((a, b) => a.position - b.position)
}

export function spreadStops(colors) {
    return colors.map((color, index) => ({
        id: makeId(),
        color,
        position: Math.round((index / (colors.length - 1)) * 100)
    }))
}

export function widestGap(stops) {
    const points = [0, ...sortStops(stops).map(stop => stop.position), 100]
    let best = { size: -1, middle: 50 }

    for (let index = 1; index < points.length; index++) {
        const size = points[index] - points[index - 1]

        if (size > best.size) best = { size, middle: Math.round((points[index] + points[index - 1]) / 2) }
    }

    return best.middle
}

export function colorAt(stops, position) {
    const sorted = sortStops(stops)
    const before = [...sorted].reverse().find(stop => stop.position <= position) ?? sorted[0]
    const after = sorted.find(stop => stop.position >= position) ?? sorted[sorted.length - 1]

    if (before === after || after.position === before.position) return before.color

    const t = (position - before.position) / (after.position - before.position)
    const from = toOklab(before.color)
    const to = toOklab(after.color)

    return formatHex({
        mode: "oklab",
        l: from.l + (to.l - from.l) * t,
        a: from.a + (to.a - from.a) * t,
        b: from.b + (to.b - from.b) * t
    })
}

function stopList(stops) {
    return sortStops(stops).map(stop => `${stop.color} ${Math.round(stop.position * 10) / 10}%`).join(", ")
}

function interpolation(config, enabled) {
    if (!enabled || config.space === "srgb") return ""

    const space = SPACES.find(item => item.id === config.space)

    return `in ${config.space}${space.polar && config.hue === "longer" ? " longer hue" : ""}`
}

export function buildGradient(config, enabled = true) {
    const mode = interpolation(config, enabled)
    const list = stopList(config.stops)
    const join = parts => parts.filter(Boolean).join(" ")

    if (config.type === "radial") {
        return `radial-gradient(${join([config.shape, "at", `${config.x}% ${config.y}%`, mode])}, ${list})`
    }

    if (config.type === "conic") {
        return `conic-gradient(${join(["from", `${config.from}deg`, "at", `${config.x}% ${config.y}%`, mode])}, ${list})`
    }

    return `linear-gradient(${join([`${config.angle}deg`, mode])}, ${list})`
}

export function encodeConfig(config) {
    return {
        gt: config.type,
        ga: config.angle,
        gr: config.shape,
        gx: config.x,
        gy: config.y,
        gf: config.from,
        gs: config.space,
        gh: config.hue,
        gp: sortStops(config.stops).map(stop => `${stop.color.slice(1)}:${Math.round(stop.position)}`).join("-")
    }
}

function number(value, min, max, fallback) {
    const parsed = Number(value)

    return value !== null && value !== "" && parsed >= min && parsed <= max ? parsed : fallback
}

export function decodeConfig(params, current) {
    const list = params.get("gp")

    if (!list) return null

    const stops = list
        .split("-")
        .map(part => part.split(":"))
        .filter(([color, position]) => HEX_PATTERN.test(color) && position !== undefined && Number(position) >= 0 && Number(position) <= 100)
        .map(([color, position]) => ({ id: makeId(), color: "#" + color.toLowerCase(), position: Number(position) }))

    if (stops.length < 2) return null

    const type = params.get("gt")
    const shape = params.get("gr")
    const space = params.get("gs")
    const hue = params.get("gh")

    return {
        ...current,
        type: GRADIENT_TYPES.some(item => item.id === type) ? type : current.type,
        angle: number(params.get("ga"), 0, 360, current.angle),
        shape: SHAPES.includes(shape) ? shape : current.shape,
        x: number(params.get("gx"), 0, 100, current.x),
        y: number(params.get("gy"), 0, 100, current.y),
        from: number(params.get("gf"), 0, 360, current.from),
        space: SPACES.some(item => item.id === space) ? space : current.space,
        hue: hue === "longer" || hue === "shorter" ? hue : current.hue,
        stops
    }
}
