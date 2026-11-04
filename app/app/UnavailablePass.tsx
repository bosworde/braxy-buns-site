"use client"

import Link from "next/link"
import { QrCode } from "lucide-react"
import { membershipMessage } from "@/lib/member/membership-message"
import styles from "./member.module.css"

type Props = {
  status: string | null | undefined; hasMember: boolean; billingAvailable: boolean;
  busy: boolean; online: boolean; onBilling: () => void; onRefresh: () => void;
}

export default function UnavailablePass({ status, hasMember, billingAvailable, busy, online, onBilling, onRefresh }: Props) {
  const notice = membershipMessage(status)
  return <>
    <QrCode size={34} aria-hidden="true" />
    <h2>{hasMember ? notice.title : "No membership linked yet"}</h2>
    <p role="status">{hasMember ? notice.description : "Use the email you joined with. After checkout, refresh to load your membership."}</p>
    {billingAvailable ? <button className={styles.primaryButton} onClick={onBilling} disabled={busy || !online}>{busy ? "Opening…" : notice.payment ? "Fix payment securely" : "Manage billing securely"}</button>
      : <Link href="/join" className={styles.primaryButton}>Explore membership</Link>}
    <button className={styles.secondaryButton} onClick={onRefresh} disabled={busy || !online}>Refresh membership</button>
  </>
}
