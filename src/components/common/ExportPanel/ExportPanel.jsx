// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { useState } from "react"
import { Check, Copy, Download } from "lucide-react"

// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
import { FORMATS, buildTokens, downloadText } from "../../../lib/Export/Tokens.js"
import useCopy from "../../../hooks/useCopy.js"

// STYLES ------------------------------------------------------------------------------------------------------------------------------------------|
import styles from "./ExportPanel.module.css"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
const HEX_PATTERN = /(#[0-9a-f]{6})/gi

function renderLine(line) {
    return line.split(HEX_PATTERN).map((part, index) => (
        /^#[0-9a-f]{6}$/i.test(part)
            ? <span key = {index} className = {styles.hex}><i className = {styles.dot} style = {{ background: part }} />{part}</span>
            : part
    ))
}

// EXPORT PANEL ------------------------------------------------------------------------------------------------------------------------------------|
export default function ExportPanel({ groups, filename = "hueforge-colors" }) {
    const [formatId, setFormatId] = useState("css")
    const { copied, copy } = useCopy()

    const format = FORMATS.find(item => item.id === formatId)
    const text = buildTokens(formatId, groups)
    const file = `${filename}.${format.extension}`
    const count = (text.match(HEX_PATTERN) || []).length

    return (
        <section className = {styles.panel}>
            <div className = {styles.head}>
                <h2 className = {styles.heading}>Export</h2>

                <div className = {styles.actions}>
                    <button className = {styles.button} onClick = {() => copy(text, "export")}>
                        {copied === "export" ? <Check aria-hidden = "true" /> : <Copy aria-hidden = "true" />}
                        {copied === "export" ? "Copied" : "Copy"}
                    </button>

                    <button className = {`${styles.button} ${styles.solid}`} onClick = {() => downloadText(file, text)}>
                        <Download aria-hidden = "true" />
                        Download
                    </button>
                </div>
            </div>

            <div className = {styles.tabs} role = "group" aria-label = "Export format">
                {FORMATS.map(item => (
                    <button key = {item.id} className = {styles.tab} aria-pressed = {formatId === item.id} onClick = {() => setFormatId(item.id)}>
                        {item.label}
                    </button>
                ))}
            </div>

            <div className = {styles.editor}>
                <div className = {styles.bar}>
                    <span>{file}</span>
                    <span>{count} colors</span>
                </div>

                <pre className = {styles.code}>
                    <code>
                        {text.split("\n").map((line, index) => (
                            <span key = {index} className = {styles.line}>{renderLine(line) || " "}</span>
                        ))}
                    </code>
                </pre>
            </div>
        </section>
    )
}
