// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { Routes, Route } from "react-router"

// PAGES -------------------------------------------------------------------------------------------------------------------------------------------|
import Home from "./pages/Home.jsx"
import Overview from "./pages/Overview/Overview.jsx"

// APPLICATION -------------------------------------------------------------------------------------------------------------------------------------|
export default function App() {
    return (
        <Routes>
            <Route path = "/" element = {<Home />}>
                <Route index element = {<Overview />} />
            </Route>
        </Routes>
    )
}
