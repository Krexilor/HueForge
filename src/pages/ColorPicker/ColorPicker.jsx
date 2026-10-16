// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { useState } from "react"
import { Link } from "react-router"
import { ArrowRight, Check, Copy, Pipette, Shuffle } from "lucide-react"

// COMPONENTS --------------------------------------------------------------------------------------------------------------------------------------|
import ColorSwatchPicker from "../../components/common/ColorSwatchPicker/ColorSwatchPicker.jsx"

// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
import { parseColor, isInGamut, randomColor, getFormats, getContrast, getRating, getReadable } from "../../lib/Color/Convert.js"
import { colorLink } from "../../lib/Color/Links.js"
import useSharedColor from "../../hooks/useSharedColor.js"
import useCopy from "../../hooks/useCopy.js"

// STYLES ------------------------------------------------------------------------------------------------------------------------------------------|
import styles from "./ColorPicker.module.css"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
const SLIDERS = [
    { id: "l", label: "Lightness", max: 1, step: 0.001, format: value => `${(value * 100).toFixed(1)}%` },
    { id: "c", label: "Chroma", max: 0.4, step: 0.001, format: value => value.toFixed(3) },
    { id: "h", label: "Hue", max: 360, step: 0.5, format: value => `${value.toFixed(1)}°` },
]

const CONTRAST_TARGETS = [
    { label: "White text", value: "#ffffff" },
    { label: "Black text", value: "#000000" },
]

// COLOR PICKER -------------------------------------------------------------------------------------------------------------------------------------|
export default function ColorPicker() {
    const { lch, setLch, hex } = useSharedColor()
    const [draft, setDraft] = useState(null)
    const { copied, copy } = useCopy()

    const readable = getReadable(hex)
    const formats = getFormats(hex)
    const inGamut = isInGamut(lch)
    const invalid = draft !== null && !parseColor(draft)
    const canUseEyeDropper = "EyeDropper" in window

    function apply(color) {
        const { l, c, h = 0 } = color

        setLch({ l, c, h })
    }

    function handleText(value) {
        const color = parseColor(value)

        setDraft(value)

        if (color) apply(color)
    }

    async function pickFromScreen() {
        try {
            const result = await new window.EyeDropper().open()

            apply(parseColor(result.sRGBHex))
        } catch {
            return
        }
    }

    return (
        <div className = {styles.page}>
            <header>
                <h1 className = {styles.title}>Color Picker</h1>
                <p className = {styles.subtitle}>Pick a base color, then copy it in any format. Paste hex, rgb, hsl, oklch or a color name.</p>
            </header>

            <div className = {styles.grid}>
                <section className = {styles.card}>
                    <div className = {styles.preview} style = {{ background: hex, color: readable }}>
                        <span className = {styles.previewHex}>{hex}</span>
                    </div>

                    <div className = {styles.inputs}>
                        <ColorSwatchPicker value = {hex} onChange = {next => apply(parseColor(next))} />

                        <input
                            className = {`${styles.text} ${invalid ? styles.invalid : ""}`}
                            type = "text"
                            value = {draft ?? hex}
                            aria-label = "Color value"
                            aria-invalid = {invalid}
                            spellCheck = "false"
                            onChange = {event => handleText(event.target.value)}
                            onBlur = {() => setDraft(null)}
                        />
                    </div>

                    {invalid && <p className = {styles.error}>That doesn't look like a color. Try hex, rgb(), hsl(), oklch() or a name.</p>}

                    <div className = {styles.actions}>
                        {canUseEyeDropper && (
                            <button className = {styles.button} onClick = {pickFromScreen}>
                                <Pipette className = {styles.buttonIcon} aria-hidden = "true" />
                                Eyedropper
                            </button>
                        )}

                        <button className = {styles.button} onClick = {() => apply(randomColor())}>
                            <Shuffle className = {styles.buttonIcon} aria-hidden = "true" />
                            Random
                        </button>

                        <Link className = {`${styles.button} ${styles.solid}`} to = {colorLink("/shade-finder", hex)}>
                            Generate shades
                            <ArrowRight className = {styles.buttonIcon} aria-hidden = "true" />
                        </Link>
                    </div>
                </section>

                <section className = {styles.card}>
                    <h2 className = {styles.heading}>Fine tune (OKLCH)</h2>

                    {SLIDERS.map(({ id, label, max, step, format }) => (
                        <div key = {id} className = {styles.slider}>
                            <label className = {styles.sliderLabel} htmlFor = {`slider-${id}`}>
                                <span>{label}</span>
                                <span>{format(lch[id])}</span>
                            </label>

                            <input
                                id = {`slider-${id}`}
                                type = "range"
                                min = {0}
                                max = {max}
                                step = {step}
                                value = {lch[id]}
                                onChange = {event => setLch({ ...lch, [id]: Number(event.target.value) })}
                            />
                        </div>
                    ))}

                    {!inGamut && <p className = {styles.warning}>Outside the sRGB gamut. Showing the nearest displayable color.</p>}

                    <p className = {styles.hint}>OKLCH keeps perceived lightness steady as you change hue, which is why it works well for shade scales.</p>
                </section>
            </div>

            <div className = {styles.grid}>
                <section className = {styles.card}>
                    <h2 className = {styles.heading}>Copy as</h2>

                    <ul className = {styles.formats}>
                        {formats.map(({ label, value }) => (
                            <li key = {label} className = {styles.format}>
                                <span className = {styles.formatLabel}>{label}</span>
                                <code className = {styles.formatValue}>{value}</code>

                                <button className = {styles.copy} aria-label = {`Copy ${label}`} onClick = {() => copy(value, label)}>
                                    {copied === label ? <Check aria-hidden = "true" /> : <Copy aria-hidden = "true" />}
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className = {styles.card}>
                    <h2 className = {styles.heading}>Text contrast</h2>

                    <ul className = {styles.formats}>
                        {CONTRAST_TARGETS.map(({ label, value }) => {
                            const ratio = getContrast(hex, value)
                            const rating = getRating(ratio)

                            return (
                                <li key = {label} className = {styles.contrast}>
                                    <span className = {styles.sample} style = {{ background: hex, color: value }}>Aa</span>
                                    <span className = {styles.formatLabel}>{label}</span>
                                    <span className = {styles.ratio}>{ratio.toFixed(2)}:1</span>
                                    <span className = {`${styles.badge} ${rating === "Fail" ? styles.fail : styles.pass}`}>{rating}</span>
                                </li>
                            )
                        })}
                    </ul>
                </section>
            </div>
        </div>
    )
}
