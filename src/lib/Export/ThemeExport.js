// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
import { variables } from "../Color/Theme.js"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
export const THEME_FORMATS = [
    { id: "css", label: "CSS", extension: "css" },
    { id: "tailwind", label: "Tailwind v4", extension: "css" },
    { id: "json", label: "JSON", extension: "json" }
]

// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
function block(selector, entries, prefix = "") {
    return [`${selector} {`, ...entries.map(([name, value]) => `    --${prefix}${name}: ${value};`), "}"].join("\n")
}

function indent(text) {
    return text.split("\n").map(line => `    ${line}`).join("\n")
}

function scaleEntries(scales) {
    return scales.flatMap(group => group.shades.map(({ step, hex }) => [`${group.name}-${step}`, hex]))
}

function tokens(entries) {
    return Object.fromEntries(entries.map(([name, value]) => [name, { $value: value, $type: "color" }]))
}

export function buildThemeExport(format, data) {
    const extra = data.scales ? scaleEntries(data.scales) : []
    const light = [...variables(data.light), ...extra]
    const dark = variables(data.dark)

    if (format === "tailwind") {
        return `${block("@theme", light, "color-")}\n\n${block('[data-theme="dark"]', dark, "color-")}`
    }

    if (format === "json") {
        const result = { light: tokens(variables(data.light)), dark: tokens(variables(data.dark)) }

        if (data.scales) {
            result.scales = Object.fromEntries(data.scales.map(group => [
                group.name,
                Object.fromEntries(group.shades.map(({ step, hex }) => [step, { $value: hex, $type: "color" }])),
            ]))
        }

        return JSON.stringify(result, null, 4)
    }

    return [
        block(":root", light),
        block('[data-theme="dark"]', dark),
        `@media (prefers-color-scheme: dark) {\n${indent(block(':root:not([data-theme="light"])', dark))}\n}`,
    ].join("\n\n")
}
