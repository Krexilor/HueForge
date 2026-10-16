// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
export const FORMATS = [
    { id: "css", label: "CSS", extension: "css" },
    { id: "tailwind", label: "Tailwind v4", extension: "css" },
    { id: "scss", label: "SCSS", extension: "scss" },
    { id: "json", label: "JSON", extension: "json" },
]

// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
export function slug(name) {
    return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "color"
}

function tokenName(name, step) {
    return step === null ? name : `${name}-${step}`
}

export function buildTokens(format, groups) {
    const lines = template => groups.flatMap(group => {
        const name = slug(group.name)

        return group.shades
            ? group.shades.map(({ step, hex }) => template(tokenName(name, step), hex))
            : [template(tokenName(name, null), group.hex)]
    })

    if (format === "tailwind") {
        return `@theme {\n${lines((token, hex) => `    --color-${token}: ${hex};`).join("\n")}\n}`
    }

    if (format === "scss") {
        return lines((token, hex) => `$${token}: ${hex};`).join("\n")
    }

    if (format === "json") {
        const tokens = {}

        groups.forEach(group => {
            tokens[slug(group.name)] = group.shades
                ? Object.fromEntries(group.shades.map(({ step, hex }) => [step, { $value: hex, $type: "color" }]))
                : { $value: group.hex, $type: "color" }
        })

        return JSON.stringify(tokens, null, 4)
    }

    return `:root {\n${lines((token, hex) => `    --${token}: ${hex};`).join("\n")}\n}`
}

export function downloadText(filename, text) {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }))
    const link = document.createElement("a")

    link.href = url
    link.download = filename
    link.click()

    setTimeout(() => URL.revokeObjectURL(url), 0)
}
