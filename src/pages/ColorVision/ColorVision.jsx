// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { useSearchParams } from "react-router"
import { ImagePlus, Plus, Trash2, X } from "lucide-react"
import { useEffect, useLayoutEffect, useMemo, useState } from "react"

// COMPONENTS --------------------------------------------------------------------------------------------------------------------------------------|
import Slider from "../../components/common/Slider/Slider.jsx"
import ExportPanel from "../../components/common/ExportPanel/ExportPanel.jsx"
import ShareButton from "../../components/common/ShareButton/ShareButton.jsx"
import ColorSwatchPicker from "../../components/common/ColorSwatchPicker/ColorSwatchPicker.jsx"

// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
import useCopy from "../../hooks/useCopy.js"
import { getReadable } from "../../lib/Color/Convert.js"
import { buildHarmony } from "../../lib/Color/Harmony.js"
import useSharedColor from "../../hooks/useSharedColor.js"
import useSessionState from "../../hooks/useSessionState.js"
import { DEFAULT_OPTIONS, buildScale } from "../../lib/Color/Scale.js"
import { TYPES, analyze, filterValues } from "../../lib/Color/Vision.js"
import { VISION_FORMATS, buildVisionReport } from "../../lib/Export/VisionReport.js"

// STYLES ------------------------------------------------------------------------------------------------------------------------------------------|
import styles from "./ColorVision.module.css"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
const MAX_COLORS = 8
const HEX_PATTERN = /^[0-9a-f]{6}$/i
const SCALE_INDEXES = [1, 3, 5, 7, 9]
const EXAMPLE = ["#e03e3e", "#2f9e44", "#2f6fed", "#f59f00", "#9c36b5", "#12b886"]
const HEIGHTS = [72, 58, 92, 46, 66, 82, 54, 70]

const STATUSES = [
    { label: "Success", color: "#2f9e44" },
    { label: "Warning", color: "#f59f00" },
    { label: "Error", color: "#e03e3e" }
]

const SOURCES = [
    { id: "sample", label: "Sample" },
    { id: "image", label: "My image" }
]

function Sample({ palette }) {
    return (
        <div className = {styles.sample}>
            <div className = {styles.chart} role = "img" aria-label = "Bar chart sample">
                {palette.map((color, index) => (
                    <span key = {index} className = {styles.bar} style = {{ height: `${HEIGHTS[index % HEIGHTS.length]}%`, background: color }} />
                ))}
            </div>

            <ul className = {styles.legend}>
                {palette.map((color, index) => (
                    <li key = {index} className = {styles.legendItem}>
                        <i className = {styles.legendDot} style = {{ background: color }} />
                        Series {index + 1}
                    </li>
                ))}
            </ul>

            <div className = {styles.statuses}>
                {STATUSES.map(item => (
                    <span key = {item.label} className = {styles.status} style = {{ background: item.color, color: getReadable(item.color) }}>{item.label}</span>
                ))}
            </div>
        </div>
    )
}

