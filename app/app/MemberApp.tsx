"use client"

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import { QRCodeCanvas } from "qrcode.react"
import { Home, QrCode, Sparkles, Car, Clock3, ArrowUpRight, ArrowRight, Check, LogOut, Download, RefreshCw, Heart, X, ShieldCheck } from "lucide-react"
import type { SupabaseClient } from "@supabase/supabase-js"
import { plans, rewardLevels, rewardProgress, type MemberData } from "@/lib/member/model"
import styles from "./member.module.css"
import UnavailablePass from "./UnavailablePass"
import PreopeningProfile from "./PreopeningProfile"
import RegistrationConfirmation, { type RegistrationSuccess } from "./RegistrationConfirmation"
import { membershipMessage } from "@/lib/member/membership-message"

type View = "home" | "plans" | "pass" | "rewards" | "garage" | "history"
type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
const navigation = [{ id: "home", label: "Overview", icon: Home }, { id: "plans", label: "Wash club", icon: Sparkles }, { id: "pass", label: "Wash pass", icon: QrCode }, { id: "rewards", label: "Rewards", icon: Heart }, { id: "garage", label: "My garage", icon: Car }] as const
const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
async function client(): Promise<SupabaseClient> { return (await import("@/lib/supabase")).supabase }
const demo: MemberData = { member: { id: "demo", email: "member@example.com", first_name: "Friend", last_name: "", membership_plan: "Dragon Wash Club", membership_status: "active", vehicle_make: "Ford", vehicle_model: "Explorer", vehicle_color: "White", license_plate: "DEMO", rewards_points: 40, lifetime_washes: 4, billingAvailable: false }, visits: [], visitsUnavailable: false }

