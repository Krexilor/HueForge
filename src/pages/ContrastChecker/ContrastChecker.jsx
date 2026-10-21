// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { useSearchParams } from "react-router"
import { useLayoutEffect, useMemo, useState } from "react"
import { ArrowLeftRight, Plus, Sparkles, Trash2, X } from "lucide-react"

// COMPONENTS --------------------------------------------------------------------------------------------------------------------------------------|
import Slider from "../../components/common/Slider/Slider.jsx"
import ExportPanel from "../../components/common/ExportPanel/ExportPanel.jsx"
import ShareButton from "../../components/common/ShareButton/ShareButton.jsx"
import ColorSwatchPicker from "../../components/common/ColorSwatchPicker/ColorSwatchPicker.jsx"

// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
import { buildHarmony } from "../../lib/Color/Harmony.js"
import useSharedColor from "../../hooks/useSharedColor.js"
import useSessionState from "../../hooks/useSessionState.js"
import { DEFAULT_OPTIONS, buildScale } from "../../lib/Color/Scale.js"
import { REPORT_FORMATS, buildReport } from "../../lib/Export/Report.js"
import { parseColor, toHex, getContrast, getReadable } from "../../lib/Color/Convert.js"
import { WCAG_RULES, describePair, apcaLevel, requiredLc, fixColor, buildSuggestions } from "../../lib/Color/Contrast.js"

// STYLES ------------------------------------------------------------------------------------------------------------------------------------------|
import styles from "./ContrastChecker.module.css"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
const MAX_COLORS = 12
const HEX_PATTERN = /^[0-9a-f]{6}$/i

const WEIGHTS = [
    { label: "Regular", value: 400 },
    { label: "Medium", value: 500 },
    { label: "Bold", value: 700 }
]

const TARGETS = [
    { id: "3", label: "3:1", hint: "Large AA" },
    { id: "4.5", label: "4.5:1", hint: "AA" },
    { id: "7", label: "7:1", hint: "AAA" },
    { id: "custom", label: "Custom", hint: "" }
]

const LEGEND = [
    { status: "aaa", label: "AAA" },
    { status: "aa", label: "AA" },
    { status: "large", label: "Large text only" },
    { status: "fail", label: "Fail" }
]

function statusOf(ratio) {
    if (ratio >= 7) return "aaa"
    if (ratio >= 4.5) return "aa"
    if (ratio >= 3) return "large"

    return "fail"
}

function ColorField({ label, value, onChange }) {
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
        <div className = {styles.field}>
            <span className = {styles.label}>{label}</span>

            <div className = {styles.inputs}>
                <ColorSwatchPicker value = {value} onChange = {onChange} />

                <input
                    className = {`${styles.text} ${invalid ? styles.invalid : ""}`}
                    type = "text"
                    value = {draft ?? value}
                    aria-label = {`${label} value`}
                    aria-invalid = {invalid}
                    autoCapitalize = "off"
                    autoCorrect = "off"
                    autoComplete = "off"
                    spellCheck = "false"
                    onChange = {event => handleText(event.target.value)}
                    onBlur = {() => setDraft(null)}
                />
            </div>

            {invalid && <p className = {styles.error}>That doesn't look like a color.</p>}
        </div>
    )
}

