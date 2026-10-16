// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { useCallback, useRef, useState } from "react"

// COPY HOOK ---------------------------------------------------------------------------------------------------------------------------------------|
export default function useCopy() {
    const [copied, setCopied] = useState(null)
    const timer = useRef(null)

    const copy = useCallback(async (text, key = text) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(key)
            clearTimeout(timer.current)
            timer.current = setTimeout(() => setCopied(null), 1400)
        } catch {
            setCopied(null)
        }
    }, [])

    return { copied, copy }
}
