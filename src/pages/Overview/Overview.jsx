// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { Link } from "react-router"
import { ExternalLink } from "lucide-react"

// DATA --------------------------------------------------------------------------------------------------------------------------------------------|
import { pages } from "../../data/Pages.data.js"
import { project, author } from "../../data/About.data.js"

// STYLES ------------------------------------------------------------------------------------------------------------------------------------------|
import styles from "./Overview.module.css"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
const SHADES = ["#eef3fe", "#dde8fc", "#bcd1f9", "#8fb2f5", "#5f8ff0", "#2f6fed", "#1f58cf", "#1a46a5", "#17387f", "#122a5c", "#0b1a3a"]
const TOOLS = pages.filter(page => page.path !== "/")

// APPLICATION -------------------------------------------------------------------------------------------------------------------------------------|
export default function Overview() {
    return (
        <div className = {styles.overview}>
            <section className = {styles.hero}>
                <h1 className = {styles.title}>Build color systems you can actually ship</h1>

                <p className = {styles.text}>
                    HueForge turns one brand color into a full system: shade scales, semantic tokens, light and dark themes,
                    contrast checks and exports. Everything runs in your browser. Pick a tool below or from the sidebar.
                </p>

                <div className = {styles.actions}>
                    <Link to = "/color-picker" className = {styles.primary}>Start with a color</Link>
                    <Link to = "/export" className = {styles.secondary}>Jump to export</Link>
                </div>

                <div className = {styles.strip} aria-hidden = "true">
                    {SHADES.map(color => <span key = {color} style = {{ background: color }} />)}
                </div>
            </section>

            <section className = {styles.tools} aria-label = "Tools">
                {TOOLS.map(({ path, label, description, icon: Icon }) => (
                    <Link key = {path} to = {path} className = {styles.tool}>
                        <div className = {styles.top}>
                            <Icon className = {styles.icon} aria-hidden = "true" />
                            <h2 className = {styles.name}>{label}</h2>
                        </div>
                        <p className = {styles.description}>{description}</p>
                    </Link>
                ))}
            </section>

            <section className = {styles.about} aria-label = "About">
                <article className = {styles.card}>
                    <h2 className = {styles.heading}>About the project</h2>
                    <p className = {styles.description}>{project.description}</p>

                    <ul className = {styles.stack}>
                        {project.stack.map(item => <li key = {item} className = {styles.tag}>{item}</li>)}
                    </ul>

                    <div className = {styles.links}>
                        {project.links.map(({ label, href }) => (
                            <a key = {href} href = {href} target = "_blank" rel = "noreferrer" className = {styles.link}>
                                {label}
                                <ExternalLink className = {styles.linkIcon} aria-hidden = "true" />
                            </a>
                        ))}
                    </div>
                </article>

                <article className = {styles.card}>
                    <h2 className = {styles.heading}>About me</h2>
                    <p className = {styles.person}>{author.name} <span>- {author.role}</span></p>
                    <p className = {styles.description}>{author.bio}</p>

                    <div className = {styles.links}>
                        {author.links.map(({ label, href }) => (
                            <a key = {href} href = {href} target = "_blank" rel = "noreferrer" className = {styles.link}>
                                {label}
                                <ExternalLink className = {styles.linkIcon} aria-hidden = "true" />
                            </a>
                        ))}
                    </div>
                </article>
            </section>
        </div>
    )
}
