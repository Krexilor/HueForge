// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { useLayoutEffect } from "react"

// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
import { toHex, toLch } from "../lib/Color/Convert.js"
import useColorParam from "./useColorParam.js"
import useSessionState from "./useSessionState.js"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
export const DEFAULT_HEX = "#2f6fed"

const DEFAULT_LCH = toLch(DEFAULT_HEX)

// SHARED COLOR HOOK -------------------------------------------------------------------------------------------------------------------------------|
export default function useSharedColor() {
    const param = useColorParam()
    const [lch, setLch] = useSessionState("color", DEFAULT_LCH)

    useLayoutEffect(() => {
        if (param) setLch(toLch(param))
    }, [param])

    return { lch, setLch, hex: toHex(lch), setHex: next => setLch(toLch(next)) }
}
