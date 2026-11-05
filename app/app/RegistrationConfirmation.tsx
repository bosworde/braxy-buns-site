"use client"
import { useEffect, useRef } from "react"
import Image from "next/image"
import { CheckCircle2, Heart, X } from "lucide-react"
import { plans } from "@/lib/member/model"
import styles from "./member.module.css"

export type RegistrationSuccess = { firstName: string; plan: string; isNew: boolean }
export default function RegistrationConfirmation({ registration, onContinue, onClose }: { registration: RegistrationSuccess; onContinue: () => void; onClose: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null)
  const panel = useRef<HTMLElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    heading.current?.focus()
    return () => { document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus() }
  }, [])
  const plan = plans.find(plan => plan.name === registration.plan)
  return <div className={styles.successOverlay} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <section ref={panel} role="dialog" aria-modal="true" aria-labelledby="registration-success-title" aria-describedby="registration-success-description" className={styles.successCard} onKeyDown={event => {
      if (event.key === "Escape") { event.preventDefault(); onClose() }
      if (event.key !== "Tab") return
      const controls = panel.current?.querySelectorAll<HTMLButtonElement>("button")
      const first = controls?.[0]; const last = controls?.[controls.length - 1]
      if (event.shiftKey && (document.activeElement === first || document.activeElement === heading.current)) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }}>
      <button className={styles.close} aria-label="Close registration confirmation" onClick={onClose}><X size={24} /></button>
      <CheckCircle2 className={styles.successCheck} size={56} aria-hidden="true" />
      <p className={styles.eyebrow}>{registration.isNew ? "WELCOME TO THE BRAXY BUNS CLUB" : "ALL SAVED"}</p>
      <h2 ref={heading} tabIndex={-1} id="registration-success-title">{registration.isNew ? `You’re in${registration.firstName ? `, ${registration.firstName}` : ""}!` : "Your profile is updated!"}</h2>
      <p id="registration-success-description">{registration.isNew ? "Your free pre-opening registration is complete. Thanks for being part of our fresh start!" : "Your latest details and club preference have been saved."}</p>
      {plan && <div className={styles.successPlan}><Image src={plan.image} alt={`${plan.name} mascot`} width={110} height={110} /><div><span>Your preferred club</span><strong>{plan.name} Wash Club</strong></div></div>}
      <p className={styles.successFree}><CheckCircle2 size={18} /> Free registration · no payment or subscription created</p>
      <p className={styles.note}>Wash access and paid memberships become available after opening and a separate enrollment.</p>
      <button className={styles.primaryButton} onClick={onContinue}>{registration.isNew ? "Explore my club" : "Back to my overview"}</button>
      <button className={styles.secondaryButton} onClick={onClose}>Review my profile</button>
      <p className={styles.successPurpose}><Heart size={16} /> A little shine. A bigger purpose.</p>
    </section>
  </div>
}