// CONTRAST CHECKER --------------------------------------------------------------------------------------------------------------------------------|
export default function ContrastChecker() {
    const [searchParams] = useSearchParams()
    const shared = useSharedColor()
    const [textOverride, setTextOverride] = useSessionState("contrast:text", null)
    const [background, setBackground] = useSessionState("contrast:background", "#ffffff")
    const [size, setSize] = useSessionState("contrast:size", 18)
    const [weight, setWeight] = useSessionState("contrast:weight", 400)
    const [side, setSide] = useSessionState("contrast:side", "text")
    const [targetMode, setTargetMode] = useSessionState("contrast:target", "4.5")
    const [custom, setCustom] = useSessionState("contrast:custom", 5)
    const [matrix, setMatrix] = useSessionState("contrast:matrix", [])
    const [harmonyType] = useSessionState("harmony:type", "analogous")
    const [harmonySpread] = useSessionState("harmony:spread", 30)
    const [harmonyEven] = useSessionState("harmony:even", true)
    const [adding, setAdding] = useState("#767676")

    const query = searchParams.toString()
    const text = textOverride ?? shared.hex
    const pair = useMemo(() => describePair(text, background), [text, background])
    const level = apcaLevel(pair.apca)
    const needed = requiredLc(size, weight)
    const targetValue = targetMode === "custom" ? custom : Number(targetMode)
    const source = side === "text" ? text : background
    const other = side === "text" ? background : text
    const fix = useMemo(() => fixColor(source, other, targetValue), [source, other, targetValue])
    const fixedRatio = fix ? (side === "text" ? getContrast(fix.hex, background) : getContrast(text, fix.hex)) : null
    const suggestions = useMemo(() => buildSuggestions(text, background), [text, background])

    const matrixPairs = useMemo(
        () => matrix.flatMap(foreground => matrix.filter(item => item !== foreground).map(item => describePair(foreground, item))),
        [matrix]
    )

    const passing = matrixPairs.filter(item => item.wcag.normalAA).length
    const report = [pair, ...matrixPairs]

    useLayoutEffect(() => {
        const backgroundParam = searchParams.get("b")

        if (searchParams.get("c")) setTextOverride(null)
        if (backgroundParam && HEX_PATTERN.test(backgroundParam)) setBackground("#" + backgroundParam.toLowerCase())
    }, [query])

    function swap() {
        setTextOverride(background)
        setBackground(text)
    }

    function applyColor(changed, hex) {
        if (changed === "text") setTextOverride(hex)
        else setBackground(hex)
    }

    function select(foreground, backdrop) {
        setTextOverride(foreground)
        setBackground(backdrop)
        document.querySelector("main").scrollTo({ top: 0, behavior: "smooth" })
    }

    function addColors(colors, replace = false) {
        const next = replace ? [] : [...matrix]

        colors.forEach(color => {
            if (!next.includes(color)) next.push(color)
        })

        setMatrix(next.slice(0, MAX_COLORS))
    }

    return (
        <div className = {styles.page}>
            <header className = {styles.header}>
                <div>
                    <h1 className = {styles.title}>Contrast Checker</h1>
                    <p className = {styles.subtitle}>Check if text is readable on its background, fix it automatically, and test a whole palette at once.</p>
                </div>

                <ShareButton hex = {text} title = "HueForge Contrast Checker" params = {{ b: background.slice(1) }} />
            </header>

            <div className = {styles.grid}>
                <section className = {styles.card}>
                    <h2 className = {styles.heading}>Colors</h2>

                    <div className = {styles.pair} style = {{ background, color: text }}>
                        <span className = {styles.pairLarge}>Aa</span>
                        <span className = {styles.pairSmall}>The quick brown fox</span>
                    </div>

                    <ColorField label = "Text color" value = {text} onChange = {setTextOverride} />

                    <button className = {styles.swap} onClick = {swap}>
                        <ArrowLeftRight className = {styles.swapIcon} aria-hidden = "true" />
                        Swap colors
                    </button>

                    <ColorField label = "Background color" value = {background} onChange = {setBackground} />
                </section>

                <section className = {styles.card}>
                    <h2 className = {styles.heading}>Result</h2>
                    <div className = {styles.scores}>
                        <div className = {styles.score}>
                            <span className = {styles.big}>{pair.ratio.toFixed(2)}:1</span>
                            <span className = {styles.caption}>WCAG contrast ratio</span>
                        </div>

                        <div className = {styles.score}>
                            <span className = {styles.big}>Lc {Math.round(pair.apca)}</span>
                            <span className = {styles.caption}>APCA lightness contrast</span>
                        </div>
                    </div>

                    <ul className = {styles.rules}>
                        {WCAG_RULES.map(rule => (
                            <li key = {rule.id} className = {styles.rule}>
                                <span>
                                    {rule.label} <span className = {styles.muted}>{rule.level} · {rule.min}:1</span>
                                </span>

                                <span className = {`${styles.badge} ${pair.wcag[rule.id] ? styles.pass : styles.fail}`}>{pair.wcag[rule.id] ? "Pass" : "Fail"}</span>
                            </li>
                        ))}
                    </ul>

                    <p className = {styles.level}><b>{level.label}.</b> {level.detail}</p>
                    <p className = {styles.hint}>APCA is a draft for WCAG 3, so treat it as extra guidance. WCAG 2 ratios are still what most laws and audits refer to.</p>
                </section>
            </div>

            <section className = {styles.card}>
                <h2 className = {styles.heading}>Live preview</h2>

                <div className = {styles.sample} style = {{ background, color: text }}>
                    <p className = {styles.sampleText} style = {{ fontSize: `${size}px`, fontWeight: weight }}>
                        The quick brown fox jumps over the lazy dog. Good contrast makes long text easy to read.
                    </p>

                    <span className = {styles.uiSample} style = {{ borderColor: text }}>Button</span>
                </div>

                <div className = {styles.controls}>
                    <div className = {styles.slider}>
                        <Slider label = "Font size" value = {size} min = {12} max = {64} step = {1} format = {value => `${value}px`} onChange = {setSize} />
                    </div>

                    <div className = {styles.segments} role = "group" aria-label = "Font weight">
                        {WEIGHTS.map(item => (
                            <button key = {item.value} className = {styles.segment} aria-pressed = {weight === item.value} onClick = {() => setWeight(item.value)}>
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                <p className = {styles.verdict}>
                    <span className = {`${styles.badge} ${pair.apca >= needed ? styles.pass : styles.fail}`}>{pair.apca >= needed ? "Readable" : "Too faint"}</span>
                    {" "}
                    {needed >= 100
                        ? "Text under 14px is hard to read at any contrast, so avoid it for content."
                        : `At ${size}px ${weight >= 700 ? "bold" : "regular"} text, APCA suggests Lc ${needed} or more. This pair has Lc ${Math.round(pair.apca)}.`}
                </p>
            </section>

            <section className = {styles.card}>
                <div className = {styles.head}>
                    <h2 className = {styles.heading}>Auto-fix</h2>
                    <span className = {styles.hint}>Changes only the lightness, so the hue and vividness stay the same.</span>
                </div>

                <div className = {styles.options}>
                    <div className = {styles.segments} role = "group" aria-label = "Color to adjust">
                        <button className = {styles.segment} aria-pressed = {side === "text"} onClick = {() => setSide("text")}>Adjust text</button>
                        <button className = {styles.segment} aria-pressed = {side === "background"} onClick = {() => setSide("background")}>Adjust background</button>
                    </div>

                    <div className = {styles.segments} role = "group" aria-label = "Target ratio">
                        {TARGETS.map(item => (
                            <button key = {item.id} className = {styles.segment} aria-pressed = {targetMode === item.id} onClick = {() => setTargetMode(item.id)}>
                                {item.label}{item.hint && <span className = {styles.segmentHint}> {item.hint}</span>}
                            </button>
                        ))}

                        {targetMode === "custom" && (
                            <input
                                className = {styles.custom}
                                type = "number"
                                inputMode = "decimal"
                                min = {1}
                                max = {21}
                                step = {0.1}
                                value = {custom}
                                aria-label = "Custom contrast ratio"
                                onChange = {event => setCustom(Math.min(21, Math.max(1, Number(event.target.value) || 1)))}
                            />
                        )}
                    </div>
                </div>

                <div className = {styles.fix}>
                    {fix === null && <p>No lightness change reaches {targetValue}:1 with this {side === "text" ? "background" : "text color"}. Try adjusting the other color.</p>}

                    {fix !== null && fix.distance === 0 && <p><b>Already passes.</b> This pair reaches {targetValue}:1.</p>}

                    {fix !== null && fix.distance > 0 && (
                        <>
                            <div className = {styles.change}>
                                <span className = {styles.swatch} style = {{ background: source }} />
                                <code>{source}</code>
                                <span className = {styles.arrow}>→</span>
                                <span className = {styles.swatch} style = {{ background: fix.hex }} />
                                <code>{fix.hex}</code>
                                <span className = {styles.muted}>{fixedRatio.toFixed(2)}:1</span>
                            </div>

                            <button className = {styles.apply} onClick = {() => applyColor(side, fix.hex)}>
                                <Sparkles className = {styles.buttonIcon} aria-hidden = "true" />
                                Apply fix
                            </button>
                        </>
                    )}
                </div>

                {suggestions.length > 0 && (
                    <div className = {styles.quick}>
                        <span className = {styles.label}>Other options</span>

                        <div className = {styles.suggestions}>
                            {suggestions.map(item => (
                                <button key = {`${item.side}-${item.hex}`} className = {styles.suggestion} onClick = {() => applyColor(item.side, item.hex)}>
                                    <span
                                        className = {styles.mini}
                                        style = {item.side === "text" ? { background, color: item.hex } : { background: item.hex, color: text }}
                                    >
                                        Aa
                                    </span>

                                    <span className = {styles.suggestionText}>
                                        <b>{item.side === "text" ? "Text" : "Background"} {item.hex}</b>
                                        <span className = {styles.muted}>{item.ratio.toFixed(2)}:1 · reaches {item.target}:1</span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            <section className = {styles.card}>
                <div className = {styles.head}>
                    <h2 className = {styles.heading}>Palette matrix</h2>
                    {matrix.length > 1 && <span className = {styles.hint}>{passing} of {matrixPairs.length} pairs pass AA for normal text.</span>}
                </div>

                <div className = {styles.tools}>
                    <ColorSwatchPicker value = {adding} onChange = {setAdding} />

                    <button className = {styles.button} onClick = {() => addColors([adding])}>
                        <Plus className = {styles.buttonIcon} aria-hidden = "true" />
                        Add color
                    </button>

                    <button className = {styles.button} onClick = {() => addColors([text, background])}>Add current pair</button>

                    <button className = {styles.button} onClick = {() => addColors(buildScale(shared.hex, DEFAULT_OPTIONS).map(item => item.hex), true)}>
                        Load shade scale
                    </button>

                    <button className = {styles.button} onClick = {() => addColors(buildHarmony(shared.hex, harmonyType, harmonySpread, harmonyEven), true)}>
                        Load harmony palette
                    </button>

                    {matrix.length > 0 && (
                        <button className = {styles.button} onClick = {() => setMatrix([])}>
                            <Trash2 className = {styles.buttonIcon} aria-hidden = "true" />
                            Clear
                        </button>
                    )}
                </div>

                {matrix.length > 0 && (
                    <ul className = {styles.colors}>
                        {matrix.map(color => (
                            <li key = {color} className = {styles.colorChip}>
                                <span className = {styles.swatch} style = {{ background: color }} />
                                <code>{color}</code>

                                <button className = {styles.remove} aria-label = {`Remove ${color}`} onClick = {() => setMatrix(matrix.filter(item => item !== color))}>
                                    <X aria-hidden = "true" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {matrix.length < 2 && <p className = {styles.hint}>Add at least two colors, or load a shade scale or harmony palette, to see every text and background pair.</p>}

                {matrix.length > 1 && (
                    <>
                        <ul className = {styles.legend}>
                            {LEGEND.map(item => (
                                <li key = {item.status} className = {styles.legendItem}>
                                    <span className = {styles.legendDot} data-status = {item.status} />
                                    {item.label}
                                </li>
                            ))}
                        </ul>

                        <div className = {styles.tableWrap}>
                            <table className = {styles.table}>
                                <thead>
                                    <tr>
                                        <th className = {styles.corner} scope = "col">Text on background</th>

                                        {matrix.map(color => (
                                            <th key = {color} scope = "col">
                                                <span className = {styles.headColor}>
                                                    <span className = {styles.swatch} style = {{ background: color }} />
                                                    {color}
                                                </span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {matrix.map(foreground => (
                                        <tr key = {foreground}>
                                            <th scope = "row">
                                                <span className = {styles.headColor}>
                                                    <span className = {styles.swatch} style = {{ background: foreground }} />
                                                    {foreground}
                                                </span>
                                            </th>

                                            {matrix.map(backdrop => {
                                                if (foreground === backdrop) return <td key = {backdrop} className = {styles.same}>-</td>

                                                const ratio = getContrast(foreground, backdrop)

                                                return (
                                                    <td key = {backdrop}>
                                                        <button
                                                            className = {styles.cell}
                                                            style = {{ background: backdrop, color: foreground }}
                                                            data-status = {statusOf(ratio)}
                                                            aria-label = {`${foreground} on ${backdrop}, ratio ${ratio.toFixed(2)}`}
                                                            onClick = {() => select(foreground, backdrop)}
                                                        >
                                                            <span className = {styles.cellSample}>Aa</span>
                                                            <span className = {styles.cellRatio} style = {{ color: getReadable(backdrop) }}>{ratio.toFixed(1)}</span>
                                                        </button>
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </section>

            <ExportPanel data = {report} formats = {REPORT_FORMATS} build = {buildReport} unit = "hex values" filename = "contrast-report" />
        </div>
    )
}
