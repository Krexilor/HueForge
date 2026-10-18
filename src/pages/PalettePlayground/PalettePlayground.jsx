// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { RotateCcw } from "lucide-react"
import { useSearchParams } from "react-router"
import { useLayoutEffect, useMemo, useState } from "react"

// COMPONENTS --------------------------------------------------------------------------------------------------------------------------------------|
import ExportPanel from "../../components/common/ExportPanel/ExportPanel.jsx"
import ShareButton from "../../components/common/ShareButton/ShareButton.jsx"
import ThemePreview from "../../components/preview/ThemePreview/ThemePreview.jsx"
import ColorSwatchPicker from "../../components/common/ColorSwatchPicker/ColorSwatchPicker.jsx"

// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
import useCopy from "../../hooks/useCopy.js"
import { buildHarmony } from "../../lib/Color/Harmony.js"
import useSharedColor from "../../hooks/useSharedColor.js"
import useSessionState from "../../hooks/useSessionState.js"
import { parseColor, toHex } from "../../lib/Color/Convert.js"
import { THEME_FORMATS, buildThemeExport } from "../../lib/Export/ThemeExport.js"
import { DEFAULT_COLORS, ROLES, buildPalette, buildTheme, checks, variables } from "../../lib/Color/Theme.js"

// STYLES ------------------------------------------------------------------------------------------------------------------------------------------|
import styles from "./PalettePlayground.module.css"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
const HEX_PATTERN = /^[0-9a-f]{6}$/i

const NOTES = {
    primary: "Buttons, links and focus",
    secondary: "Supporting actions",
    accent: "Highlights and charts",
    success: "Confirmations",
    warning: "Cautions",
    danger: "Errors and deletes"
}

const TEMPLATES = [
    { id: "dashboard", label: "Dashboard" },
    { id: "landing", label: "Landing page" },
    { id: "components", label: "Components" }
]

const VIEWS = [
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
    { id: "compare", label: "Compare" }
]

const RADII = [
    { value: 4, label: "Sharp" },
    { value: 10, label: "Rounded" },
    { value: 18, label: "Soft" }
]

const ROLE_PARTS = ["solid", "hover", "on", "soft", "on-soft", "text"]

function roleValue(role, part) {
    return { solid: role.solid, hover: role.hover, on: role.on, soft: role.soft, "on-soft": role.onSoft, text: role.text }[part]
}

function HexField({ value, onChange, label }) {
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
            aria-label = {label}
            aria-invalid = {invalid}
            spellCheck = "false"
            onChange = {event => handleText(event.target.value)}
            onBlur = {() => setDraft(null)}
        />
    )
}

function Tile({ name, hex, done, onCopy }) {
    return (
        <button className = {styles.tile} onClick = {onCopy}>
            <span className = {styles.tileSwatch} style = {{ background: hex }} />
            <span className = {styles.tileName}>{name}</span>
            <code className = {styles.tileHex}>{done ? "Copied" : hex}</code>
        </button>
    )
}

