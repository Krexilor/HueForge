// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { Link } from "react-router"
import { useMemo, useState } from "react"
import { Check, Copy, Pipette, RotateCcw } from "lucide-react"

// COMPONENTS --------------------------------------------------------------------------------------------------------------------------------------|
import Slider from "../../components/common/Slider/Slider.jsx"
import Dropdown from "../../components/common/Dropdown/Dropdown.jsx"
import ExportPanel from "../../components/common/ExportPanel/ExportPanel.jsx"
import ShareButton from "../../components/common/ShareButton/ShareButton.jsx"
import ColorSwatchPicker from "../../components/common/ColorSwatchPicker/ColorSwatchPicker.jsx"

// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
import useCopy from "../../hooks/useCopy.js"
import { slug } from "../../lib/Export/Tokens.js"
import { colorLink } from "../../lib/Color/Links.js"
import useSharedColor from "../../hooks/useSharedColor.js"
import useSessionState from "../../hooks/useSessionState.js"
import { parseColor, toHex, getContrast, getRating, getReadable } from "../../lib/Color/Convert.js"
import { STEPS, DEFAULT_OPTIONS, buildScale, buildNeutral, findPassing } from "../../lib/Color/Scale.js"

// STYLES ------------------------------------------------------------------------------------------------------------------------------------------|
import styles from "./ShadeFinder.module.css"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
const TARGETS = [3, 4.5, 7]

const BACKGROUNDS = [
    { label: "White", value: "#ffffff" },
    { label: "Black", value: "#000000" },
]

const SLIDERS = [
    { id: "lightest", label: "Lightest shade", min: 0.9, max: 0.99, step: 0.005, format: value => `${(value * 100).toFixed(1)}%` },
    { id: "darkest", label: "Darkest shade", min: 0.1, max: 0.4, step: 0.005, format: value => `${(value * 100).toFixed(1)}%` },
    { id: "taper", label: "Edge chroma taper", min: 0, max: 1, step: 0.01, format: value => `${Math.round(value * 100)}%` },
    { id: "shift", label: "Hue shift", min: -30, max: 30, step: 1, format: value => `${value > 0 ? "+" : ""}${value}°` },
]

function Ratio({ hex, background, label }) {
    const ratio = getContrast(hex, background)
    const rating = getRating(ratio)

    return (
        <span className = {styles.ratio}>
            <span className = {styles.ratioLabel}>{label}</span>
            {ratio.toFixed(2)}
            <span className = {`${styles.badge} ${rating === "Fail" ? styles.fail : styles.pass}`}>{rating}</span>
        </span>
    )
}

