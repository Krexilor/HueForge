// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { useEffect, useId, useRef, useState } from "react"
import { Check, ChevronDown } from "lucide-react"

// STYLES ------------------------------------------------------------------------------------------------------------------------------------------|
import styles from "./Dropdown.module.css"

// DROPDOWN ----------------------------------------------------------------------------------------------------------------------------------------|
export default function Dropdown({ value, options, onChange, label, size = "md" }) {
    const [open, setOpen] = useState(false)
    const [active, setActive] = useState(0)
    const rootRef = useRef(null)
    const buttonRef = useRef(null)
    const id = useId()

    const selected = options.find(option => option.value === value) ?? options[0]

    useEffect(() => {
        if (!open) return

        function handlePointerDown(event) {
            if (!rootRef.current.contains(event.target)) setOpen(false)
        }

        document.addEventListener("pointerdown", handlePointerDown)

        return () => document.removeEventListener("pointerdown", handlePointerDown)
    }, [open])

    function openMenu() {
        setActive(Math.max(0, options.findIndex(option => option.value === value)))
        setOpen(true)
    }

    function choose(option) {
        onChange(option.value)
        setOpen(false)
        buttonRef.current.focus()
    }

    function handleKeyDown(event) {
        if (!open) {
            if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
                event.preventDefault()
                openMenu()
            }

            return
        }

        const last = options.length - 1

        const actions = {
            ArrowDown: () => setActive(active === last ? 0 : active + 1),
            ArrowUp: () => setActive(active === 0 ? last : active - 1),
            Home: () => setActive(0),
            End: () => setActive(last),
            Enter: () => choose(options[active]),
            " ": () => choose(options[active]),
            Escape: () => setOpen(false),
            Tab: () => setOpen(false),
        }

        const action = actions[event.key]

        if (!action) return

        if (event.key !== "Tab") event.preventDefault()

        action()
    }

    return (
        <div className = {styles.dropdown} ref = {rootRef}>
            <button
                className = {styles.trigger}
                ref = {buttonRef}
                type = "button"
                data-size = {size}
                aria-label = {label}
                aria-haspopup = "listbox"
                aria-expanded = {open}
                aria-controls = {`${id}-list`}
                onClick = {() => open ? setOpen(false) : openMenu()}
                onKeyDown = {handleKeyDown}
            >
                {selected.swatch && <span className = {styles.dot} style = {{ background: selected.swatch }} />}
                <span className = {styles.value}>{selected.label}</span>
                <ChevronDown className = {styles.chevron} aria-hidden = "true" />
            </button>

            {open && (
                <ul className = {styles.list} id = {`${id}-list`} role = "listbox" aria-label = {label} aria-activedescendant = {`${id}-${active}`}>
                    {options.map((option, index) => (
                        <li
                            key = {option.value}
                            id = {`${id}-${index}`}
                            className = {`${styles.option} ${index === active ? styles.active : ""} ${option.value === value ? styles.selected : ""}`}
                            role = "option"
                            aria-selected = {option.value === value}
                            onMouseEnter = {() => setActive(index)}
                            onMouseDown = {event => event.preventDefault()}
                            onClick = {() => choose(option)}
                        >
                            {option.swatch && <span className = {styles.dot} style = {{ background: option.swatch }} />}
                            {option.label}
                            {option.value === value && <Check className = {styles.check} aria-hidden = "true" />}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
