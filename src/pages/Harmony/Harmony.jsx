// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { Link, useSearchParams } from "react-router"
import { useLayoutEffect, useMemo, useState } from "react"
import { ArrowRight, Check, Copy, Lock, LockOpen, Moon, Shuffle, Sun } from "lucide-react"

// COMPONENTS --------------------------------------------------------------------------------------------------------------------------------------|
import ColorSwatchPicker from "../../components/common/ColorSwatchPicker/ColorSwatchPicker.jsx"
import ColorWheel from "../../components/common/ColorWheel/ColorWheel.jsx"
import Dropdown from "../../components/common/Dropdown/Dropdown.jsx"
import ExportPanel from "../../components/common/ExportPanel/ExportPanel.jsx"
import ShareButton from "../../components/common/ShareButton/ShareButton.jsx"

// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
import { parseColor, toHex, toLch, randomColor, getContrast, getRating, getReadable } from "../../lib/Color/Convert.js"
import { TYPES, ROLES, PROPORTIONS, buildHarmony } from "../../lib/Color/Harmony.js"
import { DEFAULT_OPTIONS, buildScale } from "../../lib/Color/Scale.js"
import { colorLink } from "../../lib/Color/Links.js"
import useSharedColor from "../../hooks/useSharedColor.js"
import useSessionState from "../../hooks/useSessionState.js"
import useCopy from "../../hooks/useCopy.js"

// STYLES ------------------------------------------------------------------------------------------------------------------------------------------|
import styles from "./Harmony.module.css"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
function Contrast({ hex, background, label }) {
    const ratio = getContrast(hex, background)
    const rating = getRating(ratio)

    return (
        <span className = {styles.contrast}>
            <span className = {styles.contrastLabel}>{label}</span>
            {ratio.toFixed(2)}
            <span className = {`${styles.badge} ${rating === "Fail" ? styles.fail : styles.pass}`}>{rating}</span>
        </span>
    )
}