// SHADE FINDER ------------------------------------------------------------------------------------------------------------------------------------|
export default function ShadeFinder() {
    const { hex, setHex } = useSharedColor()
    const [draft, setDraft] = useState(null)
    const [name, setName] = useSessionState("shade:name", "primary")
    const [options, setOptions] = useSessionState("shade:options", DEFAULT_OPTIONS)
    const [selected, setSelected] = useSessionState("shade:selected", 5)
    const [target, setTarget] = useSessionState("shade:target", 4.5)
    const [background, setBackground] = useSessionState("shade:background", "#ffffff")
    const { copied, copy } = useCopy()

    const scale = useMemo(() => buildScale(hex, options), [hex, options])
    const neutral = useMemo(() => buildNeutral(hex, options.lightest, options.darkest), [hex, options.lightest, options.darkest])
    const passing = findPassing(scale, background, target)
    const invalid = draft !== null && !parseColor(draft)
    const hasClamped = scale.some(shade => shade.clamped)
    const shade = scale[selected]
    const backgroundLabel = BACKGROUNDS.find(item => item.value === background).label.toLowerCase()
    const isDark = background === "#000000"
    const previewRatio = getContrast(shade.hex, background)
    const previewRating = getRating(previewRatio)

    const groups = [{ name, shades: scale }]

    if (options.neutral) groups.push({ name: "neutral", shades: neutral })

    function setOption(key, value) {
        setOptions({ ...options, [key]: value })
    }

    function handleText(value) {
        const color = parseColor(value)

        setDraft(value)

        if (color) {
            const { l, c, h = 0 } = color

            setHex(toHex({ l, c, h }))
        }
    }

    function reset() {
        setOptions(DEFAULT_OPTIONS)
        setName("primary")
    }

    return (
        <div className = {styles.page}>
            <header className = {styles.header}>
                <div>
                    <h1 className = {styles.title}>Shade Finder</h1>
                    <p className = {styles.subtitle}>Turn one color into a 50 to 950 scale with even lightness steps and contrast checks on every shade.</p>
                </div>

                <ShareButton hex = {hex} title = "HueForge Shade Finder" />
            </header>

            <section className = {styles.card}>
                <div className = {styles.fields}>
                    <div className = {styles.field}>
                        <span className = {styles.label}>Base color</span>

                        <div className = {styles.inputs}>
                            <ColorSwatchPicker value = {hex} onChange = {setHex} />

                            <input
                                className = {`${styles.text} ${invalid ? styles.invalid : ""}`}
                                type = "text"
                                value = {draft ?? hex}
                                aria-label = "Base color value"
                                aria-invalid = {invalid}
                                spellCheck = "false"
                                onChange = {event => handleText(event.target.value)}
                                onBlur = {() => setDraft(null)}
                            />
                        </div>
                    </div>

                    <div className = {styles.field}>
                        <span className = {styles.label}>Base sits at step</span>

                        <Dropdown
                            size = "lg"
                            label = "Base step"
                            value = {options.pin}
                            options = {STEPS.map((step, index) => ({ value: index, label: String(step) }))}
                            onChange = {value => setOption("pin", value)}
                        />
                    </div>

                    <label className = {styles.field}>
                        <span className = {styles.label}>Scale name</span>
                        <input className = {styles.text} type = "text" value = {name} spellCheck = "false" onChange = {event => setName(event.target.value)} />
                    </label>
                </div>

                {invalid && <p className = {styles.error}>That doesn't look like a color. Try hex, rgb(), hsl(), oklch() or a name.</p>}

                <div className = {styles.sliders}>
                    {SLIDERS.map(({ id, label, min, max, step, format }) => (
                        <Slider key = {id} label = {label} value = {options[id]} min = {min} max = {max} step = {step} format = {format} onChange = {value => setOption(id, value)} />
                    ))}
                </div>

                <div className = {styles.footer}>
                    <label className = {styles.toggle}>
                        <input type = "checkbox" checked = {options.neutral} onChange = {event => setOption("neutral", event.target.checked)} />
                        Include tinted neutral scale in export
                    </label>

                    <div className = {styles.actions}>
                        <Link className = {styles.button} to = {colorLink("/color-picker", hex)}>
                            <Pipette className = {styles.buttonIcon} aria-hidden = "true" />
                            Edit in Color Picker
                        </Link>

                        <button className = {styles.button} onClick = {reset}>
                            <RotateCcw className = {styles.buttonIcon} aria-hidden = "true" />
                            Reset settings
                        </button>
                    </div>
                </div>
            </section>

            <section className = {styles.card}>
                <div className = {styles.strip}>
                    {scale.map(({ step, hex: color }, index) => (
                        <button
                            key = {step}
                            className = {`${styles.chip} ${index === selected ? styles.chipSelected : ""}`}
                            style = {{ background: color, color: getReadable(color) }}
                            aria-label = {`Select shade ${step}`}
                            aria-pressed = {index === selected}
                            onClick = {() => setSelected(index)}
                        >
                            {step}
                        </button>
                    ))}
                </div>

                <ul className = {styles.list}>
                    {scale.map(({ step, hex: color, clamped }, index) => (
                        <li key = {step} className = {`${styles.row} ${index === selected ? styles.rowSelected : ""}`}>
                            <button className = {styles.swatch} style = {{ background: color }} aria-label = {`Select shade ${step}`} onClick = {() => setSelected(index)} />

                            <div className = {styles.info}>
                                <span className = {styles.step}>{step}</span>
                                <code className = {styles.hex}>{color}</code>

                                <span className = {styles.tags}>
                                    {index === options.pin && <span className = {`${styles.tag} ${styles.tagBase}`}>Base</span>}
                                    {index === passing && <span className = {`${styles.tag} ${styles.tagTarget}`}>{target}:1</span>}
                                    {clamped && <span className = {`${styles.tag} ${styles.tagAdjusted}`}>Adjusted</span>}
                                </span>
                            </div>

                            <div className = {styles.ratios}>
                                <Ratio hex = {color} background = "#ffffff" label = "White" />
                                <Ratio hex = {color} background = "#000000" label = "Black" />
                            </div>

                            <button className = {styles.copy} aria-label = {`Copy ${color}`} onClick = {() => copy(color)}>
                                {copied === color ? <Check aria-hidden = "true" /> : <Copy aria-hidden = "true" />}
                            </button>
                        </li>
                    ))}
                </ul>

                {hasClamped && <p className = {styles.hint}>Adjusted shades were pulled into the sRGB gamut, so their color is slightly less vivid than the curve asked for.</p>}
            </section>

            <div className = {styles.grid}>
                <section className = {styles.card}>
                    <h2 className = {styles.heading}>Contrast target</h2>

                    <div className = {styles.segments} role = "group" aria-label = "Target ratio">
                        {TARGETS.map(value => (
                            <button key = {value} className = {styles.segment} aria-pressed = {target === value} onClick = {() => setTarget(value)}>{value}:1</button>
                        ))}
                    </div>

                    <div className = {styles.segments} role = "group" aria-label = "Background">
                        {BACKGROUNDS.map(item => (
                            <button key = {item.value} className = {styles.segment} aria-pressed = {background === item.value} onClick = {() => setBackground(item.value)}>
                                On {item.label.toLowerCase()}
                            </button>
                        ))}
                    </div>

                    <p className = {styles.result}>
                        {passing === -1
                            ? `No shade reaches ${target}:1 on ${backgroundLabel}.`
                            : `Shade ${STEPS[passing]} (${scale[passing].hex}) is the first to reach ${target}:1 on ${backgroundLabel}.`}
                    </p>
                </section>

                <section className = {styles.card}>
                    <h2 className = {styles.heading}>Preview of shade {STEPS[selected]}</h2>

                    <div className = {styles.demo} style = {{ background }}>
                        <div className = {styles.demoRow}>
                            <button className = {styles.demoPrimary} style = {{ background: shade.hex, color: getReadable(shade.hex) }}>Primary action</button>
                            <button className = {styles.demoOutline} style = {{ borderColor: shade.hex, color: isDark ? scale[3].hex : scale[7].hex }}>Secondary</button>

                            <span className = {styles.demoTag} style = {{ background: isDark ? scale[9].hex : scale[1].hex, color: isDark ? scale[2].hex : scale[8].hex }}>
                                Tinted tag
                            </span>
                        </div>

                        <p className = {styles.demoText} style = {{ color: shade.hex }}>Text in shade {STEPS[selected]} on {backgroundLabel}</p>
                    </div>

                    <p className = {styles.hint}>
                        <span className = {`${styles.badge} ${previewRating === "Fail" ? styles.fail : styles.pass}`}>{previewRating}</span>
                        {" "}{previewRatio.toFixed(2)}:1 for this shade as text on {backgroundLabel}.
                    </p>
                </section>
            </div>

            <ExportPanel data = {groups} filename = {`${slug(name)}-scale`} />
        </div>
    )
}
