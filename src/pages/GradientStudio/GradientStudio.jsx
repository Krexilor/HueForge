// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { useSearchParams } from "react-router"
import { useLayoutEffect, useState } from "react"
import { ArrowLeftRight, ArrowUp, Plus, Trash2 } from "lucide-react"

// COMPONENTS --------------------------------------------------------------------------------------------------------------------------------------|
import Slider from "../../components/common/Slider/Slider.jsx"
import AngleDial from "../../components/common/AngleDial/AngleDial.jsx"
import ExportPanel from "../../components/common/ExportPanel/ExportPanel.jsx"
import ShareButton from "../../components/common/ShareButton/ShareButton.jsx"
import GradientBar from "../../components/common/GradientBar/GradientBar.jsx"
import ColorSwatchPicker from "../../components/common/ColorSwatchPicker/ColorSwatchPicker.jsx"

// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
import { buildHarmony } from "../../lib/Color/Harmony.js"
import useSharedColor from "../../hooks/useSharedColor.js"
import useSessionState from "../../hooks/useSessionState.js"
import { parseColor, toHex } from "../../lib/Color/Convert.js"
import { DEFAULT_OPTIONS, buildScale } from "../../lib/Color/Scale.js"
import { GRADIENT_FORMATS, buildGradientExport } from "../../lib/Export/GradientExport.js"
import { DEFAULT_CONFIG, GRADIENT_TYPES, SPACES, buildGradient, colorAt, decodeConfig, encodeConfig, makeId, sortStops, spreadStops, widestGap } from "../../lib/Color/Gradient.js"

// STYLES ------------------------------------------------------------------------------------------------------------------------------------------|
import styles from "./GradientStudio.module.css"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
const DIRECTIONS = [0, 45, 90, 135, 180, 225, 270, 315]
const SCALE_INDEXES = [1, 3, 5, 7, 9]
const SUPPORTS_SPACES = typeof CSS !== "undefined" && CSS.supports("background-image", "linear-gradient(in oklch, red, blue)")

const SHAPES = [
    { id: "circle", label: "Circle" },
    { id: "ellipse", label: "Ellipse" }
]

const HUES = [
    { id: "shorter", label: "Shorter" },
    { id: "longer", label: "Longer" }
]

const PRESETS = [
    { name: "Sunset", colors: ["#ff9a3c", "#ff4e6b", "#7b2ff7"] },
    { name: "Ocean", colors: ["#0f2b6b", "#2f6fed", "#6ee7f9"] },
    { name: "Aurora", colors: ["#12b886", "#2f6fed", "#9c36b5"] },
    { name: "Peach", colors: ["#ffecd2", "#fcb69f"] },
    { name: "Forest", colors: ["#0b3d2e", "#2f9e44", "#d9f2e3"] },
    { name: "Candy", colors: ["#ff6ec4", "#7873f5"] }
]

function presetBackground(colors) {
    return `linear-gradient(90deg${SUPPORTS_SPACES ? " in oklch" : ""}, ${colors.join(", ")})`
}

function HexField({ value, onChange }) {
    const [draft, setDraft] = useState(null)
    const invalid = draft !== null && !parseColor(draft)

    function handleText(text) {
        const color = parseColor(text)

        setDraft(text)

        if (color) {
            const { l, c, h = 0 } = color

            onChange(toHex({ l, c, h }))
        }
    }

    return (
        <input
            className = {`${styles.text} ${invalid ? styles.invalid : ""}`}
            type = "text"
            value = {draft ?? value}
            aria-label = "Stop color value"
            aria-invalid = {invalid}
            spellCheck = "false"
            onChange = {event => handleText(event.target.value)}
            onBlur = {() => setDraft(null)}
        />
    )
}

