// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { LayoutDashboard, Pipette, Layers, Blend, Rainbow, Contrast, Eye, PanelsTopLeft } from "lucide-react"

// PAGES -------------------------------------------------------------------------------------------------------------------------------------------|
export const pages = [
    { path: "/", label: "Overview", icon: LayoutDashboard, description: "What HueForge does and where to start." },
    { path: "/color-picker", label: "Color Picker", icon: Pipette, description: "Pick a base color with sliders, hex, or the eyedropper." },
    { path: "/shade-finder", label: "Shade Finder", icon: Layers, description: "A 50 to 950 scale with even lightness steps." },
    { path: "/harmony", label: "Harmony", icon: Blend, description: "Analogous, triad, split and more on a color wheel." },
    { path: "/gradient-studio", label: "Gradient Studio", icon: Rainbow, description: "Linear, radial and conic gradients with draggable stops." },
    { path: "/contrast-checker", label: "Contrast Checker", icon: Contrast, description: "WCAG pass or fail for every text and background pair." },
    { path: "/color-vision", label: "Color Vision", icon: Eye, description: "See your palette through four types of color blindness." },
    { path: "/palette-playground", label: "Palette Playground", icon: PanelsTopLeft, description: "Try your palette on realistic interface components." }
]
