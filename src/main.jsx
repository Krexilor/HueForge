// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { StrictMode } from "react"
import { BrowserRouter } from "react-router"
import { createRoot } from "react-dom/client"

// STYLES ------------------------------------------------------------------------------------------------------------------------------------------|
import "./styles/global.css"

// APPLICATION -------------------------------------------------------------------------------------------------------------------------------------|
import App from "./App.jsx"

// RENDER ------------------------------------------------------------------------------------------------------------------------------------------|
const root = createRoot(document.getElementById("root"))

root.render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>
)