// COLOR VISION ------------------------------------------------------------------------------------------------------------------------------------|
export default function ColorVision() {
    const [searchParams] = useSearchParams()
    const shared = useSharedColor()
    const [palette, setPalette] = useSessionState("vision:palette", EXAMPLE)
    const [severity, setSeverity] = useSessionState("vision:severity", 100)
    const [typeId, setTypeId] = useSessionState("vision:type", "deuteranopia")
    const [source, setSource] = useSessionState("vision:source", "sample")
    const [harmonyType] = useSessionState("harmony:type", "analogous")
    const [harmonySpread] = useSessionState("harmony:spread", 30)
    const [harmonyEven] = useSessionState("harmony:even", true)
    const [adding, setAdding] = useState("#e8a33d")
    const [image, setImage] = useState(null)
    const { copied, copy } = useCopy()

    const query = searchParams.toString()
    const amount = severity / 100
    const type = TYPES.find(item => item.id === typeId)

    const analysis = useMemo(() => ({
        base: analyze(palette, null, 1),
        ...Object.fromEntries(TYPES.map(item => [item.id, analyze(palette, item.id, amount)])),
    }), [palette, amount])

    const rows = [
        { id: "normal", label: "Normal vision", note: "Original colors", colors: palette },
        ...TYPES.map(item => ({ id: item.id, label: item.label, note: item.short, colors: analysis[item.id].colors })),
    ]

    const issuesOf = id => analysis[id].risky.filter(pair => !pair.inherent)
    const problems = TYPES.filter(item => issuesOf(item.id).length > 0)

    const report = {
        severity,
        palette,
        conditions: TYPES.map(item => ({
            id: item.id,
            label: item.label,
            colors: analysis[item.id].colors,
            issues: issuesOf(item.id).map(pair => [palette[pair.a], palette[pair.b]]),
        }))
    }

    useLayoutEffect(() => {
        const paletteParam = searchParams.get("p")
        const typeParam = searchParams.get("t")
        const severityParam = searchParams.get("s")

        if (paletteParam) {
            const colors = paletteParam.split("-").filter(part => HEX_PATTERN.test(part)).map(part => "#" + part.toLowerCase())
            const unique = [...new Set(colors)].slice(0, MAX_COLORS)

            if (unique.length > 0) setPalette(unique)
        }

        if (TYPES.some(item => item.id === typeParam)) setTypeId(typeParam)

        if (severityParam !== null && Number(severityParam) >= 0 && Number(severityParam) <= 100) setSeverity(Number(severityParam))
    }, [query])

    useEffect(() => () => {
        if (image) URL.revokeObjectURL(image)
    }, [image])

    function addColors(colors, replace = false) {
        const next = replace ? [] : [...palette]

        colors.forEach(color => {
            if (!next.includes(color)) next.push(color)
        })

        setPalette(next.slice(0, MAX_COLORS))
    }

    function handleFile(event) {
        const file = event.target.files[0]

        event.target.value = ""

        if (file) setImage(URL.createObjectURL(file))
    }

    function renderBody(label) {
        if (source === "sample") return <Sample palette = {palette} />

        if (!image) return <p className = {styles.empty}>Choose an image to see it here.</p>

        return <img className = {styles.image} src = {image} alt = {`Your image with ${label}`} />
    }

    return (
        <div className = {styles.page}>
            <svg className = {styles.filters} width = "0" height = "0" aria-hidden = "true" focusable = "false">
                <defs>
                    <filter id = "vision-filter" colorInterpolationFilters = "linearRGB">
                        <feColorMatrix type = "matrix" values = {filterValues(typeId, amount)} />
                    </filter>
                </defs>
            </svg>

            <header className = {styles.header}>
                <div>
                    <h1 className = {styles.title}>Color Vision</h1>
                    <p className = {styles.subtitle}>See your palette the way people with color blindness do, and find the colors that blur together.</p>
                </div>

                <ShareButton
                    hex = {shared.hex}
                    title = "HueForge Color Vision"
                    params = {{ p: palette.map(color => color.slice(1)).join("-"), t: typeId, s: severity }}
                />
            </header>

            <section className = {styles.card}>
                <div className = {styles.head}>
                    <h2 className = {styles.heading}>Palette</h2>
                    <span className = {styles.hint}>{palette.length} of {MAX_COLORS} colors</span>
                </div>

                <div className = {styles.tools}>
                    <ColorSwatchPicker value = {adding} onChange = {setAdding} />

                    <button className = {styles.button} disabled = {palette.length >= MAX_COLORS} onClick = {() => addColors([adding])}>
                        <Plus className = {styles.buttonIcon} aria-hidden = "true" />
                        Add color
                    </button>

                    <button className = {styles.button} onClick = {() => addColors(EXAMPLE, true)}>Load example</button>

                    <button
                        className = {styles.button}
                        onClick = {() => addColors(buildScale(shared.hex, DEFAULT_OPTIONS).filter((_, index) => SCALE_INDEXES.includes(index)).map(shade => shade.hex), true)}
                    >
                        Load shade scale
                    </button>

                    <button className = {styles.button} onClick = {() => addColors(buildHarmony(shared.hex, harmonyType, harmonySpread, harmonyEven), true)}>
                        Load harmony palette
                    </button>

                    {palette.length > 0 && (
                        <button className = {styles.button} onClick = {() => setPalette([])}>
                            <Trash2 className = {styles.buttonIcon} aria-hidden = "true" />
                            Clear
                        </button>
                    )}
                </div>

                {palette.length > 0 && (
                    <ul className = {styles.colors}>
                        {palette.map(color => (
                            <li key = {color} className = {styles.colorChip}>
                                <span className = {styles.swatch} style = {{ background: color }} />
                                <code>{color}</code>

                                <button className = {styles.remove} aria-label = {`Remove ${color}`} onClick = {() => setPalette(palette.filter(item => item !== color))}>
                                    <X aria-hidden = "true" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className = {styles.card}>
                <div className = {styles.head}>
                    <h2 className = {styles.heading}>How it looks</h2>

                    <div className = {styles.severity}>
                        <Slider label = "Severity" value = {severity} min = {0} max = {100} step = {1} format = {value => `${value}%`} onChange = {setSeverity} />
                    </div>
                </div>

                {palette.length === 0 && <p className = {styles.hint}>Add some colors to compare them.</p>}

                {palette.length > 0 && (
                    <ul className = {styles.rows}>
                        {rows.map(row => (
                            <li key = {row.id} className = {styles.row}>
                                <div className = {styles.rowLabel}>
                                    <b>{row.label}</b>
                                    <span className = {styles.hint}>{row.note}</span>
                                </div>

                                <div className = {styles.tiles}>
                                    {row.colors.map((color, index) => {
                                        const key = `${row.id}-${index}`

                                        return (
                                            <button key = {key} className = {styles.tile} style = {{ background: color, color: getReadable(color) }} onClick = {() => copy(color, key)}>
                                                {copied === key ? "Copied" : color}
                                            </button>
                                        )
                                    })}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                <p className = {styles.hint}>100% simulates complete color blindness. Lower values simulate weaker forms, such as protanomaly and deuteranomaly. Tap a tile to copy its hex.</p>
            </section>

            <section className = {styles.card}>
                <div className = {styles.head}>
                    <h2 className = {styles.heading}>Palette check</h2>

                    {palette.length > 1 && (
                        <span className = {`${styles.badge} ${problems.length === 0 ? styles.pass : styles.fail}`}>
                            {TYPES.length - problems.length} of {TYPES.length} conditions hold up
                        </span>
                    )}
                </div>

                {palette.length < 2 && <p className = {styles.hint}>Add at least two colors to check which pairs become hard to tell apart.</p>}

                {palette.length > 1 && (
                    <>
                        <div className = {styles.checks}>
                            {TYPES.map(item => {
                                const issues = issuesOf(item.id)

                                return (
                                    <article key = {item.id} className = {styles.check}>
                                        <div className = {styles.checkHead}>
                                            <b>{item.label}</b>
                                            <span className = {`${styles.badge} ${issues.length ? styles.fail : styles.pass}`}>{issues.length ? `${issues.length} to fix` : "Holds up"}</span>
                                        </div>

                                        {issues.length === 0 && <p className = {styles.hint}>Every pair stays easy to tell apart.</p>}

                                        <ul className = {styles.pairs}>
                                            {issues.map(pair => (
                                                <li key = {`${pair.a}-${pair.b}`} className = {styles.pair}>
                                                    <span className = {styles.duo}>
                                                        <i style = {{ background: analysis[item.id].colors[pair.a] }} />
                                                        <i style = {{ background: analysis[item.id].colors[pair.b] }} />
                                                    </span>

                                                    <code>{palette[pair.a]} + {palette[pair.b]}</code>
                                                </li>
                                            ))}
                                        </ul>
                                    </article>
                                )
                            })}
                        </div>

                        {analysis.base.risky.length > 0 && (
                            <div className = {styles.note}>
                                <b>Already similar with normal vision</b>

                                <ul className = {styles.pairs}>
                                    {analysis.base.risky.map(pair => (
                                        <li key = {`${pair.a}-${pair.b}`} className = {styles.pair}>
                                            <span className = {styles.duo}>
                                                <i style = {{ background: palette[pair.a] }} />
                                                <i style = {{ background: palette[pair.b] }} />
                                            </span>

                                            <code>{palette[pair.a]} + {palette[pair.b]}</code>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}

                <p className = {styles.hint}>Pairs that sit closer than 0.08 apart in OKLab are flagged. Treat it as a guide, and never rely on color alone: add labels, icons or patterns too.</p>
            </section>

            <section className = {styles.card}>
                <div className = {styles.head}>
                    <h2 className = {styles.heading}>Preview</h2>

                    {source === "image" && (
                        <label className = {styles.upload}>
                            <ImagePlus className = {styles.buttonIcon} aria-hidden = "true" />
                            {image ? "Change image" : "Choose image"}
                            <input type = "file" accept = "image/*" onChange = {handleFile} hidden />
                        </label>
                    )}
                </div>

                <div className = {styles.options}>
                    <div className = {styles.segments} role = "group" aria-label = "Preview with">
                        {SOURCES.map(item => (
                            <button key = {item.id} className = {styles.segment} aria-pressed = {source === item.id} onClick = {() => setSource(item.id)}>{item.label}</button>
                        ))}
                    </div>

                    <div className = {styles.segments} role = "group" aria-label = "Condition">
                        {TYPES.map(item => (
                            <button key = {item.id} className = {styles.segment} aria-pressed = {typeId === item.id} onClick = {() => setTypeId(item.id)}>{item.label}</button>
                        ))}
                    </div>
                </div>

                <div className = {styles.panes}>
                    <figure className = {styles.pane}>
                        <figcaption className = {styles.paneLabel}>Normal vision</figcaption>
                        <div className = {styles.canvas}>{renderBody("normal vision")}</div>
                    </figure>

                    <figure className = {styles.pane}>
                        <figcaption className = {styles.paneLabel}>{type.label}{severity < 100 ? ` at ${severity}%` : ""}</figcaption>
                        <div className = {styles.canvas} style = {{ filter: "url(#vision-filter)" }}>{renderBody(type.label.toLowerCase())}</div>
                    </figure>
                </div>

                <p className = {styles.hint}>{type.description} {type.note} Images are processed in your browser and never uploaded.</p>
            </section>

            <ExportPanel data = {report} formats = {VISION_FORMATS} build = {buildVisionReport} unit = "hex values" filename = "color-vision-report" />
        </div>
    )
}
