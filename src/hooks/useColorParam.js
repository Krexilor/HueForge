// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { useSearchParams } from "react-router"

// COLOR PARAM HOOK --------------------------------------------------------------------------------------------------------------------------------|
export default function useColorParam() {
    const [params] = useSearchParams()
    const value = params.get("c")

    return value && /^[0-9a-f]{6}$/i.test(value) ? "#" + value.toLowerCase() : null
}