// HARMONY -----------------------------------------------------------------------------------------------------------------------------------------|
export default function Harmony() {
    const [searchParams] = useSearchParams()
    const { lch, setLch, hex, setHex } = useSharedColor()
    const [typeId, setTypeId] = useSessionState("harmony:type", "analogous")
    const [spread, setSpread] = useSessionState("harmony:spread", 30)
    const [even, setEven] = useSessionState("harmony:even", true)
    const [locks, setLocks] = useSessionState("harmony:locks", {})
    const [storedRoles, setStoredRoles] = useSessionState("harmony:roles", [])
    const [withScales, setWithScales] = useSessionState("harmony:scales", false)
    const [dark, setDark] = useSessionState("harmony:dark", false)
    const [draft, setDraft] = useState(null)
    const { copied, copy } = useCopy()

    const query = searchParams.toString()
    const type = TYPES.find(item => item.id === typeId)
    const generated = useMemo(() => buildHarmony(hex, typeId, spread, even), [hex, typeId, spread, even])
    const palette = generated.map((color, index) => index > 0 && index in locks ? locks[index] : color)
    const roles = storedRoles.length === palette.length ? storedRoles : ROLES.slice(0, palette.length)
    const byRole = Object.fromEntries(roles.map((role, index) => [role, palette[index]]))
    const ordered = ROLES.filter(role => role in byRole)
    const widths = PROPORTIONS[palette.length]
    const primary = byRole.primary
    const secondary = byRole.secondary
    const accent = byRole.accent ?? secondary
    const invalid = draft !== null && !parseColor(draft)
    const wheelColors = palette.map(color => ({ hex: color, ...toLch(color) }))

    const roleOptions = ROLES.slice(0, palette.length).map(role => ({
        value: role,
        label: role[0].toUpperCase() + role.slice(1),
        swatch: byRole[role],
    }))

    const groups = palette
        .map((color, index) => withScales ? { name: roles[index], shades: buildScale(color, DEFAULT_OPTIONS) } : { name: roles[index], hex: color })
        .sort((a, b) => ROLES.indexOf(a.name) - ROLES.indexOf(b.name))

    useLayoutEffect(() => {
        const typeParam = searchParams.get("t")
        const spreadParam = Number(searchParams.get("s"))
        const evenParam = searchParams.get("e")

        if (TYPES.some(item => item.id === typeParam)) setTypeId(typeParam)
        if (spreadParam >= 10 && spreadParam <= 60) setSpread(spreadParam)
        if (evenParam === "0" || evenParam === "1") setEven(evenParam === "1")
    }, [query])

    function changeType(id) {
        setTypeId(id)
        setStoredRoles([])
        setLocks(0 in locks ? { 0: locks[0] } : {})
    }

    function changeRole(index, role) {
        const other = roles.indexOf(role)
        const next = [...roles]

        next[other] = roles[index]
        next[index] = role

        setStoredRoles(next)
    }

    function toggleLock(index) {
        const next = { ...locks }

        if (index in next) delete next[index]
        else next[index] = palette[index]

        setLocks(next)
    }

    function shuffle() {
        if (0 in locks) {
            const others = TYPES.filter(item => item.id !== typeId)

            changeType(others[Math.floor(Math.random() * others.length)].id)
            return
        }

        const { l, c, h = 0 } = randomColor()

        setLch({ l, c, h })
    }

    function handleText(value) {
        const color = parseColor(value)

        setDraft(value)

        if (color) {
            const { l, c, h = 0 } = color

            setHex(toHex({ l, c, h }))
        }
    }

    return (
        <div className = {styles.page}>
            <header className = {styles.header}>
                <div>
                    <h1 className = {styles.title}>Harmony</h1>
                    <p className = {styles.subtitle}>Build a supporting palette from your base color using color wheel rules.</p>
                </div>

                <ShareButton hex = {hex} title = "HueForge Harmony" params = {{ t: typeId, s: spread, e: even ? 1 : 0 }} />
            </header>

            <div className = {styles.grid}>
                <section className = {`${styles.card} ${styles.wheelCard}`}>
                    <ColorWheel colors = {wheelColors} onChange = {({ h, c }) => setLch({ ...lch, h, c })} />
                    <p className = {styles.hint}>Drag the base dot. Angle is hue, and distance from the center is how vivid the color is.</p>
                </section>

                <section className = {styles.card}>
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

                    {invalid && <p className = {styles.error}>That doesn't look like a color. Try hex, rgb(), hsl(), oklch() or a name.</p>}

                    <div className = {styles.field}>
                        <span className = {styles.label}>Harmony</span>

                        <div className = {styles.segments} role = "group" aria-label = "Harmony type">
                            {TYPES.map(item => (
                                <button key = {item.id} className = {styles.segment} aria-pressed = {item.id === typeId} onClick = {() => changeType(item.id)}>
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        <p className = {styles.hint}>{type.description}</p>
                    </div>

                    <div className = {styles.slider}>
                        <label className = {styles.sliderLabel} htmlFor = "harmony-spread">
                            <span>Spread</span>
                            <span>{spread}°</span>
                        </label>

                        <input id = "harmony-spread" type = "range" min = {10} max = {60} step = {1} value = {spread} disabled = {!type.hasSpread} onChange = {event => setSpread(Number(event.target.value))} />
                        {!type.hasSpread && <p className = {styles.hint}>Spread applies to analogous and split complementary.</p>}
                    </div>

                    <label className = {styles.toggle}>
                        <input type = "checkbox" checked = {even} onChange = {event => setEven(event.target.checked)} />
                        Match the base lightness and chroma on every color
                    </label>

                    <div className = {styles.actions}>
                        <button className = {styles.button} onClick = {shuffle}>
                            <Shuffle className = {styles.buttonIcon} aria-hidden = "true" />
                            Shuffle
                        </button>
                    </div>
                </section>
            </div>

            <section className = {styles.card}>
                <div className = {styles.head}>
                    <h2 className = {styles.heading}>Palette</h2>
                    <span className = {styles.hint}>Lock a color to keep it. Locking the base makes Shuffle change the harmony instead.</span>
                </div>

                <ul className = {styles.palette}>
                    {palette.map((color, index) => {
                        const locked = index in locks

                        return (
                            <li key = {index} className = {styles.color}>
                                <div className = {styles.swatch} style = {{ background: color, color: getReadable(color) }}>
                                    <button
                                        className = {styles.lock}
                                        aria-pressed = {locked}
                                        aria-label = {index === 0 ? "Keep base color when shuffling" : `${locked ? "Unlock" : "Lock"} ${roles[index]}`}
                                        onClick = {() => toggleLock(index)}
                                    >
                                        {locked ? <Lock aria-hidden = "true" /> : <LockOpen aria-hidden = "true" />}
                                    </button>

                                    <span className = {styles.hex}>{color}</span>
                                </div>

                                <div className = {styles.meta}>
                                    <Dropdown label = {`Role of color ${index + 1}`} value = {roles[index]} options = {roleOptions} onChange = {role => changeRole(index, role)} />

                                    <div className = {styles.contrasts}>
                                        <Contrast hex = {color} background = "#ffffff" label = "White" />
                                        <Contrast hex = {color} background = "#000000" label = "Black" />
                                    </div>

                                    <div className = {styles.links}>
                                        <button className = {styles.small} onClick = {() => copy(color, `color-${index}`)}>
                                            {copied === `color-${index}` ? <Check aria-hidden = "true" /> : <Copy aria-hidden = "true" />}
                                            {copied === `color-${index}` ? "Copied" : "Copy"}
                                        </button>

                                        <Link className = {styles.small} to = {colorLink("/shade-finder", color)}>
                                            Shades
                                            <ArrowRight aria-hidden = "true" />
                                        </Link>
                                    </div>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </section>

            <section className = {styles.card}>
                <div className = {styles.head}>
                    <h2 className = {styles.heading}>Preview</h2>

                    <div className = {styles.modes} role = "group" aria-label = "Preview theme">
                        <button className = {styles.mode} aria-pressed = {!dark} onClick = {() => setDark(false)}>
                            <Sun aria-hidden = "true" />
                            Light
                        </button>

                        <button className = {styles.mode} aria-pressed = {dark} onClick = {() => setDark(true)}>
                            <Moon aria-hidden = "true" />
                            Dark
                        </button>
                    </div>
                </div>

                <div className = {styles.mock} data-theme = {dark ? "dark" : "light"}>
                    <div className = {styles.mockHero} style = {{ background: primary, color: getReadable(primary) }}>
                        <h3 className = {styles.mockTitle}>Launch your next idea</h3>
                        <p className = {styles.mockText}>A quick look at how your palette works together on a real page.</p>
                        <span className = {styles.cta} style = {{ background: accent, color: getReadable(accent) }}>Get started</span>
                    </div>

                    <div className = {styles.mockCards}>
                        <div className = {styles.miniCard} style = {{ borderTopColor: secondary }}>
                            <b>Secondary card</b>
                            <p>Supporting content uses the secondary color.</p>
                        </div>

                        <div className = {styles.miniCard} style = {{ borderTopColor: accent }}>
                            <b>Accent card</b>
                            <span className = {styles.tag} style = {{ background: accent, color: getReadable(accent) }}>New</span>
                        </div>
                    </div>
                </div>

                <div className = {styles.bar} aria-label = "Suggested proportions">
                    {ordered.map((role, index) => (
                        <span key = {role} className = {styles.part} style = {{ width: `${widths[index]}%`, background: byRole[role], color: getReadable(byRole[role]) }}>
                            {role} {widths[index]}%
                        </span>
                    ))}
                </div>
            </section>

            <div className = {styles.exportBlock}>
                <label className = {styles.toggle}>
                    <input type = "checkbox" checked = {withScales} onChange = {event => setWithScales(event.target.checked)} />
                    Include a full 50 to 950 scale for each color in the export
                </label>

                <ExportPanel data = {groups} filename = "harmony-palette" />
            </div>
        </div>
    )
}
