// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { LayoutDashboard, Pipette, Layers, Blend, Rainbow, Contrast, Eye, PanelsTopLeft } from "lucide-react"

// PAGES -------------------------------------------------------------------------------------------------------------------------------------------|
export const pages = [
    { path: "/", label: "Overview", icon: LayoutDashboard, description: "What HueForge does and where to start." },
    { path: "/color-picker", label: "Color Picker", icon: Pipette, group: "Create", description: "Pick a base color with sliders, hex, or the eyedropper." },
    { path: "/shade-finder", label: "Shade Finder", icon: Layers, group: "Create", description: "A 50 to 950 scale with even lightness steps." },
    { path: "/harmony", label: "Harmony", icon: Blend, group: "Create", description: "Analogous, triad, split and more on a color wheel." },
    { path: "/gradient-studio", label: "Gradient Studio", icon: Rainbow, group: "Create", description: "Linear, radial and conic gradients with draggable stops." },
    { path: "/contrast-checker", label: "Contrast Checker", icon: Contrast, group: "Check", description: "WCAG pass or fail for every text and background pair." },
    { path: "/color-vision", label: "Color Vision", icon: Eye, group: "Check", description: "See your palette through four types of color blindness." },
    { path: "/palette-playground", label: "Palette Playground", icon: PanelsTopLeft, group: "Apply", description: "Try your palette on realistic interface components." }
]