export default function MemberApp({ preopening = false, initialView = "home" }: { preopening?: boolean; initialView?: View }) {
  const generation = useRef(0)
  const requestedPlan = useRef<string | null>(null)
  const [view, setView] = useState<View>(initialView)
  const [data, setData] = useState<MemberData>({ member: null, visits: [], visitsUnavailable: false })
  const [signedIn, setSignedIn] = useState(false)
  const [preview, setPreview] = useState(false)
  const [loading, setLoading] = useState(configured)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  const [email, setEmail] = useState("")
  const [loginOpen, setLoginOpen] = useState(false)
  const [installOpen, setInstallOpen] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<InstallEvent | null>(null)
  const [preferredPlan, setPreferredPlan] = useState("Gecko")
  const [online, setOnline] = useState(true)
  const [registrationSuccess, setRegistrationSuccess] = useState<RegistrationSuccess | null>(null)

  const request = useCallback(async (url: string, init: RequestInit = {}) => {
    const { data: { session } } = await (await client()).auth.getSession()
    if (!session) throw new Error("Please sign in again.")
    const response = await fetch(url, { ...init, cache: "no-store", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}`, ...init.headers } })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || "Something went wrong. Please try again.")
    return result
  }, [])

  const load = useCallback(async () => {
    const revision = ++generation.current
    setLoading(true); setError("")
    try {
      const { data: { session } } = await (await client()).auth.getSession()
      if (revision !== generation.current) return
      setSignedIn(Boolean(session))
      if (!session) { setData({ member: null, visits: [], visitsUnavailable: false }); return }
      const result = await request(preopening ? "/api/preopening" : "/api/member")
      if (revision === generation.current) { setData(result); if (result.member && preopening) setPreferredPlan(requestedPlan.current || result.member.preferred_plan); requestedPlan.current = null }
    } catch (error) { if (revision === generation.current) { setData({ member: null, visits: [], visitsUnavailable: false }); setError(error instanceof Error ? error.message : "Couldn’t load your membership.") } }
    finally { if (revision === generation.current) setLoading(false) }
  }, [request, preopening])

  useEffect(() => {
    let disposed = false
    let unsubscribe: (() => void) | undefined
    if (configured) {
      void client().then(db => {
        if (disposed) return
        // Schedule outside Supabase's auth callback to avoid nested auth calls.
        const { data: listener } = db.auth.onAuthStateChange(() => { window.setTimeout(() => { if (!disposed) { setPreview(false); void load() } }, 0) })
        unsubscribe = () => listener.subscription.unsubscribe()
      })
    }
    const updateOnline = () => setOnline(navigator.onLine)
    updateOnline()
    const beforeInstall = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallEvent) }
    window.addEventListener("online", updateOnline); window.addEventListener("offline", updateOnline)
    window.addEventListener("beforeinstallprompt", beforeInstall)
    return () => { disposed = true; unsubscribe?.(); window.removeEventListener("online", updateOnline); window.removeEventListener("offline", updateOnline); window.removeEventListener("beforeinstallprompt", beforeInstall) }
  }, [load])

  useEffect(() => {
    const sync = () => { const value = location.hash.slice(1); if (["home", "plans", "pass", "rewards", "garage", "history"].includes(value)) setView(value as View) }
    const queryPlan = new URLSearchParams(location.search).get("plan"); if (queryPlan) { const match = plans.find(p => p.name.toLowerCase() === queryPlan.toLowerCase()); if (match) { requestedPlan.current = match.name; setPreferredPlan(match.name) } }
    sync(); window.addEventListener("hashchange", sync)
    return () => window.removeEventListener("hashchange", sync)
  }, [])
  useEffect(() => {
    if (!loginOpen && !installOpen) return
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setLoginOpen(false); setInstallOpen(false) } }
    window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close)
  }, [loginOpen, installOpen])

  function go(next: View) { setView(next); window.location.hash = next; setMessage(""); window.scrollTo({ top: 0, behavior: "smooth" }) }
  function explore() { setPreview(true); setError(""); setMessage(""); setView("home") }
  function login() { setMessage(""); setLoginOpen(true) }
  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("")
    try {
      if (!configured) throw new Error("Member sign-in is not configured in this environment yet.")
      const { error } = await (await client()).auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { emailRedirectTo: `${location.origin}/auth/callback${preopening ? `?preopening_plan=${preferredPlan.toLowerCase()}` : ""}` } })
      if (error) throw error
      setMessage("Check your email for a secure sign-in link. Open it to finish signing in and save your profile.")
    } catch (error) { setMessage(error instanceof Error ? error.message : "Couldn’t send the link. Please try again.") }
    finally { setBusy(false) }
  }
  async function signOut() {
    setBusy(true)
    try { const { error } = await (await client()).auth.signOut(); if (error) throw error; generation.current++; setLoading(false); setSignedIn(false); setData({ member: null, visits: [], visitsUnavailable: false }); setPreview(false); setMessage("") }
    catch { setMessage("Couldn’t sign out. Please try again.") } finally { setBusy(false) }
  }
  async function billing() {
    if (preopening) { setMessage("Payments are disabled during pre-opening."); return }
    setBusy(true); setMessage("")
    try { const result = await request("/api/create-customer-portal", { method: "POST" }); const url = new URL(result.url); if (url.origin !== "https://billing.stripe.com") throw new Error("Unexpected billing destination."); location.assign(url.toString()) }
    catch (error) { setMessage(error instanceof Error ? error.message : "Couldn’t open billing."); setBusy(false) }
  }
  async function saveVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (preview) { setMessage("This is a sample vehicle. Sign in to save your own."); return }
    setBusy(true); setMessage("")
    const form = new FormData(event.currentTarget)
    try { await request("/api/member", { method: "PATCH", body: JSON.stringify(Object.fromEntries(form)) }); await load(); setMessage("Your vehicle has been saved.") }
    catch (error) { setMessage(error instanceof Error ? error.message : "Couldn’t save your vehicle.") } finally { setBusy(false) }
  }
  async function savePreopening(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("")
    const form = new FormData(event.currentTarget)
    try {
      await request("/api/preopening", { method: "POST", body: JSON.stringify({ ...Object.fromEntries(form), acknowledgement: form.get("acknowledgement") === "on" }) })
      setRegistrationSuccess({ firstName: String(form.get("first_name") || "").trim(), plan: String(form.get("preferred_plan") || ""), isNew: !data.member })
      await load(); setMessage("You’re registered as a free pre-opening member. Your profile is saved. No payment or subscription has been created.")
    } catch (error) { setMessage(error instanceof Error ? error.message : "Couldn’t save your registration.") } finally { setBusy(false) }
  }
  function choosePlan(name: string) { setPreferredPlan(name); go("garage") }
  async function install() {
    if (!installPrompt) { setInstallOpen(true); return }
    try { await installPrompt.prompt(); await installPrompt.userChoice; setInstallPrompt(null) } catch { setInstallOpen(true) }
  }
  function downloadPass() {
    const canvas = document.querySelector<HTMLCanvasElement>("#braxy-member-qr")
    if (!canvas) return
    const link = document.createElement("a"); link.download = "braxy-buns-wash-pass.png"; link.href = canvas.toDataURL("image/png"); link.click()
  }
  const shown = preview ? demo : data
  const member = shown.member
  const points = member?.rewards_points || 0
  const active = !preopening && member?.membership_status === "active"
  const membershipNotice = preopening ? { badge: "PRE-OPENING", label: "Free registration · not an active wash membership" } : membershipMessage(member?.membership_status)
  const plan = plans.find(p => member?.membership_plan?.toLowerCase().includes(p.name.toLowerCase()))
  const progress = rewardProgress(points)
  const isMemberView = preview || signedIn
  const vehicle = [member?.vehicle_color, member?.vehicle_make, member?.vehicle_model].filter(Boolean).join(" ")
  const header = (title: string, subtitle: string) => <div className={styles.intro}><div><p className={styles.eyebrow}>THE BRAXY BUNS CLUB</p><h1>{title}</h1><p>{subtitle}</p></div><span className={styles.pill}><Sparkles size={14} /> Clean car. Clear purpose.</span></div>
  const history = () => shown.visitsUnavailable ? <p role="alert">Wash history is temporarily unavailable. <button onClick={() => void load()}>Try again</button></p> : shown.visits.length ? shown.visits.map(visit => <div key={visit.id} className={styles.visit}><Clock3 size={20} /><div><strong>{visit.membership_plan || "Member wash"}</strong><p>{new Date(visit.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Chicago" })} CT</p></div><Check size={18} /></div>) : <div className={styles.empty}><Car size={30} /><h3>{preview ? "Sample member experience" : "Your next fresh start awaits."}</h3><p>{preview ? "This preview uses illustrative totals. No real visits or rewards are created." : preopening ? "Your real wash history starts after opening and membership activation." : "Your completed washes will appear here after check-in."}</p></div>

  return <div className={styles.app}>
    <aside className={styles.sidebar}><Link href="/" className={styles.logo}><Image src="/logo.png" alt="Braxy Buns Car Wash" width={214} height={80} priority /></Link><p className={styles.navLabel}>YOUR WASH CLUB</p><nav aria-label="Member navigation">{navigation.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => go(id)} className={view === id ? styles.selected : ""} aria-current={view === id ? "page" : undefined}><Icon size={20} /><span>{label}</span></button>)}</nav><div className={styles.purpose}><Heart size={25} /><h3>A little shine.<br />A bigger purpose.</h3><p>Meaningful opportunities for neurodiverse people, one wash at a time.</p><Link href="/inclusion">Meet our mission <ArrowUpRight size={14} /></Link></div><Link href="/" className={styles.back}>← Back to braxybuns.com</Link></aside>
    <main className={styles.main}><header className={styles.topbar}><span>{view === "history" ? "Wash history" : navigation.find(n => n.id === view)?.label}</span><div><span className={styles.status}>{preview ? "SAMPLE PREVIEW" : preopening ? "PRE-OPENING CLUB" : "MEMBER APP"}</span><button onClick={() => void install()} aria-label="Add app to home screen"><Download size={18} /><span>Add app</span></button>{signedIn ? <button onClick={() => void signOut()} disabled={busy} aria-label="Sign out"><LogOut size={18} /></button> : <button onClick={login}>Sign in <ArrowRight size={16} /></button>}</div></header>
      {preopening && <div className={styles.banner}><strong>Welcome to pre-opening.</strong> Explore the app and register for free. Payments, subscriptions, wash entry, and reward redemption are not available yet. <button onClick={() => go("garage")}>{data.member ? "My pre-opening profile" : "Register free"}</button></div>}
      {preview && <div className={styles.banner}>You’re exploring sample data. <button onClick={() => { setPreview(false); setMessage("") }}>Exit preview</button></div>}
      {!online && <div role="alert" className={styles.banner}>You’re offline. Reconnect to refresh your pass, save a vehicle, or manage billing.</div>}
      {error && <div role="alert" className={styles.banner}>{error} <button onClick={() => void load()}>Try again</button></div>}
      {message && !loginOpen && <div role="status" className={styles.banner}>{message}</div>}
      <div className={styles.content}>
      {loading && !preview ? <div className={styles.empty} role="status"><RefreshCw size={28} /><h1>Getting your club ready…</h1><p>Loading your membership securely.</p></div> : <>
      {view === "home" && <>{header(isMemberView ? `Hey ${member?.first_name || "there"}, let’s shine.` : "Your wash club. In your pocket.", "A cleaner car. A brighter day. All in one place.")}<div className={styles.grid}><section className={styles.hero}><div><p className={styles.eyebrow}>YOUR EVERYDAY FRESH START</p><h2>Big shine.<br />Even bigger purpose.</h2><p>Your membership, wash pass, and rewards.<br />One happy place to keep it all.</p></div><Image className={styles.mascot} src={plan?.image || "/dragon.png"} alt="" width={200} height={400} priority /><button className={styles.yellowButton} onClick={() => preopening && !data.member ? go("garage") : isMemberView ? go("pass") : login()}>{preopening && !data.member ? "Join free before opening" : isMemberView ? "Open my wash pass" : "Sign in to my club"}<ArrowUpRight size={18} /></button></section><section className={styles.card}><div className={styles.cardHead}><h2>{preopening ? "Your pre-opening club" : "Your membership"}</h2><span className={styles.badge}>{preview ? "SAMPLE" : active ? "ACTIVE" : member ? membershipNotice.badge : "WELCOME"}</span></div><h3 className={styles.planName}>{member?.membership_plan || "Find your fresh start"}</h3><p>{member ? `Membership status: ${membershipNotice.label}` : "Three wash clubs. One shared purpose."}</p><div className={styles.price}>{plan ? `$${plan.price}` : "$24.99"}<span>/ month{preopening ? " · planned" : !plan && " • plans from"}</span></div><div className={styles.cardFoot}><span>{preview ? "Illustrative membership" : preopening ? "Plan preference · no charge" : "Monthly wash club"}</span><button onClick={() => go("plans")}>Explore plans <ArrowUpRight size={14} /></button></div></section></div>
      {isMemberView ? <div className={styles.stats}><section><Clock3 /><p>Lifetime washes</p><strong>{member?.lifetime_washes || 0}</strong><small>{preview ? "Sample total" : "Fresh starts and counting"}</small></section><section><Sparkles /><p>Braxy Bucks</p><strong>{points}</strong><small>A little extra for your shine</small></section><section><Car /><p>Your garage</p><strong>{member?.license_plate ? "01" : "00"}</strong><small>{member?.license_plate || "Add your first vehicle"}</small></section></div> : <div className={styles.welcomeActions}><button onClick={explore}>Explore a sample member app <ArrowRight size={17} /></button><span>No account needed to take a look.</span></div>}
      <div className={styles.grid}><section className={styles.card}><div className={styles.cardHead}><h2>{isMemberView ? "Fresh from the tunnel" : "Less waiting. More shining."}</h2>{isMemberView && <button onClick={() => go("history")}>View history <ArrowUpRight size={14} /></button>}</div>{isMemberView ? history() : <div className={styles.steps}><p><QrCode /> Keep your digital wash pass handy.</p><p><Car /> Manage your vehicle in one place.</p><p><Sparkles /> Follow your washes and Braxy Bucks.</p></div>}</section><section className={`${styles.card} ${styles.mission}`}><p className={styles.eyebrow}>MORE THAN A CAR WASH</p><h2>Every wash can<br />open a door.</h2><p>Inspired by Braxton. Built around meaningful employment for neurodiverse people in our community.</p><Link href="/our-story">The purpose behind the shine <ArrowUpRight size={15} /></Link></section></div></>}
      {view === "plans" && <>{header("Find your kind of shine.", "Three wash clubs. One shared purpose.")}<div className={styles.plans}>{plans.map((p, i) => <section className={styles.card} key={p.name}><div className={styles.tierHead}><p className={styles.eyebrow}>LEVEL 0{i + 1}</p>{i === 2 && <span className={styles.badge}>PREMIUM</span>}</div><Image src={p.image} alt={`${p.name} mascot`} width={90} height={180} className={styles.tierImage} /><h2>{p.name} Wash Club</h2><p>{p.description}</p><div className={styles.price}>${p.price}<span>/ month{preopening && " · planned"}</span></div><ul>{p.features.map(f => <li key={f}><Check size={15} />{f}</li>)}</ul><>{preopening ? <button className={styles.primaryButton} onClick={() => choosePlan(p.name)}>Interested in {p.name} <ArrowRight size={16} /></button> : <Link className={styles.primaryButton} href={`/join?plan=${p.name.toLowerCase()}`}>Choose {p.name} <ArrowRight size={16} /></Link>}</></section>)}</div><p className={styles.note}>{preopening ? "Prices and features are planned. Selecting a preference creates no subscription or payment commitment." : "Plan details and recurring billing are reviewed on the existing membership signup page. Already a member? Manage your subscription below."}</p>{member?.billingAvailable && !preview && !preopening && <button className={styles.primaryButton} disabled={busy || !online} onClick={() => void billing()}>{busy ? "Opening…" : "Manage billing securely"}</button>}</>}
      {view === "pass" && <>{header("Hello, fresh start.", "Your digital pass for a smoother arrival.")}<section className={`${styles.card} ${styles.passCard}`}>{preopening ? <><ShieldCheck size={34} /><span className={styles.badge}>PASS PREVIEW</span><h2>{member && !preview ? `${member.first_name}’s future wash pass` : "Your future wash pass"}</h2><div className={styles.qr}><div className={styles.demoPass}><QrCode size={80} /><strong>AVAILABLE AFTER OPENING</strong><span>Preview only · not valid for wash entry</span></div></div><p>{member?.membership_plan || "Choose your preferred club"}</p><p>{member?.license_plate || "Save a vehicle in My garage"}</p><p className={styles.note}>A scannable pass will be available after opening and activation of a paid membership.</p><button className={styles.primaryButton} onClick={() => go("garage")}>{data.member ? "Edit my pre-opening profile" : "Register free"}</button></> : !isMemberView ? <><ShieldCheck size={34} /><h2>Your pass belongs to you.</h2><p>Sign in with your membership email to view your pass securely.</p><button className={styles.primaryButton} onClick={login}>Sign in to view pass</button></> : !active ? <UnavailablePass status={member?.membership_status} hasMember={Boolean(member)} billingAvailable={Boolean(member?.billingAvailable) && !preview} busy={busy} online={online} onBilling={() => void billing()} onRefresh={() => void load()} /> : <><p className={styles.eyebrow}>{member?.membership_plan}</p><h2>{member?.first_name || "Member"} {member?.last_name}</h2><div className={styles.qr}>{preview ? <div className={styles.demoPass}><QrCode size={80} /><strong>DEMO PASS</strong><span>Not valid for entry</span></div> : <QRCodeCanvas id="braxy-member-qr" value={member!.id} size={220} marginSize={4} title="Braxy Buns member wash pass" />}</div><div className={styles.plate}>{member?.license_plate || "Plate not added"}</div><p>{vehicle || "Add your vehicle in My garage"}</p><p className={styles.note}>Show your pass to the attendant. Membership eligibility is checked at arrival.</p>{!preview && <button className={styles.primaryButton} onClick={downloadPass}><Download size={17} /> Download wash pass</button>}</>}</section></>}
      {view === "rewards" && <>{header("Good things add up.", "A little thank-you for being part of the club.")}{preopening && <p className={styles.banner}>Rewards preview: earn points from eligible washes after opening. Registration creates no points, and redemption is not available yet.</p>}<div className={styles.grid}><section className={styles.hero}><p className={styles.eyebrow}>YOUR BRAXY BUCKS</p><h2>{isMemberView ? points : "—"} <small>Bucks</small></h2><p>{isMemberView ? "Your rewards balance, all in one place." : "Sign in to see your rewards balance."}</p>{!isMemberView && <button className={styles.yellowButton} onClick={login}>Sign in <ArrowRight size={16} /></button>}</section><section className={styles.card}><h2>{progress.next ? "Your next milestone" : "You’ve reached the top milestone!"}</h2><h3>{progress.next?.reward || "Founder VIP Status"}</h3><p>{points} {progress.next ? `/ ${progress.next.points}` : ""} points</p><div className={styles.progress} role="progressbar" aria-label="Reward milestone progress" aria-valuenow={Math.round(progress.percent)} aria-valuemin={0} aria-valuemax={100}><div style={{ width: `${progress.percent}%` }} /></div><p className={styles.note}>Ask a team member about reward availability and redemption. Rewards are not redeemed automatically.</p></section></div><section className={styles.card} style={{ marginTop: 22 }}><h2>A little something to look forward to</h2>{rewardLevels.map(r => <div className={styles.visit} key={r.points}><Sparkles size={18} /><strong>{r.reward}</strong><span>{r.points} pts</span></div>)}</section></>}
      {view === "garage" && <>{header("Make yourself at home.", "Keep your vehicle ready for a fresh start.")}{preopening ? signedIn && !preview ? <PreopeningProfile member={data.member} preferredPlan={preferredPlan} busy={busy} online={online} onSave={savePreopening} /> : <section className={`${styles.card} ${styles.formCard}`}><Car size={32} /><h2>Join the pre-opening club for free.</h2><p>Sign in with your email, then save your name, preferred club, and optional vehicle details. No credit card needed.</p><button className={styles.primaryButton} onClick={() => { setPreview(false); login() }}>Sign in or create my free account</button><p className={styles.note}>Already registered? Use the same email to return to your saved profile.</p></section> : <section className={`${styles.card} ${styles.formCard}`}>{member ? <><h2>Your vehicle</h2><form key={member.id + vehicle + member.license_plate} onSubmit={saveVehicle}><div className={styles.formGrid}>{[["vehicle_make", "Make", member.vehicle_make], ["vehicle_model", "Model", member.vehicle_model], ["vehicle_color", "Color", member.vehicle_color], ["license_plate", "License plate", member.license_plate]].map(([name, label, value]) => <label key={name}>{label}<input name={name!} defaultValue={value || ""} required={name !== "vehicle_color"} maxLength={name === "license_plate" ? 10 : 50} autoComplete="off" /></label>)}</div><button disabled={busy || !online} className={styles.primaryButton}>{busy ? "Saving…" : preview ? "Preview vehicle save" : "Save vehicle"}</button></form><p className={styles.note}>{preview ? "This sample vehicle isn’t connected to an account." : "Vehicle updates apply to this membership. Contact the team for help with additional vehicles."}</p>{member.billingAvailable && !preview && !preopening && <button className={styles.secondaryButton} disabled={busy || !online} onClick={() => void billing()}>Manage billing</button>}</> : <><Car size={32} /><h2>{signedIn ? "No membership linked yet" : "Your garage awaits"}</h2><p>{signedIn ? "Join with your signed-in email to link a vehicle and membership." : "Sign in to view and update your vehicle."}</p>{signedIn ? <Link className={styles.primaryButton} href="/join">Explore membership</Link> : <button className={styles.primaryButton} onClick={login}>Sign in</button>}</>}</section>}</>}
      {view === "history" && <>{header("Your shine, on record.", "Your most recent 50 completed washes.")}<section className={styles.card}>{isMemberView ? history() : <><p>Sign in to view your wash history.</p><button className={styles.primaryButton} onClick={login}>Sign in</button></>}</section></>}
      </>}
      </div><footer className={styles.footer}><span>GOOD CLEAN FUN. REAL HUMAN IMPACT.</span><Link href="/contact">Need a hand? Get in touch <ArrowUpRight size={12} /></Link></footer>
    </main>
    {registrationSuccess && <RegistrationConfirmation registration={registrationSuccess} onContinue={() => { setRegistrationSuccess(null); go("home") }} onClose={() => { setRegistrationSuccess(null); window.scrollTo({ top: 0, behavior: "smooth" }) }} />}
    {(loginOpen || installOpen) && <div className={styles.overlay} onClick={event => { if (event.target === event.currentTarget) { setLoginOpen(false); setInstallOpen(false) } }}><section role="dialog" aria-modal="true" aria-labelledby="member-dialog-title" className={styles.modal} onKeyDown={event => { if (event.key !== "Tab") return; const elements = event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), a[href]'); const first = elements[0]; const last = elements[elements.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() } }}><button className={styles.close} autoFocus onClick={() => { setLoginOpen(false); setInstallOpen(false) }} aria-label="Close dialog"><X size={22} /></button>{loginOpen ? <><ShieldCheck size={32} /><h2 id="member-dialog-title">Welcome to the club.</h2><p>{preopening ? "Enter your email to create a free account or return to your pre-opening profile. We’ll send you a secure sign-in link." : "Use your membership email. We’ll send a secure sign-in link—no password to remember."}</p><form onSubmit={signIn}><label>Email address<input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" /></label><button className={styles.primaryButton} disabled={busy || !online}>{busy ? "Sending…" : "Send sign-in link"}</button></form>{message && <p role="status">{message}</p>}</> : <><Download size={32} /><h2 id="member-dialog-title">Your club, one tap away.</h2><p><strong>iPhone or iPad:</strong> Open this page in Safari, tap Share, then Add to Home Screen.</p><p><strong>Android:</strong> Open the browser menu and choose Install app or Add to Home screen when available.</p><p className={styles.note}>This app uses braxybuns.com. An internet connection is needed for your account and wash pass.</p></>}</section></div>}
  </div>
}
