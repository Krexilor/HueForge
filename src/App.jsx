// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { Routes, Route, Navigate } from "react-router"

// COMPONENTS --------------------------------------------------------------------------------------------------------------------------------------|
import SessionProvider from "./context/SessionProvider.jsx"

// PAGES -------------------------------------------------------------------------------------------------------------------------------------------|
import Home from "./pages/Home.jsx"
import Harmony from "./pages/Harmony/Harmony.jsx"
import Overview from "./pages/Overview/Overview.jsx"
import ColorPicker from "./pages/ColorPicker/ColorPicker.jsx"
import ShadeFinder from "./pages/ShadeFinder/ShadeFinder.jsx"

// APPLICATION -------------------------------------------------------------------------------------------------------------------------------------|
export default function App() {
    return (
        <SessionProvider>
            <Routes>
                <Route path = "/" element = {<Home />}>
                    <Route index element = {<Overview />} />
                    <Route path = "color-picker" element = {<ColorPicker />} />
                    <Route path = "shade-finder" element = {<ShadeFinder />} />
                    <Route path = "harmony" element = {<Harmony />} />
                    <Route path = "*" element = {<Navigate to = "/" replace />} />
                </Route>
            </Routes>
        </SessionProvider>
    )
}
