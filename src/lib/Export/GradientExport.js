// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
import { SPACES, buildGradient, sortStops } from "../Color/Gradient.js"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
export const GRADIENT_FORMATS = [
    { id: "css", label: "CSS", extension: "css" },
    { id: "tailwind", label: "Tailwind", extension: "txt" },
    { id: "json", label: "JSON", extension: "json" }
]

// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
export function buildGradientExport(format, config) {
    const plain = buildGradient(config, false)
    const modern = buildGradient(config, true)

    if (format === "tailwind") return `bg-[${modern.replaceAll(" ", "_")}]`

    if (format === "json") {
        const stops = sortStops(config.stops).map(({ color, position }) => ({ color, position: Math.round(position * 10) / 10 }))
        const data = { type: config.type, space: config.space }

        if (config.type === "linear") data.angle = config.angle
        if (config.type === "radial") Object.assign(data, { shape: config.shape, x: config.x, y: config.y })
        if (config.type === "conic") Object.assign(data, { from: config.from, x: config.x, y: config.y })
        if (SPACES.find(item => item.id === config.space).polar) data.hue = config.hue

        return JSON.stringify({ ...data, stops, css: modern }, null, 4)
    }

    const lines = [".gradient {", `    background: ${plain};`]

    if (modern !== plain) lines.push(`    background: ${modern};`)

    lines.push("}")

    return lines.join("\n")
}
