// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { Menu } from "lucide-react"
import { useLocation } from "react-router"

// DATA --------------------------------------------------------------------------------------------------------------------------------------------|
import { pages } from "../../../data/Pages.data.js"

// ASSETS ------------------------------------------------------------------------------------------------------------------------------------------|
import logo from "../../../assets/logo.png"

// STYLES ------------------------------------------------------------------------------------------------------------------------------------------|
import styles from "./Titlebar.module.css"

// TITLEBAR ----------------------------------------------------------------------------------------------------------------------------------------|
export default function Titlebar({ onMenu, isOpen, buttonRef }) {
    const { pathname } = useLocation()
    const page = pages.find(item => item.path === pathname)
    const title = !page || pathname === "/" ? "HueForge" : page.label

    return (
        <header className = {styles.titlebar}>
            <button
                ref = {buttonRef}
                className = {styles.menu}
                aria-label = "Open navigation"
                aria-expanded = {isOpen}
                aria-controls = "app-sidebar"
                onClick = {onMenu}
            >
                <Menu aria-hidden = "true" />
            </button>

            <span className = {styles.title}>{title}</span>
            <img className = {styles.logo} src = {logo} alt = "" />
        </header>
    )
}
