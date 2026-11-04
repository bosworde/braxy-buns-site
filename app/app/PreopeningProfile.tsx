"use client"
import type { FormEvent } from "react"
import type { Member } from "@/lib/member/model"
import styles from "./member.module.css"

export default function PreopeningProfile({ member, preferredPlan, busy, online, onSave }: { member: Member | null; preferredPlan: string; busy: boolean; online: boolean; onSave: (event: FormEvent<HTMLFormElement>) => void }) {
  return <section className={`${styles.card} ${styles.formCard}`}><span className={styles.badge}>FREE PRE-OPENING REGISTRATION</span><h2 style={{ marginTop: 20 }}>{member ? "Your pre-opening profile" : "Be part of our fresh start."}</h2><p>Save your details and choose the club you’re interested in. No card, deposit, subscription, or payment commitment.</p>
    <form key={`${member?.id || "new"}-${preferredPlan}`} onSubmit={onSave}>
      <div className={styles.formGrid}>
        <label>First name<input name="first_name" defaultValue={member?.first_name || ""} required maxLength={50} autoComplete="given-name" /></label>
        <label>Last name<input name="last_name" defaultValue={member?.last_name || ""} required maxLength={50} autoComplete="family-name" /></label>
        <label className={styles.fullWidth}>Preferred wash club<select name="preferred_plan" defaultValue={preferredPlan}>{["Gecko", "Iguana", "Dragon"].map(plan => <option key={plan}>{plan}</option>)}</select><small>Interest only. You can change your preference anytime before opening.</small></label>
        {[["vehicle_make", "Vehicle make", member?.vehicle_make], ["vehicle_model", "Vehicle model", member?.vehicle_model], ["vehicle_color", "Vehicle color", member?.vehicle_color], ["license_plate", "License plate", member?.license_plate]].map(([name, label, value]) => <label key={name}>{label} <small>Optional</small><input name={name!} defaultValue={value || ""} maxLength={name === "license_plate" ? 10 : 50} autoComplete="off" /></label>)}
      </div>
      <label className={styles.acknowledgement}><input name="acknowledgement" type="checkbox" required /><span>I understand this is free pre-opening registration. A paid membership and wash access require a separate purchase after enrollment opens.</span></label>
      <button className={styles.primaryButton} disabled={busy || !online}>{busy ? "Saving…" : member ? "Save pre-opening profile" : "Join free as a pre-opening member"}</button>
    </form><p className={styles.note}>Opening details and final plans will be announced before paid enrollment begins. <a href="/privacy">Privacy policy</a></p>
  </section>
}
