<p align = "center">
    <img src = "src/assets/logo.png" alt = "HueForge logo" width = "100" />
</p>

<h1 align = "center">HueForge</h1>

<p align = "center">
    <b>Build color systems you can actually ship.</b></br/>
    Turn one brand color into shade scales, harmonies, gradients, light and dark themes, and accessibility reports, all in your browser.
</p>

<p align = "center">
    <a href = "https://hueforge.pages.dev"><img src = "https://img.shields.io/badge/Live%20app-hueforge.pages.dev-2f6fed?style=for-the-badge&labelColor=0b1a3a" alt = "Live app" /></a>
    <img src = "https://img.shields.io/badge/React-19-087ea4?style=for-the-badge&logo=react&logoColor=61dafb&labelColor=20232a" alt = "React 19" />
    <img src = "https://img.shields.io/badge/Vite-8-646cff?style=for-the-badge&logo=vite&logoColor=ffd62e&labelColor=20232a" alt = "Vite 8" />
</p>

---

## Overview

HueForge turns one brand color into a full system: shade scales, semantic tokens, light and dark themes, contrast checks and ready-to-paste exports. There is no account, no backend and nothing to install. Your color follows you between tools, so you can pick it once and keep working.

## Tools

| Tool | What it does |
| --- | --- |
| **Color Picker** | Pick a base color and copy it in any format. Paste hex, rgb, hsl, oklch or a color name. Fine-tune in OKLCH, or use the eyedropper in supported browsers. |
| **Shade Finder** | Generate a 50 to 950 scale with even lightness steps. Choose where your base color sits, tune the lightest and darkest shades, edge chroma taper and hue shift, and see WCAG contrast on every shade. |
| **Harmony** | Build supporting palettes from color wheel rules such as analogous and complementary. Lock colors, assign roles, and preview the result on a mock page with suggested proportions. |
| **Gradient Studio** | Create linear, radial and conic gradients with draggable color stops. Blend in different color spaces such as OKLCH to avoid the muddy middle. Start from presets or from your own colors. |
| **Contrast Checker** | Check WCAG 2 contrast and APCA lightness contrast, preview real text, and auto-fix a failing pair by adjusting lightness only. Test a whole palette at once in a matrix. |
| **Color Vision** | Simulate color blindness on your palette, a sample chart or your own image, and find the color pairs that become hard to tell apart. |
| **Palette Playground** | Turn your role colors (primary, secondary, accent, success, warning, danger) into light and dark themes. Preview them on a dashboard, landing page and components, check accessibility, and export the tokens. |

## Features

- **OKLCH-based color math** keeps perceived lightness steady across hues, which is why the scales look even.
- **Many input formats**: hex, rgb, hsl, oklch and named colors.
- **Accessibility built in**: WCAG 2 ratios, APCA guidance and color vision deficiency simulation.
- **Developer-ready exports**: CSS variables, Tailwind v4, SCSS and JSON, plus dedicated formats for gradients and reports.
- **Shareable links**: share buttons encode the current color and settings in the URL, so a link opens exactly what you were looking at.
- **Responsive**: designed for desktop, tablet and phone.
- **Lightweight**: a static single-page app with only six runtime dependencies.

## Privacy

HueForge collects no user data. There is no analytics, no tracking and no server that receives your input. Everything runs locally in your browser. Images you load in Color Vision are processed on your device and never uploaded.

## Built with

