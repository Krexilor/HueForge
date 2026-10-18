// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { useEffect, useRef, useState } from "react"
import { Routes, Route, Navigate, useLocation } from "react-router"

// COMPONENTS --------------------------------------------------------------------------------------------------------------------------------------|
import SessionProvider from "./context/SessionProvider.jsx"
import Sidebar from "./components/layout/Sidebar/Sidebar.jsx"

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
    const contentRef = useRef(null)

    useEffect(() => {
        contentRef.current.scrollTo(0, 0)
    }, [pathname])

    return (
        <SessionProvider>
            <div className = "app">
                <Sidebar isOpen = {isOpen} onClose = {() => setIsOpen(false)} />

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
        </SessionProvider>
    )
}
