// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
export const VISION_FORMATS = [
    { id: "markdown", label: "Markdown", extension: "md" },
    { id: "csv", label: "CSV", extension: "csv" },
    { id: "json", label: "JSON", extension: "json" }
]

// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
export function buildVisionReport(format, report) {
    const { palette, severity, conditions } = report

    if (format === "csv") {
        const header = ["original", ...conditions.map(item => item.id)].join(",")
        const rows = palette.map((color, index) => [color, ...conditions.map(item => item.colors[index])].join(","))

        return [header, ...rows].join("\n")
    }

    if (format === "json") {
        return JSON.stringify({
            severity,
            palette,
            conditions: Object.fromEntries(conditions.map(item => [item.id, { colors: item.colors, hardToTellApart: item.issues }])),
        }, null, 4)
    }

    const lines = [
        "# Color vision report",
        "",
        `Severity: ${severity}%`,
        "",
        `| Original | ${conditions.map(item => item.label).join(" | ")} |`,
        `| --- | ${conditions.map(() => "---").join(" | ")} |`
    ]

    palette.forEach((color, index) => {
        lines.push(`| ${color} | ${conditions.map(item => item.colors[index]).join(" | ")} |`)
    })

    lines.push("", "## Pairs that become hard to tell apart", "")

    conditions.forEach(item => {
        lines.push(item.issues.length
            ? `- **${item.label}:** ${item.issues.map(pair => `${pair[0]} and ${pair[1]}`).join(", ")}`
            : `- **${item.label}:** none`)
    })

    return lines.join("\n")
}
