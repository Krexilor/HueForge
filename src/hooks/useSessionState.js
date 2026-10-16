// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { useCallback, useContext } from "react"

// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
import { SessionContext } from "../context/SessionProvider.jsx"

// SESSION STATE HOOK ------------------------------------------------------------------------------------------------------------------------------|
export default function useSessionState(key, initial) {
    const { store, set } = useContext(SessionContext)
    const value = key in store ? store[key] : initial

    const setValue = useCallback(next => {
        set(key, current => typeof next === "function" ? next(current === undefined ? initial : current) : next)
    }, [key, initial, set])

    return [value, setValue]
}
