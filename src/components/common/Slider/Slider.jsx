// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { useId } from "react"

// STYLES ------------------------------------------------------------------------------------------------------------------------------------------|
import styles from "./Slider.module.css"

// SLIDER ------------------------------------------------------------------------------------------------------------------------------------------|
export default function Slider({ label, value, min = 0, max = 100, step = 1, onChange, format = String, disabled = false, gradient }) {
    const id = useId()
    const progress = ((value - min) / (max - min)) * 100
    const style = { "--progress": `${progress}%` }

    if (gradient) style["--track"] = gradient

    return (
        <div className = {styles.slider}>
            <label className = {styles.head} htmlFor = {id}>
                <span>{label}</span>
                <span className = {styles.value}>{format(value)}</span>
            </label>

            <input
                id = {id}
                className = {styles.input}
                type = "range"
                min = {min}
                max = {max}
                step = {step}
                value = {value}
                disabled = {disabled}
                style = {style}
                data-gradient = {gradient ? "true" : undefined}
                onChange = {event => onChange(Number(event.target.value))}
            />
        </div>
    )
}
