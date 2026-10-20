// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { useEffect, useState } from "react"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
const DRAWER = "(max-width: 699px), (pointer: coarse) and (max-width: 1099px) and (orientation: portrait), (pointer: coarse) and (max-height: 500px)"
const RAIL = "(max-width: 1099px)"

function read() {
    if (window.matchMedia(DRAWER).matches) return "drawer"

    return window.matchMedia(RAIL).matches ? "rail" : "full"
}

// NAV MODE ----------------------------------------------------------------------------------------------------------------------------------------|
export default function useNavMode() {
    const [mode, setMode] = useState(read)

    useEffect(() => {
        const lists = [window.matchMedia(DRAWER), window.matchMedia(RAIL)]
        const update = () => setMode(read())

        lists.forEach(list => list.addEventListener("change", update))

        return () => lists.forEach(list => list.removeEventListener("change", update))
    }, [])

    return mode
}
