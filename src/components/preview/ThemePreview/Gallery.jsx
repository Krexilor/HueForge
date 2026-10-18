// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { Check } from "lucide-react"

// STYLES ------------------------------------------------------------------------------------------------------------------------------------------|
import styles from "./ThemePreview.module.css"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
const ROLE_LABELS = [
    ["primary", "Primary"],
    ["secondary", "Secondary"],
    ["accent", "Accent"],
    ["success", "Success"],
    ["warning", "Warning"],
    ["danger", "Danger"]
]

const TABS = ["Overview", "Activity", "Billing"]

// COMPONENT GALLERY -------------------------------------------------------------------------------------------------------------------------------|
export default function Gallery() {
    return (
        <div className = {styles.gallery}>
            <section className = {styles.card}>
                <b>Buttons</b>

                <div className = {styles.row}>
                    {ROLE_LABELS.map(([role, label]) => (
                        <button key = {role} className = {`${styles.solid} ${styles[role]}`}>{label}</button>
                    ))}
                </div>

                <div className = {styles.row}>
                    <button className = {`${styles.soft} ${styles.primary}`}>Soft</button>
                    <button className = {`${styles.outline} ${styles.primary}`}>Outline</button>
                    <button className = {`${styles.ghost} ${styles.primary}`}>Ghost</button>
                    <button className = {`${styles.solid} ${styles.primary} ${styles.disabled}`} disabled>Disabled</button>
                </div>
            </section>

            <section className = {styles.card}>
                <b>Form</b>

                <input className = {styles.input} placeholder = "Email address" aria-label = "Email address" readOnly />
                <input className = {`${styles.input} ${styles.focus}`} defaultValue = "Focused field" aria-label = "Focused field" readOnly />

                <div className = {styles.controls}>
                    <span className = {styles.option}>
                        <span className = {`${styles.check} ${styles.primary}`}><Check aria-hidden = "true" /></span>
                        Checked
                    </span>

                    <span className = {styles.option}>
                        <span className = {`${styles.toggle} ${styles.primary}`} data-on = "true" />
                        On
                    </span>

                    <span className = {styles.option}>
                        <span className = {styles.toggle} />
                        Off
                    </span>
                </div>
            </section>

            <section className = {styles.card}>
                <b>Badges</b>

                <div className = {styles.row}>
                    {ROLE_LABELS.map(([role, label]) => (
                        <span key = {role} className = {`${styles.badge} ${styles[role]}`}>{label}</span>
                    ))}
                </div>

                <b>Tabs and progress</b>

                <div className = {styles.tabs}>
                    {TABS.map((tab, index) => (
                        <span key = {tab} className = {`${styles.tab} ${index === 0 ? styles.tabActive : ""}`}>{tab}</span>
                    ))}
                </div>

                <div className = {styles.progress}>
                    <span className = {`${styles.fill} ${styles.primary}`} style = {{ width: "64%" }} />
                </div>
            </section>

            <section className = {styles.card}>
                <b>Alerts</b>

                <div className = {`${styles.alert} ${styles.success}`}>Changes saved.</div>
                <div className = {`${styles.alert} ${styles.warning}`}>Your trial ends in 3 days.</div>
                <div className = {`${styles.alert} ${styles.danger}`}>Payment failed.</div>
                <div className = {`${styles.alert} ${styles.primary}`}>A new version is available.</div>
            </section>
        </div>
    )
}
