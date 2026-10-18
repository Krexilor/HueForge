// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { Layers, ShieldCheck, Zap } from "lucide-react"

// STYLES ------------------------------------------------------------------------------------------------------------------------------------------|
import styles from "./ThemePreview.module.css"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
const FEATURES = [
    { title: "Fast by default", text: "Pages load instantly, even on slow connections.", role: "primary", icon: Zap },
    { title: "Safe and private", text: "Your data stays yours, with sensible defaults.", role: "secondary", icon: ShieldCheck },
    { title: "Built to scale", text: "Start small and grow without rewriting anything.", role: "accent", icon: Layers }
]

// LANDING -----------------------------------------------------------------------------------------------------------------------------------------|
export default function Landing() {
    return (
        <div className = {styles.landing}>
            <nav className = {styles.navbar}>
                <b className = {styles.brand}>
                    <span className = {styles.logo} />
                    Acme
                </b>

                <span className = {styles.links}>
                    <span>Product</span>
                    <span>Pricing</span>
                    <span>Docs</span>
                </span>

                <button className = {`${styles.solid} ${styles.primary}`}>Sign up</button>
            </nav>

            <section className = {styles.hero}>
                <span className = {`${styles.badge} ${styles.primary}`}>New release</span>
                <h2 className = {styles.headline}>Ship products your whole team loves</h2>
                <p className = {styles.lead}>A calm, focused workspace for planning, building and launching, all in one place.</p>

                <div className = {styles.row}>
                    <button className = {`${styles.solid} ${styles.primary}`}>Get started</button>
                    <button className = {`${styles.outline} ${styles.secondary}`}>See how it works</button>
                </div>
            </section>

            <section className = {styles.features}>
                {FEATURES.map(({ title, text, role, icon: Icon }) => (
                    <article key = {title} className = {`${styles.card} ${styles.feature}`}>
                        <span className = {`${styles.icon} ${styles[role]}`}>
                            <Icon aria-hidden = "true" />
                        </span>

                        <b>{title}</b>
                        <span className = {styles.muted}>{text}</span>
                    </article>
                ))}
            </section>

            <section className = {`${styles.cta} ${styles.primary}`}>
                <div>
                    <b className = {styles.ctaTitle}>Ready to try it?</b>
                    <p>Start free. No credit card needed.</p>
                </div>

                <button className = {`${styles.solid} ${styles.accent}`}>Create account</button>
            </section>
        </div>
    )
}
