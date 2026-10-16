// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { Check, Share2 } from "lucide-react"

// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
import useCopy from "../../../hooks/useCopy.js"

// STYLES ------------------------------------------------------------------------------------------------------------------------------------------|
import styles from "./ShareButton.module.css"

// SHARE BUTTON ------------------------------------------------------------------------------------------------------------------------------------|
export default function ShareButton({ hex, title, params = {} }) {
    const { copied, copy } = useCopy()
    const done = copied === "share"

    async function handleShare() {
        const url = new URL(window.location.href)

        url.search = ""
        url.hash = ""
        url.searchParams.set("c", hex.slice(1))

        Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))

        const link = url.toString()
        const isTouch = window.matchMedia("(pointer: coarse)").matches

        if (isTouch && navigator.share) {
            try {
                await navigator.share({ title, url: link })
            } catch (error) {
                if (error.name !== "AbortError") copy(link, "share")
            }

            return
        }

        copy(link, "share")
    }

    return (
        <button className = {`${styles.button} ${done ? styles.done : ""}`} aria-live = "polite" onClick = {handleShare}>
            {done ? <Check aria-hidden = "true" /> : <Share2 aria-hidden = "true" />}
            {done ? "Link copied" : "Share"}
        </button>
    )
}
