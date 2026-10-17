// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { useRef } from "react"

// STYLES ------------------------------------------------------------------------------------------------------------------------------------------|
import styles from "./GradientBar.module.css"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
function clamp(value) {
    return Math.min(100, Math.max(0, value))
}

// GRADIENT BAR ------------------------------------------------------------------------------------------------------------------------------------|
export default function GradientBar({ stops, selectedId, background, onSelect, onMove, onAdd, onRemove }) {
    const trackRef = useRef(null)

    function positionOf(event) {
        const rect = trackRef.current.getBoundingClientRect()

        return Math.round(clamp(((event.clientX - rect.left) / rect.width) * 100))
    }

    function handleTrackDown(event) {
        if (event.target === event.currentTarget) onAdd(positionOf(event))
    }

    function handleDown(event, id) {
        event.currentTarget.setPointerCapture(event.pointerId)
        onSelect(id)
    }

    function handleMove(event, id) {
        if (event.buttons === 1) onMove(id, positionOf(event))
    }

    function handleKeyDown(event, stop) {
        const step = event.shiftKey ? 10 : 1

        if (event.key === "ArrowLeft") {
            event.preventDefault()
            onMove(stop.id, clamp(stop.position - step))
        } else if (event.key === "ArrowRight") {
            event.preventDefault()
            onMove(stop.id, clamp(stop.position + step))
        } else if (event.key === "Delete" || event.key === "Backspace") {
            event.preventDefault()
            onRemove(stop.id)
        }
    }

    return (
        <div className = {styles.track} ref = {trackRef} style = {{ backgroundImage: background }} onPointerDown = {handleTrackDown}>
            {stops.map(stop => (
                <button
                    key = {stop.id}
                    type = "button"
                    className = {`${styles.handle} ${stop.id === selectedId ? styles.selected : ""}`}
                    style = {{ left: `${stop.position}%`, background: stop.color }}
                    aria-label = {`Color stop ${stop.color} at ${Math.round(stop.position)} percent`}
                    aria-pressed = {stop.id === selectedId}
                    onPointerDown = {event => handleDown(event, stop.id)}
                    onPointerMove = {event => handleMove(event, stop.id)}
                    onFocus = {() => onSelect(stop.id)}
                    onKeyDown = {event => handleKeyDown(event, stop)}
                />
            ))}
        </div>
    )
}