// PALETTE PLAYGROUND ------------------------------------------------------------------------------------------------------------------------------|
export default function PalettePlayground() {
    const [searchParams] = useSearchParams()
    const shared = useSharedColor()
    const [colors, setColors] = useSessionState("playground:colors", DEFAULT_COLORS)
    const [template, setTemplate] = useSessionState("playground:template", "dashboard")
    const [view, setView] = useSessionState("playground:view", "light")
    const [radius, setRadius] = useSessionState("playground:radius", 10)
    const [withScales, setWithScales] = useSessionState("playground:scales", false)
    const [harmonyType] = useSessionState("harmony:type", "analogous")
    const [harmonySpread] = useSessionState("harmony:spread", 30)
    const [harmonyEven] = useSessionState("harmony:even", true)
    const [showChecks, setShowChecks] = useState(false)
    const { copied, copy } = useCopy()

    const query = searchParams.toString()
    const palette = useMemo(() => buildPalette(colors), [colors])
    const light = useMemo(() => buildTheme(palette, "light"), [palette])
    const dark = useMemo(() => buildTheme(palette, "dark"), [palette])
    const lightChecks = useMemo(() => checks(light), [light])
    const darkChecks = useMemo(() => checks(dark), [dark])
    const shown = view === "dark" ? dark : light
    const total = lightChecks.length + darkChecks.length
    const failing = [...lightChecks, ...darkChecks].filter(item => item.ratio < item.min).length

    const surfaceTokens = variables(shown).slice(0, 7)

    const scaleGroups = [
        ...ROLES.map(role => ({ name: role.id, shades: palette.scales[role.id] })),
        { name: "neutral", shades: palette.neutral },
    ]

    const exportData = { light, dark, scales: withScales ? scaleGroups : null }

    useLayoutEffect(() => {
        const colorsParam = searchParams.get("pc")
        const templateParam = searchParams.get("pt")
        const viewParam = searchParams.get("pv")
        const radiusParam = Number(searchParams.get("pr"))

        if (colorsParam) {
            const parts = colorsParam.split("-")

            if (parts.length === ROLES.length && parts.every(part => HEX_PATTERN.test(part))) {
                setColors(Object.fromEntries(ROLES.map((role, index) => [role.id, "#" + parts[index].toLowerCase()])))
            }
        }

        if (TEMPLATES.some(item => item.id === templateParam)) setTemplate(templateParam)
        if (VIEWS.some(item => item.id === viewParam)) setView(viewParam)
        if (RADII.some(item => item.value === radiusParam)) setRadius(radiusParam)
    }, [query])

    function setColor(id, color) {
        setColors({ ...colors, [id]: color })
    }

    function fromHarmony() {
        const palette3 = buildHarmony(shared.hex, harmonyType, harmonySpread, harmonyEven)
        const triad = buildHarmony(shared.hex, "triadic", 30, true)

        setColors({ ...colors, primary: shared.hex, secondary: palette3[1] ?? triad[1], accent: palette3[2] ?? triad[2] })
    }

    return (
        <div className = {styles.page}>
            <header className = {styles.header}>
                <div>
                    <h1 className = {styles.title}>Palette Playground</h1>
                    <p className = {styles.subtitle}>Turn your colors into light and dark themes, see them on real interfaces, and export the tokens.</p>
                </div>

                <ShareButton
                    hex = {colors.primary}
                    title = "HueForge Palette Playground"
                    params = {{ pc: ROLES.map(role => colors[role.id].slice(1)).join("-"), pt: template, pv: view, pr: radius }}
                />
            </header>

            <section className = {styles.card}>
                <div className = {styles.head}>
                    <h2 className = {styles.heading}>Colors</h2>

                    <div className = {styles.tools}>
                        <button className = {styles.button} onClick = {() => setColor("primary", shared.hex)}>Use my base color</button>
                        <button className = {styles.button} onClick = {fromHarmony}>From harmony palette</button>

                        <button className = {styles.button} onClick = {() => setColors(DEFAULT_COLORS)}>
                            <RotateCcw className = {styles.buttonIcon} aria-hidden = "true" />
                            Reset
                        </button>
                    </div>
                </div>

                <ul className = {styles.roles}>
                    {ROLES.map(role => (
                        <li key = {role.id} className = {styles.role}>
                            <div className = {styles.roleHead}>
                                <b>{role.label}</b>
                                <span className = {styles.hint}>{NOTES[role.id]}</span>
                            </div>

                            <div className = {styles.inputs}>
                                <ColorSwatchPicker value = {colors[role.id]} onChange = {color => setColor(role.id, color)} />
                                <HexField value = {colors[role.id]} label = {`${role.label} color`} onChange = {color => setColor(role.id, color)} />
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            <section className = {styles.card}>
                <div className = {styles.head}>
                    <h2 className = {styles.heading}>Preview</h2>
                    <span className = {styles.hint}>Everything updates as you change a color.</span>
                </div>

                <div className = {styles.options}>
                    <div className = {styles.segments} role = "group" aria-label = "Template">
                        {TEMPLATES.map(item => (
                            <button key = {item.id} className = {styles.segment} aria-pressed = {template === item.id} onClick = {() => setTemplate(item.id)}>{item.label}</button>
                        ))}
                    </div>

                    <div className = {styles.segments} role = "group" aria-label = "Theme">
                        {VIEWS.map(item => (
                            <button key = {item.id} className = {styles.segment} aria-pressed = {view === item.id} onClick = {() => setView(item.id)}>{item.label}</button>
                        ))}
                    </div>

                    <div className = {styles.segments} role = "group" aria-label = "Corners">
                        {RADII.map(item => (
                            <button key = {item.value} className = {styles.segment} aria-pressed = {radius === item.value} onClick = {() => setRadius(item.value)}>{item.label}</button>
                        ))}
                    </div>
                </div>

                <div className = {`${styles.stage} ${view === "compare" ? styles.compare : ""}`}>
                    {view !== "dark" && (
                        <figure className = {styles.pane}>
                            <figcaption className = {styles.paneLabel}>Light</figcaption>
                            <ThemePreview theme = {light} radius = {radius} template = {template} />
                        </figure>
                    )}

                    {view !== "light" && (
                        <figure className = {styles.pane}>
                            <figcaption className = {styles.paneLabel}>Dark</figcaption>
                            <ThemePreview theme = {dark} radius = {radius} template = {template} />
                        </figure>
                    )}
                </div>
            </section>

            <section className = {styles.card}>
                <div className = {styles.head}>
                    <h2 className = {styles.heading}>Tokens</h2>
                    <span className = {styles.hint}>{view === "dark" ? "Dark" : "Light"} theme. Tap a token to copy its hex.</span>
                </div>

                <div className = {styles.tiles}>
                    {surfaceTokens.map(([name, hex]) => (
                        <Tile key = {name} name = {name} hex = {hex} done = {copied === `surface-${name}`} onCopy = {() => copy(hex, `surface-${name}`)} />
                    ))}
                </div>

                <div className = {styles.groups}>
                    {ROLES.map(role => (
                        <div key = {role.id} className = {styles.roleRow}>
                            <span className = {styles.roleName}>{role.label}</span>

                            {ROLE_PARTS.map(part => {
                                const hex = roleValue(shown.roles[role.id], part)
                                const key = `${role.id}-${part}`

                                return <Tile key = {key} name = {part} hex = {hex} done = {copied === key} onCopy = {() => copy(hex, key)} />
                            })}
                        </div>
                    ))}
                </div>
            </section>

            <section className = {styles.card}>
                <div className = {styles.head}>
                    <h2 className = {styles.heading}>Accessibility checks</h2>

                    <span className = {`${styles.badge} ${failing === 0 ? styles.pass : styles.fail}`}>
                        {failing === 0 ? `All ${total} checks pass` : `${failing} of ${total} checks fail`}
                    </span>
                </div>

                <p className = {styles.hint}>Shades are chosen automatically so text stays readable on its background, in both themes.</p>

                <div className = {styles.tools}>
                    <button className = {styles.button} onClick = {() => setShowChecks(!showChecks)}>{showChecks ? "Hide" : "Show"} all checks</button>
                </div>

                {showChecks && (
                    <div className = {styles.tableWrap}>
                        <table className = {styles.table}>
                            <thead>
                                <tr>
                                    <th scope = "col">Pair</th>
                                    <th scope = "col">Needs</th>
                                    <th scope = "col">Light</th>
                                    <th scope = "col">Dark</th>
                                </tr>
                            </thead>

                            <tbody>
                                {lightChecks.map((item, index) => {
                                    const other = darkChecks[index]

                                    return (
                                        <tr key = {item.label}>
                                            <td>{item.label}</td>
                                            <td className = {styles.muted}>{item.min}:1</td>
                                            <td><span className = {`${styles.badge} ${item.ratio >= item.min ? styles.pass : styles.fail}`}>{item.ratio.toFixed(2)}</span></td>
                                            <td><span className = {`${styles.badge} ${other.ratio >= other.min ? styles.pass : styles.fail}`}>{other.ratio.toFixed(2)}</span></td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <div className = {styles.exportBlock}>
                <label className = {styles.toggle}>
                    <input type = "checkbox" checked = {withScales} onChange = {event => setWithScales(event.target.checked)} />
                    Include the full 50 to 950 scale for every role in the export
                </label>

                <ExportPanel data = {exportData} formats = {THEME_FORMATS} build = {buildThemeExport} unit = "hex values" filename = "theme" />
            </div>
        </div>
    )
}