// GRADIENT STUDIO ---------------------------------------------------------------------------------------------------------------------------------|
export default function GradientStudio() {
    const [searchParams] = useSearchParams()
    const shared = useSharedColor()
    const [config, setConfig] = useSessionState("gradient:config", DEFAULT_CONFIG)
    const [harmonyType] = useSessionState("harmony:type", "analogous")
    const [harmonySpread] = useSessionState("harmony:spread", 30)
    const [harmonyEven] = useSessionState("harmony:even", true)
    const [selectedId, setSelectedId] = useState(null)

    const query = searchParams.toString()
    const stops = sortStops(config.stops)
    const selected = config.stops.find(stop => stop.id === selectedId) ?? stops[0]
    const space = SPACES.find(item => item.id === config.space)
    const gradient = buildGradient(config, SUPPORTS_SPACES)
    const bar = buildGradient({ ...config, type: "linear", angle: 90 }, SUPPORTS_SPACES)
    const srgbBar = buildGradient({ ...config, type: "linear", angle: 90, space: "srgb" }, false)

    useLayoutEffect(() => {
        const next = decodeConfig(searchParams, config)

        if (next) {
            setConfig(next)
            setSelectedId(null)
        }
    }, [query])

    function update(patch) {
        setConfig({ ...config, ...patch })
    }

    function updateStop(id, patch) {
        update({ stops: config.stops.map(stop => stop.id === id ? { ...stop, ...patch } : stop) })
    }

    function addStop(position) {
        const stop = { id: makeId(), color: colorAt(config.stops, position), position }

        update({ stops: [...config.stops, stop] })
        setSelectedId(stop.id)
    }

    function removeStop(id) {
        if (config.stops.length <= 2) return

        update({ stops: config.stops.filter(stop => stop.id !== id) })
        setSelectedId(null)
    }

    function reverse() {
        update({ stops: config.stops.map(stop => ({ ...stop, position: 100 - stop.position })) })
    }

    function distribute() {
        update({ stops: stops.map((stop, index) => ({ ...stop, position: Math.round((index / (stops.length - 1)) * 100) })) })
    }

    function loadColors(colors) {
        update({ stops: spreadStops(colors) })
        setSelectedId(null)
    }

    return (
        <div className = {styles.page}>
            <header className = {styles.header}>
                <div>
                    <h1 className = {styles.title}>Gradient Studio</h1>
                    <p className = {styles.subtitle}>Build linear, radial and conic gradients with draggable color stops, and blend them without the muddy middle.</p>
                </div>

                <ShareButton hex = {shared.hex} title = "HueForge Gradient Studio" params = {encodeConfig(config)} />
            </header>

            <section className = {styles.card}>
                <div className = {styles.head}>
                    <h2 className = {styles.heading}>Gradient</h2>
                    <span className = {styles.hint}>{stops.length} color stops</span>
                </div>

                <div className = {styles.preview} style = {{ backgroundImage: gradient }} role = "img" aria-label = "Gradient preview" />

                <div className = {styles.barWrap}>
                    <GradientBar
                        stops = {stops}
                        selectedId = {selected.id}
                        background = {bar}
                        onSelect = {setSelectedId}
                        onMove = {(id, position) => updateStop(id, { position })}
                        onAdd = {addStop}
                        onRemove = {removeStop}
                    />

                    <p className = {styles.hint}>Drag a handle to move a stop. Click the bar to add one. Select a handle and press Delete to remove it.</p>
                </div>

                <div className = {styles.editor}>
                    <div className = {styles.inputs}>
                        <ColorSwatchPicker value = {selected.color} onChange = {color => updateStop(selected.id, { color })} />
                        <HexField value = {selected.color} onChange = {color => updateStop(selected.id, { color })} />
                    </div>

                    <div className = {styles.position}>
                        <Slider
                            label = "Position"
                            value = {Math.round(selected.position)}
                            min = {0}
                            max = {100}
                            step = {1}
                            format = {value => `${value}%`}
                            onChange = {value => updateStop(selected.id, { position: value })}
                        />
                    </div>

                    <button className = {styles.button} disabled = {config.stops.length <= 2} onClick = {() => removeStop(selected.id)}>
                        <Trash2 className = {styles.buttonIcon} aria-hidden = "true" />
                        Remove
                    </button>
                </div>

                <div className = {styles.tools}>
                    <button className = {styles.button} onClick = {() => addStop(widestGap(config.stops))}>
                        <Plus className = {styles.buttonIcon} aria-hidden = "true" />
                        Add stop
                    </button>

                    <button className = {styles.button} onClick = {reverse}>
                        <ArrowLeftRight className = {styles.buttonIcon} aria-hidden = "true" />
                        Reverse
                    </button>

                    <button className = {styles.button} onClick = {distribute}>Spread evenly</button>
                </div>
            </section>

            <div className = {styles.grid}>
                <section className = {styles.card}>
                    <h2 className = {styles.heading}>Shape</h2>

                    <div className = {styles.segments} role = "group" aria-label = "Type">
                        {GRADIENT_TYPES.map(item => (
                            <button key = {item.id} className = {styles.segment} aria-pressed = {config.type === item.id} onClick = {() => update({ type: item.id })}>{item.label}</button>
                        ))}
                    </div>

                    {config.type === "linear" && (
                        <>
                            <div className = {styles.angle}>
                                <AngleDial value = {config.angle} label = "Gradient angle" onChange = {value => update({ angle: value })} />

                                <div className = {styles.grow}>
                                    <Slider label = "Angle" value = {config.angle} min = {0} max = {360} step = {1} format = {value => `${value}°`} onChange = {value => update({ angle: value })} />
                                </div>
                            </div>

                            <div className = {styles.directions} role = "group" aria-label = "Direction">
                                {DIRECTIONS.map(degrees => (
                                    <button
                                        key = {degrees}
                                        className = {styles.direction}
                                        aria-pressed = {config.angle === degrees}
                                        aria-label = {`${degrees} degrees`}
                                        onClick = {() => update({ angle: degrees })}
                                    >
                                        <ArrowUp aria-hidden = "true" style = {{ transform: `rotate(${degrees}deg)` }} />
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {config.type === "radial" && (
                        <div className = {styles.segments} role = "group" aria-label = "Shape">
                            {SHAPES.map(item => (
                                <button key = {item.id} className = {styles.segment} aria-pressed = {config.shape === item.id} onClick = {() => update({ shape: item.id })}>{item.label}</button>
                            ))}
                        </div>
                    )}

                    {config.type === "conic" && (
                        <div className = {styles.angle}>
                            <AngleDial value = {config.from} label = "Start angle" onChange = {value => update({ from: value })} />

                            <div className = {styles.grow}>
                                <Slider label = "Start angle" value = {config.from} min = {0} max = {360} step = {1} format = {value => `${value}°`} onChange = {value => update({ from: value })} />
                            </div>
                        </div>
                    )}

                    {config.type !== "linear" && (
                        <div className = {styles.sliders}>
                            <Slider label = "Center X" value = {config.x} min = {0} max = {100} step = {1} format = {value => `${value}%`} onChange = {value => update({ x: value })} />
                            <Slider label = "Center Y" value = {config.y} min = {0} max = {100} step = {1} format = {value => `${value}%`} onChange = {value => update({ y: value })} />
                        </div>
                    )}
                </section>

                <section className = {styles.card}>
                    <h2 className = {styles.heading}>Blending</h2>

                    <div className = {styles.segments} role = "group" aria-label = "Color space">
                        {SPACES.map(item => (
                            <button key = {item.id} className = {styles.segment} aria-pressed = {config.space === item.id} onClick = {() => update({ space: item.id })}>{item.label}</button>
                        ))}
                    </div>

                    {space.polar && (
                        <div className = {styles.segments} role = "group" aria-label = "Hue path">
                            {HUES.map(item => (
                                <button key = {item.id} className = {styles.segment} aria-pressed = {config.hue === item.id} onClick = {() => update({ hue: item.id })}>{item.label}</button>
                            ))}
                        </div>
                    )}

                    <p className = {styles.hint}>{space.description}</p>

                    <div className = {styles.compare}>
                        <div className = {styles.strip}>
                            <span className = {styles.stripLabel}>{space.label}</span>
                            <div className = {styles.stripBar} style = {{ backgroundImage: bar }} />
                        </div>

                        {config.space !== "srgb" && (
                            <div className = {styles.strip}>
                                <span className = {styles.stripLabel}>sRGB</span>
                                <div className = {styles.stripBar} style = {{ backgroundImage: srgbBar }} />
                            </div>
                        )}
                    </div>

                    {!SUPPORTS_SPACES && <p className = {styles.hint}>This browser can't blend in other color spaces yet, so the preview uses sRGB. The export still includes the modern line.</p>}
                </section>
            </div>

            <section className = {styles.card}>
                <h2 className = {styles.heading}>Start from</h2>

                <ul className = {styles.presets}>
                    {PRESETS.map(preset => (
                        <li key = {preset.name}>
                            <button className = {styles.preset} onClick = {() => loadColors(preset.colors)}>
                                <span className = {styles.presetBar} style = {{ backgroundImage: presetBackground(preset.colors) }} />
                                {preset.name}
                            </button>
                        </li>
                    ))}
                </ul>

                <div className = {styles.tools}>
                    <span className = {styles.label}>From my color</span>

                    <button className = {styles.button} onClick = {() => loadColors(buildScale(shared.hex, DEFAULT_OPTIONS).filter((_, index) => SCALE_INDEXES.includes(index)).map(shade => shade.hex))}>
                        Shade scale
                    </button>

                    <button className = {styles.button} onClick = {() => loadColors(buildHarmony(shared.hex, harmonyType, harmonySpread, harmonyEven))}>
                        Harmony palette
                    </button>

                    <button className = {styles.button} onClick = {() => loadColors(buildHarmony(shared.hex, "complementary", 30, true))}>
                        Complement
                    </button>
                </div>
            </section>

            <ExportPanel data = {config} formats = {GRADIENT_FORMATS} build = {buildGradientExport} unit = "hex values" filename = "gradient" />
        </div>
    )
}
