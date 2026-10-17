// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
export const REPORT_FORMATS = [
    { id: "markdown", label: "Markdown", extension: "md" },
    { id: "csv", label: "CSV", extension: "csv" },
    { id: "json", label: "JSON", extension: "json" },
]

// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
function mark(value) {
    return value ? "Pass" : "Fail"
}

export function buildReport(format, pairs) {
    if (format === "csv") {
        const header = "text,background,ratio,apca,normal_aa,normal_aaa,large_aa,large_aaa,ui"

        const rows = pairs.map(pair => [
            pair.text,
            pair.background,
            pair.ratio.toFixed(2),
            pair.apca.toFixed(1),
            ...Object.values(pair.wcag).map(mark),
        ].join(","))

        return [header, ...rows].join("\n")
    }

    if (format === "json") {
        return JSON.stringify(pairs.map(pair => ({
            text: pair.text,
            background: pair.background,
            ratio: Number(pair.ratio.toFixed(2)),
            apca: Number(pair.apca.toFixed(1)),
            wcag: pair.wcag,
        })), null, 4)
    }

    const lines = [
        "# Contrast report",
        "",
        "| Text | Background | Ratio | APCA Lc | Normal AA | Normal AAA | Large AA | Large AAA | UI |",
        "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ]

    pairs.forEach(pair => {
        lines.push(`| ${pair.text} | ${pair.background} | ${pair.ratio.toFixed(2)}:1 | ${pair.apca.toFixed(1)} | ${Object.values(pair.wcag).map(mark).join(" | ")} |`)
    })

    return lines.join("\n")
}
