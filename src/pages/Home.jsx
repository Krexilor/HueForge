// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { useState } from "react"
import { Outlet } from "react-router"

// COMPONENTS --------------------------------------------------------------------------------------------------------------------------------------|
import Sidebar from "../components/layout/Sidebar/Sidebar.jsx"

// STYLES ------------------------------------------------------------------------------------------------------------------------------------------|
import styles from "./Home.module.css"

// HOME --------------------------------------------------------------------------------------------------------------------------------------------|
export default function Home() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className = {styles.home}>
            <Sidebar isOpen = {isOpen} onClose = {() => setIsOpen(false)} />

            <main className = {styles.content}>
                <Outlet />
            </main>
        </div>
    )
}
