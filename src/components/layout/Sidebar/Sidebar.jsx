// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { NavLink } from "react-router"
import { useEffect, useRef } from "react"
import { ShieldCheck, X } from "lucide-react"

// DATA --------------------------------------------------------------------------------------------------------------------------------------------|
import { pages } from "../../../data/Pages.data.js"

// ASSETS ------------------------------------------------------------------------------------------------------------------------------------------|
import logo from "../../../assets/logo.png"

// STYLES ------------------------------------------------------------------------------------------------------------------------------------------|
import styles from "./Sidebar.module.css"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
const HOME = pages.filter(page => !page.group)
const GROUPS = [...new Set(pages.filter(page => page.group).map(page => page.group))]

// SIDEBAR -----------------------------------------------------------------------------------------------------------------------------------------|
export default function Sidebar({ mode, isOpen, onClose }) {
    const closeRef = useRef(null)
    const drawer = mode === "drawer"
    const hidden = drawer && !isOpen

    useEffect(() => {
        if (!drawer || !isOpen) return

        closeRef.current.focus()

        function handleKeyDown(event) {
            if (event.key === "Escape") onClose()
        }

        document.addEventListener("keydown", handleKeyDown)

        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [drawer, isOpen])

    function renderLink({ path, label, description, icon: Icon }) {
        return (
            <NavLink
                key = {path}
                to = {path}
                end = {path === "/"}
                title = {mode === "rail" ? label : undefined}
                onClick = {onClose}
                className = {({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}
            >
                <Icon className = {styles.icon} aria-hidden = "true" />

                <span className = {styles.text}>
                    <span className = {styles.label}>{label}</span>
                    {drawer && <span className = {styles.description}>{description}</span>}
                </span>
            </NavLink>
        )
    }

    return (
        <>
            {drawer && <div className = {`${styles.scrim} ${isOpen ? styles.show : ""}`} onClick = {onClose} aria-hidden = "true" />}

            <aside id = "app-sidebar" className = {`${styles.sidebar} ${styles[mode] ?? ""} ${drawer && isOpen ? styles.open : ""}`} inert = {hidden}>
                <div className = {styles.brand}>
                    <img className = {styles.logo} src = {logo} alt = "HueForge logo" />

                    <span className = {styles.identity}>
                        <span className = {styles.name}>HueForge</span>
                        <span className = {styles.tagline}>Design system generator</span>
                    </span>

                    {drawer && (
                        <button ref = {closeRef} className = {styles.close} aria-label = "Close navigation" onClick = {onClose}>
                            <X aria-hidden = "true" />
                        </button>
                    )}
                </div>

                <nav className = {styles.nav} aria-label = "Tools">
                    {HOME.map(renderLink)}

                    {GROUPS.map(group => (
                        <div key = {group} className = {styles.group}>
                            <span className = {styles.groupLabel}>{group}</span>
                            {pages.filter(page => page.group === group).map(renderLink)}
                        </div>
                    ))}
                </nav>

                <div className = {styles.note}>
                    <ShieldCheck className = {styles.noteIcon} aria-hidden = "true" />
                    <p>Runs fully in your browser. Nothing is uploaded.</p>
                </div>
            </aside>
        </>
    )
}
