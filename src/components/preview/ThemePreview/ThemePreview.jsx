// COMPONENTS --------------------------------------------------------------------------------------------------------------------------------------|
import Gallery from "./Gallery.jsx"
import Landing from "./Landing.jsx"
import Dashboard from "./Dashboard.jsx"

// HELPERS -----------------------------------------------------------------------------------------------------------------------------------------|
import { previewStyle } from "../../../lib/Color/Theme.js"

// STYLES ------------------------------------------------------------------------------------------------------------------------------------------|
import styles from "./ThemePreview.module.css"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
const VIEWS = { dashboard: Dashboard, landing: Landing, components: Gallery }

// THEME PREVIEW -----------------------------------------------------------------------------------------------------------------------------------|
export default function ThemePreview({ theme, radius, template }) {
    const View = VIEWS[template]

    return (
        <div className = {styles.frame} style = {previewStyle(theme, radius)}>
            <View />
        </div>
    )
}
