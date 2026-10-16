// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { useEffect, useRef, useState } from "react"

// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
import { hexToHsv, hsvToHex, hexToRgb, rgbToHex } from "../../../lib/Color/Convert.js"

// STYLES ------------------------------------------------------------------------------------------------------------------------------------------|
import styles from "./ColorSwatchPicker.module.css"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
const PRESETS = ["#2f6fed", "#e0566a", "#14a37f", "#e8a33d", "#8b5cf6", "#0f766e", "#f97316", "#64748b"]
const CHANNELS = ["r", "g", "b"]

function clamp(value) {
    return Math.min(1, Math.max(0, value))
}

// COLOR SWATCH PICKER -----------------------------------------------------------------------------------------------------------------------------|
export default function ColorSwatchPicker({ value, onChange }) {
    const [open, setOpen] = useState(false)
    const [hsv, setHsv] = useState(() => hexToHsv(value))
    const [rgbDraft, setRgbDraft] = useState({})
    const rootRef = useRef(null)
    const areaRef = useRef(null)

    const rgb = hexToRgb(value)

    useEffect(() => {
        if (hsvToHex(hsv) !== value) setHsv(hexToHsv(value))
    }, [value])

    useEffect(() => {
        if (!open) return

        function handlePointerDown(event) {
            if (!rootRef.current.contains(event.target)) setOpen(false)
        }

        function handleKeyDown(event) {
            if (event.key === "Escape") setOpen(false)
        }

        document.addEventListener("pointerdown", handlePointerDown)
        document.addEventListener("keydown", handleKeyDown)

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown)
            document.removeEventListener("keydown", handleKeyDown)
        }
    }, [open])

    function commit(next) {
        setHsv(next)
        onChange(hsvToHex(next))
    }

    function moveThumb(event) {
        const rect = areaRef.current.getBoundingClientRect()
        const s = clamp((event.clientX - rect.left) / rect.width)
        const v = 1 - clamp((event.clientY - rect.top) / rect.height)

        commit({ ...hsv, s, v })
    }

    function handlePointerDown(event) {
        event.currentTarget.setPointerCapture(event.pointerId)
        moveThumb(event)
    }

    function handlePointerMove(event) {
        if (event.buttons === 1) moveThumb(event)
    }

    function handleKeyDown(event) {
        const step = event.shiftKey ? 0.1 : 0.01
        const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }
        const move = moves[event.key]

        if (!move) return

        event.preventDefault()
        commit({ ...hsv, s: clamp(hsv.s + move[0]), v: clamp(hsv.v + move[1]) })
    }

    function handleRgb(channel, text) {
        if (text === "") {
            setRgbDraft({ ...rgbDraft, [channel]: "" })
            return
        }

        const next = Math.min(255, Math.max(0, Math.round(Number(text))))

        setRgbDraft({ ...rgbDraft, [channel]: String(next) })
        commit(hexToHsv(rgbToHex({ ...rgb, [channel]: next })))
    }

    return (
        <div className = {styles.picker} ref = {rootRef}>
            <button
                className = {styles.trigger}
                type = "button"
                style = {{ background: value }}
                aria-label = "Open color picker"
                aria-expanded = {open}
                onClick = {() => setOpen(!open)}
            />

            {open && (
                <div className = {styles.panel} role = "dialog" aria-label = "Color picker">
                    <div
                        className = {styles.area}
                        ref = {areaRef}
                        style = {{ "--hue": hsv.h }}
                        tabIndex = {0}
                        aria-label = "Saturation and brightness"
                        onPointerDown = {handlePointerDown}
                        onPointerMove = {handlePointerMove}
                        onKeyDown = {handleKeyDown}
                    >
                        <span className = {styles.thumb} style = {{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: value }} />
                    </div>

                    <input
                        className = {styles.hue}
                        type = "range"
                        min = {0}
                        max = {360}
                        step = {0.5}
                        value = {hsv.h}
                        style = {{ "--thumb": `hsl(${hsv.h} 100% 50%)` }}
                        aria-label = "Hue"
                        onChange = {event => commit({ ...hsv, h: Number(event.target.value) })}
                    />

                    <div className = {styles.rgb}>
                        {CHANNELS.map(channel => (
                            <label key = {channel} className = {styles.channel}>
                                <span>{channel.toUpperCase()}</span>

                                <input
                                    type = "number"
                                    inputMode = "numeric"
                                    min = {0}
                                    max = {255}
                                    value = {rgbDraft[channel] ?? rgb[channel]}
                                    onChange = {event => handleRgb(channel, event.target.value)}
                                    onBlur = {() => setRgbDraft({})}
                                />
                            </label>
                        ))}
                    </div>

                    <div className = {styles.presets}>
                        {PRESETS.map(color => (
                            <button
                                key = {color}
                                className = {styles.preset}
                                type = "button"
                                style = {{ background: color }}
                                aria-label = {`Use ${color}`}
                                onClick = {() => commit(hexToHsv(color))}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