| Libraries/Frameworks | Purpose |
| --- | --- |
| [React 19](https://react.dev/) | UI |
| [Vite](https://vite.dev/) | Build tooling and dev server |
| [React Router](https://reactrouter.com/) | Routing between tools |
| [Culori](https://culorijs.org/) | Color parsing and conversion |
| [JSZip](https://stuk.github.io/jszip/) | Bundling downloads |
| [Lucide](https://lucide.dev/) | Icons |
| CSS Modules | Styling |

## Project Tree

```text
HueForge/
├── src/
│   ├── assets/                             # Logo and static assets
│   ├── components/                         # Reusable React components
│   │   ├── common/                         # Shared controls used across tools
│   │   │   ├── AngleDial/                  # Circular dial for gradient angles
│   │   │   ├── ColorSwatchPicker/          # Color swatch for picking a color
│   │   │   ├── ColorWheel/                 # Draggable hue and chroma wheel
│   │   │   ├── Dropdown/                   # Custom select menu
│   │   │   ├── ExportPanel/                # Code preview with copy and download
│   │   │   ├── GradientBar/                # Gradient bar with draggable stops
│   │   │   ├── ShareButton/                # Shares a link to the current state
│   │   │   └── Slider/                     # Labeled range slider
│   │   ├── layout/                         # App shell
│   │   │   ├── Sidebar/                    # Navigation between tools
│   │   │   └── Titlebar/                   # Top bar
│   │   └── preview/                        # Mock interfaces for theme previews
│   │       └── ThemePreview/               # Dashboard, landing page, components
│   ├── context/                            # React context providers
│   │   └── SessionProvider.jsx             # Session state shared between tools
│   ├── data/                               # Static content
│   │   ├── About.data.js                   # Project and author details
│   │   └── Pages.data.js                   # Tool list: paths, labels, icons
│   ├── hooks/                              # Custom React hooks
│   │   ├── useColorParam.js                # Reads a shared color from the URL
│   │   ├── useCopy.js                      # Clipboard copy with "copied" state
│   │   ├── useNavMode.js                   # Navigation display mode
│   │   ├── useSessionState.js              # State kept for the browser session
│   │   └── useSharedColor.js               # Base color shared by all tools
│   ├── lib/                                # Pure logic with no UI
│   │   ├── Color/                          # Color math and algorithms
│   │   │   ├── Contrast.js                 # WCAG and APCA contrast, auto-fix
│   │   │   ├── Convert.js                  # Parsing, conversion, formatting
│   │   │   ├── Gamut.js                    # sRGB gamut checks and mapping
│   │   │   ├── Gradient.js                 # Gradient building and URL encoding
│   │   │   ├── Harmony.js                  # Color wheel harmony rules
│   │   │   ├── Links.js                    # Links that carry a color between tools
│   │   │   ├── Scale.js                    # 50 to 950 shade scale generation
│   │   │   ├── Theme.js                    # Role palettes, light/dark themes, checks
│   │   │   └── Vision.js                   # Color blindness simulation
│   │   └── Export/                         # Export builders
│   │       ├── GradientExport.js           # Gradient export formats
│   │       ├── Report.js                   # Contrast report formats
│   │       ├── ThemeExport.js              # Theme token formats
│   │       ├── Tokens.js                   # CSS, Tailwind, SCSS, JSON, downloads
│   │       └── VisionReport.js             # Color vision report formats
│   ├── pages/                              # One folder per tool
│   │   ├── ColorPicker/                    # Pick a color, copy it in any format
│   │   ├── ColorVision/                    # Color blindness simulation
│   │   ├── ContrastChecker/                # WCAG and APCA checks, auto-fix
│   │   ├── GradientStudio/                 # Linear, radial and conic gradients
│   │   ├── Harmony/                        # Palettes from color wheel rules
│   │   ├── Overview/                       # Home page
│   │   ├── PalettePlayground/              # Light and dark themes and tokens
│   │   └── ShadeFinder/                    # 50 to 950 shade scales
│   ├── styles/                             # Global styling
│   │   └── global.css                      # Global styles and design tokens
│   ├── App.jsx                             # Routes and app layout
│   └── main.jsx                            # Application entry point
├── .gitignore                              # Files excluded from Git
├── index.html                              # HTML entry for Vite
├── LICENSE                                 # License text
├── package-lock.json                       # Locked dependency versions
├── package.json                            # Scripts and dependencies
├── README.md                               # You are here
└── vite.config.js                          # Vite configuration
```

## Browser support

HueForge works in current versions of Chrome, Edge, Firefox and Safari. A few features depend on the browser:

- The **eyedropper** in Color Picker needs the EyeDropper API, which is available in Chromium-based browsers.
- **Gradient blending** in other color spaces needs CSS color interpolation support. Browsers without it fall back to an sRGB preview, and the export still includes the modern syntax.

## Contributing

Contributions are welcome, whether that is a bug report, a fix, an accessibility improvement or a new idea. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## License

HueForge is licensed under the [MIT License](LICENSE).

Copyright (c) 2026 Krexilor

You are free to use, copy, modify, merge, publish, distribute, sublicense, and sell copies of this software, subject to the terms of the MIT License. The original copyright notice and license text must be included in copies or substantial portions of the software.

### Attribution

If you use or build upon HueForge, attribution to the original project is appreciated.

- **Project:** [HueForge](https://hueforge.pages.dev)
- **Created by:** [Krexilor](https://github.com/Krexilor)
- **Repository:** [Respository](https://github.com/Krexilor/HueForge)

If you distribute a modified version, please make it clear that it is a fork and not the official HueForge project. Do not imply endorsement by the original author.
