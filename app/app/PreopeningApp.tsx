import Link from "next/link"
import Image from "next/image"
import { Check, ArrowUpRight, Heart } from "lucide-react"
import { plans } from "@/lib/member/model"
import styles from "./member.module.css"

export default function PreopeningApp() {
  return <div className={styles.app}>
    <main style={{ maxWidth: 1250, margin: "0 auto", padding: "24px clamp(20px, 4vw, 48px) 60px" }}>
      <header className={styles.topbar}><Link href="/"><Image src="/logo.png" alt="Braxy Buns Car Wash" width={190} height={72} priority style={{ height: "auto", maxWidth: "45vw" }} /></Link><span className={styles.status}>COMING SOON</span></header>
      <section className={styles.intro} style={{ paddingTop: 40 }}><div><p className={styles.eyebrow}>THE BRAXY BUNS CLUB</p><h1>Your next fresh start is coming.</h1><p>Premium washes. A brighter day. A bigger purpose.</p></div></section>
      <section className={styles.card} style={{ marginBottom: 32 }}>
        <h2>Meet your future wash club.</h2><p>We’re preparing to open. Explore our planned memberships below.</p>
        <p><strong>Membership enrollment and payments are not open yet.</strong> No subscription or charge is created here. We’ll announce opening details before enrollment begins.</p>
        <Link href="/contact" className={styles.primaryButton}>Ask about opening <ArrowUpRight size={18} /></Link>
      </section>
      <section id="plans" aria-label="Planned wash clubs" className={styles.plans}>{plans.map((plan, index) => <article className={styles.card} key={plan.name}>
        <div className={styles.tierHead}><p className={styles.eyebrow}>LEVEL 0{index + 1}</p></div>
        <Image src={plan.image} alt={`${plan.name} mascot`} width={90} height={180} className={styles.tierImage} />
        <h2>{plan.name} Wash Club</h2><p>{plan.description}</p><div className={styles.price}>${plan.price}<span>/ month · planned</span></div>
        <ul>{plan.features.map(feature => <li key={feature}><Check size={15} />{feature}</li>)}</ul>
        <span className={styles.badge}>ENROLLMENT COMING SOON</span>
      </article>)}</section>
      <section className={styles.card} style={{ marginTop: 32 }}><Heart size={28} /><h2>A little shine. A bigger purpose.</h2><p>Meaningful opportunities for neurodiverse people, one wash at a time.</p><Link href="/inclusion" className={styles.secondaryButton}>Meet our mission <ArrowUpRight size={16} /></Link></section>
      <p className={styles.note} style={{ marginTop: 24 }}>Plans and opening details will be confirmed before paid enrollment begins.</p>
      <Link href="/" className={styles.back}>← Back to braxybuns.com</Link>
    </main>
  </div>
}
