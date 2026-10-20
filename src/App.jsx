// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { useEffect, useRef, useState } from "react"
import { Routes, Route, Navigate, useLocation } from "react-router"

// COMPONENTS --------------------------------------------------------------------------------------------------------------------------------------|
import SessionProvider from "./context/SessionProvider.jsx"
import Sidebar from "./components/layout/Sidebar/Sidebar.jsx"
import Titlebar from "./components/layout/Titlebar/Titlebar.jsx"

// HOOKS -------------------------------------------------------------------------------------------------------------------------------------------|
import useNavMode from "./hooks/useNavMode.js"

// PAGES -------------------------------------------------------------------------------------------------------------------------------------------|
import Harmony from "./pages/Harmony/Harmony.jsx"
import Overview from "./pages/Overview/Overview.jsx"
import ColorPicker from "./pages/ColorPicker/ColorPicker.jsx"
import ShadeFinder from "./pages/ShadeFinder/ShadeFinder.jsx"
import ColorVision from "./pages/ColorVision/ColorVision.jsx"
import GradientStudio from "./pages/GradientStudio/GradientStudio.jsx"
import ContrastChecker from "./pages/ContrastChecker/ContrastChecker.jsx"
import PalettePlayground from "./pages/PalettePlayground/PalettePlayground.jsx"

// APPLICATION -------------------------------------------------------------------------------------------------------------------------------------|
export default function App() {
    const [isOpen, setIsOpen] = useState(false)
    const { pathname } = useLocation()
    const mode = useNavMode()
    const contentRef = useRef(null)
    const menuRef = useRef(null)
    const drawer = mode === "drawer"

    useEffect(() => {
        contentRef.current.scrollTo(0, 0)
    }, [pathname])

    useEffect(() => {
        setIsOpen(false)
    }, [pathname, mode])

    function close() {
        setIsOpen(false)
        menuRef.current?.focus()
    }

    return (
        <SessionProvider>
            <div className = {`app ${drawer ? "appDrawer" : ""}`}>
                <Sidebar mode = {mode} isOpen = {isOpen} onClose = {close} />

                <div className = "appBody">
                    {drawer && <Titlebar onMenu = {() => setIsOpen(true)} isOpen = {isOpen} buttonRef = {menuRef} />}

                    <main className = "appContent" ref = {contentRef}>
                        <Routes>
                            <Route index element = {<Overview />} />
                            <Route path = "color-picker" element = {<ColorPicker />} />
                            <Route path = "shade-finder" element = {<ShadeFinder />} />
                            <Route path = "harmony" element = {<Harmony />} />
                            <Route path = "gradient-studio" element = {<GradientStudio />} />
                            <Route path = "contrast-checker" element = {<ContrastChecker />} />
                            <Route path = "color-vision" element = {<ColorVision />} />
                            <Route path = "palette-playground" element = {<PalettePlayground />} />
                            <Route path = "*" element = {<Navigate to = "/" replace />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </SessionProvider>
    )
}
