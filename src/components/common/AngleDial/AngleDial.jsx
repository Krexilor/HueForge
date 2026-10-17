// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { useRef } from "react"

// STYLES ------------------------------------------------------------------------------------------------------------------------------------------|
import styles from "./AngleDial.module.css"

// ANGLE DIAL --------------------------------------------------------------------------------------------------------------------------------------|
export default function AngleDial({ value, onChange, label = "Angle" }) {
    const ref = useRef(null)

    function move(event) {
        const rect = ref.current.getBoundingClientRect()
        const dx = event.clientX - (rect.left + rect.width / 2)
        const dy = event.clientY - (rect.top + rect.height / 2)
        const angle = (((Math.atan2(dx, -dy) * 180) / Math.PI) + 360) % 360

        onChange(event.shiftKey ? (Math.round(angle / 15) * 15) % 360 : Math.round(angle) % 360)
    }

    function handlePointerDown(event) {
        event.currentTarget.setPointerCapture(event.pointerId)
        move(event)
    }

    function handlePointerMove(event) {
        if (event.buttons === 1) move(event)
    }

    function handleKeyDown(event) {
        const step = event.shiftKey ? 15 : 1
        const delta = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step }[event.key]

        if (delta === undefined) return

        event.preventDefault()
        onChange((value + delta + 360) % 360)
    }

    return (
        <div
            className = {styles.dial}
            ref = {ref}
            role = "slider"
            tabIndex = {0}
            aria-label = {label}
            aria-valuemin = {0}
            aria-valuemax = {360}
            aria-valuenow = {value}
            onPointerDown = {handlePointerDown}
            onPointerMove = {handlePointerMove}
            onKeyDown = {handleKeyDown}
        >
            <span className = {styles.needle} style = {{ transform: `rotate(${value}deg)` }} />
            <span className = {styles.center} />
        </div>
    )
}
