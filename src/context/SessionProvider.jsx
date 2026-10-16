// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { createContext, useCallback, useMemo, useState } from "react"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
export const SessionContext = createContext(null)

// SESSION PROVIDER --------------------------------------------------------------------------------------------------------------------------------|
export default function SessionProvider({ children }) {
    const [store, setStore] = useState({})

    const set = useCallback((key, updater) => {
        setStore(current => ({ ...current, [key]: updater(current[key]) }))
    }, [])

    const value = useMemo(() => ({ store, set }), [store, set])

    return <SessionContext.Provider value = {value}>{children}</SessionContext.Provider>
}
