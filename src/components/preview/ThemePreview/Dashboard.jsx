// LIBRARIES ---------------------------------------------------------------------------------------------------------------------------------------|
import { FileText, LayoutDashboard, Search, Settings, Users } from "lucide-react"

// STYLES ------------------------------------------------------------------------------------------------------------------------------------------|
import styles from "./ThemePreview.module.css"

// CONSTANTS ---------------------------------------------------------------------------------------------------------------------------------------|
const NAV = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "Reports", icon: FileText },
    { label: "Customers", icon: Users },
    { label: "Settings", icon: Settings }
]

const STATS = [
    { label: "Revenue", value: "$48.2k", trend: "+12%", good: true },
    { label: "Active users", value: "2,914", trend: "+4%", good: true },
    { label: "Refunds", value: "37", trend: "+9%", good: false }
]

const BARS = [38, 52, 44, 68, 60, 82, 74]

const ROWS = [
    { name: "Northwind", plan: "Team", status: "Paid", role: "success" },
    { name: "Globex", plan: "Starter", status: "Pending", role: "warning" },
    { name: "Initech", plan: "Team", status: "Failed", role: "danger" },
    { name: "Umbrella", plan: "Business", status: "Paid", role: "success" }
]

// DASHBOARD ---------------------------------------------------------------------------------------------------------------------------------------|
export default function Dashboard() {
    return (
        <div className = {styles.dashboard}>
            <aside className = {styles.side}>
                <div className = {styles.brand}>
                    <span className = {styles.logo} />
                    Acme
                </div>

                <nav className = {styles.nav}>
                    {NAV.map(({ label, icon: Icon }, index) => (
                        <span key = {label} className = {`${styles.navItem} ${index === 0 ? styles.active : ""}`}>
                            <Icon aria-hidden = "true" />
                            {label}
                        </span>
                    ))}
                </nav>
            </aside>

            <div className = {styles.main}>
                <header className = {styles.topbar}>
                    <span className = {styles.search}>
                        <Search aria-hidden = "true" />
                        Search reports
                    </span>

                    <button className = {`${styles.solid} ${styles.primary}`}>New report</button>
                    <span className = {styles.avatar} />
                </header>

                <div className = {`${styles.alert} ${styles.warning}`}>
                    <b>Heads up.</b> Three invoices are waiting for review.
                </div>

                <div className = {styles.stats}>
                    {STATS.map(item => (
                        <div key = {item.label} className = {`${styles.card} ${styles.stat}`}>
                            <span className = {styles.muted}>{item.label}</span>
                            <b className = {styles.value}>{item.value}</b>
                            <span className = {`${styles.badge} ${item.good ? styles.success : styles.danger}`}>{item.trend}</span>
                        </div>
                    ))}
                </div>

                <div className = {styles.panels}>
                    <section className = {styles.card}>
                        <div className = {styles.cardHead}>
                            <b>Weekly revenue</b>
                            <span className = {`${styles.badge} ${styles.accent}`}>Live</span>
                        </div>

                        <div className = {styles.chart}>
                            {BARS.map((height, index) => (
                                <span key = {index} className = {`${styles.bar} ${index === BARS.length - 1 ? styles.accent : styles.primary}`} style = {{ height: `${height}%` }} />
                            ))}
                        </div>
                    </section>

                    <section className = {styles.card}>
                        <div className = {styles.cardHead}>
                            <b>Recent invoices</b>
                            <button className = {`${styles.ghost} ${styles.primary}`}>View all</button>
                        </div>

                        <ul className = {styles.list}>
                            {ROWS.map(row => (
                                <li key = {row.name} className = {styles.rowItem}>
                                    <span>
                                        <b>{row.name}</b> <span className = {styles.muted}>{row.plan}</span>
                                    </span>

                                    <span className = {`${styles.badge} ${styles[row.role]}`}>{row.status}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    )
}
