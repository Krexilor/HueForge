// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { NavLink } from "react-router"

// DATA --------------------------------------------------------------------------------------------------------------------------------------------|
import { pages } from "../../../data/Pages.data.js"

// ASSETS ------------------------------------------------------------------------------------------------------------------------------------------|
import logo from "../../../assets/logo.png"

// STYLES ------------------------------------------------------------------------------------------------------------------------------------------|
import styles from "./Sidebar.module.css"

// APPLICATION -------------------------------------------------------------------------------------------------------------------------------------|
export default function Sidebar({ isOpen, onClose }) {
    return (
        <>
            <div className = {`${styles.scrim} ${isOpen ? styles.show : ""}`} onClick = {onClose} />

            <aside className = {`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
                <div className = {styles.brand}>
                    <img className = {styles.logo} src = {logo} alt = "HueForge logo" />
                    <span className = {styles.name}>HueForge</span>
                </div>

                <nav className = {styles.nav} aria-label = "Tools">
                    {pages.map(({ path, label, icon: Icon }) => (
                        <NavLink
                            key = {path}
                            to = {path}
                            end = {path === "/"}
                            title = {label}
                            onClick = {onClose}
                            className = {({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}
                        >
                            <Icon className = {styles.icon} aria-hidden = "true" />
                            <span className = {styles.label}>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                <p className = {styles.note}>Runs fully in your browser. Nothing is uploaded.</p>
            </aside>
        </>
    )
}
