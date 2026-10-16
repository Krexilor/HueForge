// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { LayoutDashboard, Pipette, Layers, Blend, Contrast, Moon, Eye, PanelsTopLeft, Download } from "lucide-react"

// PAGES -------------------------------------------------------------------------------------------------------------------------------------------|
export const pages = [
    { path: "/", label: "Overview", icon: LayoutDashboard, description: "What HueForge does and where to start." },
    { path: "/color-picker", label: "Color Picker", icon: Pipette, description: "Pick a base color with sliders, hex, or the eyedropper." },
    { path: "/shade-finder", label: "Shade Finder", icon: Layers, description: "A 50 to 950 scale with even lightness steps." },
    { path: "/harmony", label: "Harmony", icon: Blend, description: "Analogous, triad, split and more on a color wheel." },
    { path: "/contrast-checker", label: "Contrast Checker", icon: Contrast, description: "WCAG pass or fail for every text and background pair." },
    { path: "/dark-mode", label: "Dark Mode", icon: Moon, description: "Light and dark tokens tuned side by side." },
    { path: "/color-vision", label: "Color Vision", icon: Eye, description: "See your palette through four types of color blindness." }
]
