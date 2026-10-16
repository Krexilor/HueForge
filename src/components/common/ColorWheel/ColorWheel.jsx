// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { useEffect, useRef } from "react"

// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
import { maxChroma, oklchToRgb } from "../../../lib/Color/Gamut.js"

// STYLES ------------------------------------------------------------------------------------------------------------------------------------------|
import styles from "./ColorWheel.module.css"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
const RADIUS = 46
const SIZE = 300

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value))
}

function relativeChroma({ l, c, h }) {
    const limit = maxChroma(l, h)

    return limit > 0 ? clamp(c / limit, 0, 1) : 0
}

function position(color) {
    const distance = relativeChroma(color) * RADIUS
    const angle = (color.h * Math.PI) / 180

    return { x: 50 + distance * Math.cos(angle), y: 50 - distance * Math.sin(angle) }
}

// COLOR WHEEL -------------------------------------------------------------------------------------------------------------------------------------|
export default function ColorWheel({ colors, onChange }) {
    const ref = useRef(null)
    const canvasRef = useRef(null)
    const lightness = Math.round(colors[0].l * 200) / 200
    const points = colors.map(position)

    useEffect(() => {
        const context = canvasRef.current.getContext("2d")
        const image = context.createImageData(SIZE, SIZE)
        const limits = Array.from({ length: 360 }, (_, degree) => maxChroma(lightness, degree))
        const scale = SIZE / 100

        for (let y = 0; y < SIZE; y++) {
            for (let x = 0; x < SIZE; x++) {
                const dx = (x + 0.5) / scale - 50
                const dy = 50 - (y + 0.5) / scale
                const distance = Math.hypot(dx, dy)

                if (distance > RADIUS + 0.5) continue

                const hue = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360
                const chroma = Math.min(distance / RADIUS, 1) * limits[Math.round(hue) % 360]
                const [r, g, b] = oklchToRgb(lightness, chroma, hue)
                const index = (y * SIZE + x) * 4

                image.data[index] = r
                image.data[index + 1] = g
                image.data[index + 2] = b
                image.data[index + 3] = clamp((RADIUS - distance) * scale + 0.5, 0, 1) * 255
            }
        }

        context.putImageData(image, 0, 0)
    }, [lightness])

    function emit(h, relative) {
        onChange({ h, c: relative * maxChroma(colors[0].l, h) })
    }

    function move(event) {
        const rect = ref.current.getBoundingClientRect()
        const x = ((event.clientX - rect.left) / rect.width) * 100 - 50
        const y = 50 - ((event.clientY - rect.top) / rect.height) * 100

        emit(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360, clamp(Math.hypot(x, y) / RADIUS, 0, 1))
    }

    function handlePointerDown(event) {
        event.currentTarget.setPointerCapture(event.pointerId)
        move(event)
    }

    function handlePointerMove(event) {
        if (event.buttons === 1) move(event)
    }

    function handleKeyDown(event) {
        const base = colors[0]
        const step = event.shiftKey ? 10 : 1
        const relative = relativeChroma(base)

        const actions = {
            ArrowLeft: () => emit((base.h + step + 360) % 360, relative),
            ArrowRight: () => emit((base.h - step + 360) % 360, relative),
            ArrowUp: () => emit(base.h, clamp(relative + step * 0.02, 0, 1)),
            ArrowDown: () => emit(base.h, clamp(relative - step * 0.02, 0, 1)),
        }

        const action = actions[event.key]

        if (!action) return

        event.preventDefault()
        action()
    }

    return (
        <div
            className = {styles.wheel}
            ref = {ref}
            tabIndex = {0}
            role = "application"
            aria-label = "Base color on the color wheel. Drag, or use the arrow keys."
            onPointerDown = {handlePointerDown}
            onPointerMove = {handlePointerMove}
            onKeyDown = {handleKeyDown}
        >
            <canvas className = {styles.canvas} ref = {canvasRef} width = {SIZE} height = {SIZE} aria-hidden = "true" />

            <svg className = {styles.svg} viewBox = "0 0 100 100" aria-hidden = "true">
                <circle className = {styles.ring} cx = {50} cy = {50} r = {RADIUS} />
                <polygon className = {styles.shape} points = {points.map(point => `${point.x},${point.y}`).join(" ")} />

                {points.map((point, index) => (
                    <line key = {`line-${index}`} className = {styles.spoke} x1 = {50} y1 = {50} x2 = {point.x} y2 = {point.y} />
                ))}

                {points.map((point, index) => (
                    <circle
                        key = {`dot-${index}`}
                        className = {index === 0 ? styles.baseDot : styles.dot}
                        cx = {point.x}
                        cy = {point.y}
                        r = {index === 0 ? 5.5 : 4.2}
                        fill = {colors[index].hex}
                    />
                ))}
            </svg>
        </div>
    )
}
