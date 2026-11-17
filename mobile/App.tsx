import { useEffect, useState, type ReactNode } from 'react'
import {
  ActivityIndicator, Alert, AppState, Image, Keyboard, KeyboardAvoidingView, Linking, Modal, Platform, Pressable,
  ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, View,
} from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import Ionicons from '@expo/vector-icons/Ionicons'
import type { Session } from '@supabase/supabase-js'
import { plans, rewardLevels } from '../lib/member/model'
import { auth, memberRequest, origin } from './client'

const tabs = ['Home', 'Clubs', 'Garage', 'Rewards', 'Account'] as const
type Tab = typeof tabs[number]
const tabIcons = {
  Home: 'home-outline', Clubs: 'sparkles-outline', Garage: 'car-outline',
  Rewards: 'gift-outline', Account: 'person-circle-outline',
} as const
const brand = ['#E40303', '#FF8C00', '#FFED00', '#008026', '#004DFF', '#750787'] as const
const brandStops = [0, 0.18, 0.34, 0.50, 0.68, 1] as const
const cyan = '#67E8F9'
const clubArt = {
  Gecko: { source: require('./assets/gecko.png'), width: 210, centerY: 269, tint: '#C7F36A', shade: '#233D24' },
  Iguana: { source: require('./assets/iguana.png'), width: 211, centerY: 260, tint: '#7DDCFF', shade: '#0E3D5A' },
  Dragon: { source: require('./assets/dragon.png'), width: 210, centerY: 264, tint: '#FFD27B', shade: '#4A3024' },
}
type Club = keyof typeof clubArt
const fields = [
  ['first_name', 'First name'], ['last_name', 'Last name'], ['vehicle_make', 'Vehicle make'],
  ['vehicle_model', 'Vehicle model'], ['vehicle_color', 'Vehicle color'], ['license_plate', 'License plate'],
] as const
type Field = typeof fields[number][0]
type Profile = Record<Field, string> & { preferred_plan: Club }
type SavedProfile = { [Key in keyof Profile]?: Profile[Key] | null }
const empty: Profile = {
  first_name: '', last_name: '', vehicle_make: '', vehicle_model: '',
  vehicle_color: '', license_plate: '', preferred_plan: 'Gecko',
}

function profileDraft(saved: SavedProfile): Profile {
  const draft = { ...empty }
  for (const [field] of fields) draft[field] = saved[field]?.trim() || ''
  draft.license_plate = draft.license_plate.replace(/\s+/g, '').toUpperCase()
  if (saved.preferred_plan && Object.hasOwn(clubArt, saved.preferred_plan)) {
    draft.preferred_plan = saved.preferred_plan
  }
  return draft
}

function vehicleLabel(profile: Profile) {
  return [
    [profile.vehicle_make, profile.vehicle_model].filter(Boolean).join(' '),
    profile.vehicle_color, profile.license_plate,
  ].filter(Boolean).join(' · ')
}

function BrandGradient({ children }: { children?: ReactNode }) {
  return (
    <LinearGradient colors={brand} locations={brandStops} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
      style={children ? styles.buttonBorder : styles.brandLine}>
      {children}
    </LinearGradient>
  )
}

function ClubArtwork({ club, size = 'card' }: { club: Club; size?: 'card' | 'hero' | 'compact' }) {
  const art = clubArt[club]
  const width = { card: 244, hero: 198, compact: 110 }[size]
  const height = { card: 188, hero: 150, compact: 84 }[size]
  const scale = width / art.width
  // Center the visible mascot within the original transparent website artwork.
  return (
    <View accessible={false} pointerEvents="none" style={[styles.artFrame, { width, height }]}>
      <Image source={art.source} accessible={false} resizeMode="stretch" style={{
        width, height: 420 * scale, position: 'absolute', top: height / 2 - art.centerY * scale,
      }} />
    </View>
  )
}

function Button({ label, onPress, secondary = false, disabled = false, accent }: {
  label: string; onPress: () => void; secondary?: boolean; disabled?: boolean; accent?: string
}) {
  const content = (
    <View style={[styles.button, secondary && styles.secondary, accent && { borderColor: accent, borderWidth: 1 }]}>
      <Text style={[styles.buttonLabel, accent && { color: accent }]}>{label}</Text>
      {!secondary && <Ionicons name="arrow-forward" size={17} color={accent || cyan} />}
    </View>
  )
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }}
      accessibilityLabel={label}
      style={({ pressed }) => ((disabled || pressed) ? styles.disabled : undefined)}
      onPress={onPress} disabled={disabled}>
      {secondary || accent ? content : <BrandGradient>{content}</BrandGradient>}
    </Pressable>
  )
}

function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>
}

function Heading({ title, subtitle }: { title: string; subtitle?: string }) {
  return <View style={styles.heading}><Text accessibilityRole="header" style={styles.title}>{title}</Text>{subtitle && <Text style={styles.body}>{subtitle}</Text>}</View>
}

function message(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

function WashClub() {
  const [tab, setTab] = useState<Tab>('Home')
  const [session, setSession] = useState<Session | null>(null)
  const [initializing, setInitializing] = useState(Boolean(auth))
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileReady, setProfileReady] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [retry, setRetry] = useState(0)
  const [draft, setDraft] = useState<Profile>(empty)
  const [chosen, setChosen] = useState<Club | null>(null)
  const [showVehicle, setShowVehicle] = useState(false)
  const [email, setEmail] = useState('')
  const [sentTo, setSentTo] = useState('')
  const [code, setCode] = useState('')
  const [codeNotice, setCodeNotice] = useState('')
  const [passwordMode, setPasswordMode] = useState(false)
  const [password, setPassword] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState<{ name: string; club: Club; isNew: boolean } | null>(null)
  const userId = session?.user.id
  const token = session?.access_token
  const address = email.trim().toLowerCase()
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)
  const validCode = /^\d{6,}$/.test(code)

  useEffect(() => {
    if (!auth) return
    const { data } = auth.onAuthStateChange((_event, current) => {
      setSession(current)
      setInitializing(false)
    })
    const appState = AppState.addEventListener('change', state => {
      if (state === 'active') auth?.startAutoRefresh()
      else auth?.stopAutoRefresh()
    })
    if (AppState.currentState === 'active') auth.startAutoRefresh()
    return () => {
      data.subscription.unsubscribe()
      appState.remove()
      auth?.stopAutoRefresh()
    }
  }, [])

  useEffect(() => {
    setProfileError('')
    if (!auth || !userId) {
      setProfile(null)
      setProfileReady(false)
      setDraft(empty)
      return
    }
    let active = true
    setProfileReady(false)
    auth.getSession().then(({ data }) => {
      const current = data.session
      if (current?.user.id !== userId) throw new Error('Sign in again to load your profile.')
      return memberRequest<{ member: SavedProfile | null }>('/api/preopening', current.access_token)
    })
      .then(data => {
        if (!active) return
        const loaded = data.member ? profileDraft(data.member) : null
        setProfile(loaded)
        setDraft(loaded || empty)
        setProfileReady(true)
      })
      .catch(error => { if (active) setProfileError(message(error)) })
    return () => { active = false }
  }, [userId, retry])

  function navigate(next: Tab) {
    setError('')
    setTab(next)
  }

  function choose(club: Club) {
    setChosen(club)
    navigate('Garage')
  }

  async function signIn(action: 'send' | 'verify' | 'password') {
    if (!auth || busy) return
    setBusy(true)
    setError('')
    setCodeNotice('')
    try {
      if (action === 'password') {
        const { error } = await auth.signInWithPassword({ email: address, password })
        if (error) throw error
        setPassword('')
        setTab('Garage')
      } else if (action === 'verify') {
        const { error } = await auth.verifyOtp({ email: sentTo, token: code, type: 'email' })
        if (error) throw error
        setSentTo('')
        setCode('')
        setTab('Garage')
      } else {
        const recipient = sentTo || address
        const { error } = await auth.signInWithOtp({ email: recipient })
        if (error) throw error
        if (sentTo) setCodeNotice('A fresh code is on its way. Use the newest email.')
        setCode('')
        setSentTo(recipient)
      }
    } catch (error) { setError(message(error)) }
    finally { setBusy(false) }
  }

  async function save() {
    if (!token || !profileReady || busy) return
    setBusy(true)
    setError('')
    try {
      const next = profileDraft({ ...draft, preferred_plan: chosen || draft.preferred_plan })
      await memberRequest('/api/preopening', token, 'POST', { ...next, acknowledgement: acknowledged })
      Keyboard.dismiss()
      setConfirmation({ name: next.first_name.trim(), club: next.preferred_plan, isNew: !profile })
      setDraft(next)
      setProfile(next)
      setChosen(null)
      setAcknowledged(false)
    } catch (error) { setError(message(error)) }
    finally { setBusy(false) }
  }

  function resetProfile() {
    setProfile(null)
    setProfileReady(false)
    setProfileError('')
    setDraft(empty)
    setChosen(null)
    setShowVehicle(false)
    setAcknowledged(false)
    setEmail('')
    setPassword('')
    setPasswordMode(false)
    setSentTo('')
    setCode('')
    setCodeNotice('')
    setConfirmation(null)
    setError('')
    setTab('Home')
  }

  async function endSession(remove: boolean) {
    if (!token || !auth) return
    setBusy(true)
    setError('')
    try {
      if (remove) {
        await memberRequest('/api/account/delete', token, 'POST', { confirm: 'DELETE' })
        resetProfile()
        setSession(null)
        await auth.signOut({ scope: 'local' })
        Alert.alert('Account deleted', 'Your pre-opening account and saved profile were deleted.')
      } else {
        const { error } = await auth.signOut({ scope: 'local' })
        if (error) throw error
        resetProfile()
      }
    } catch (error) { setError(message(error)) }
    finally { setBusy(false) }
  }

  function profileLoading() {
    if (profileError) return (
      <Card>
        <Text accessibilityRole="alert" style={styles.error}>{profileError}</Text>
        <Button label="Retry loading profile" onPress={() => { setProfileError(''); setRetry(value => value + 1) }} />
      </Card>
    )
    return <ActivityIndicator accessibilityLabel="Loading your profile" color={cyan} />
  }

  function profileField(field: Field, label: string) {
    return (
      <View key={field}>
        <Text style={styles.label}>{label}</Text>
        <TextInput accessibilityLabel={label} style={styles.input} value={draft[field]} maxLength={50}
          autoCapitalize={field === 'license_plate' ? 'characters' : 'words'}
          onChangeText={value => setDraft(current => ({ ...current, [field]: value }))} />
      </View>
    )
  }

  function form() {
    if (!auth) return <Text style={styles.body}>Account sign-in is unavailable in this build.</Text>
    if (initializing) return <ActivityIndicator color={cyan} />
    if (!userId) {
      const action = sentTo ? 'verify' : passwordMode ? 'password' : 'send'
      const disabled = busy || (sentTo ? !validCode : !validEmail || (passwordMode && !password))
      return (
        <Card>
          <Text accessibilityRole="header" style={styles.cardTitle}>{sentTo ? 'Check your email' : 'Sign in or register free'}</Text>
          <Text style={styles.body}>{sentTo ? `Enter the one-time code sent to ${sentTo}.`
            : passwordMode ? 'Use the password provided for your demo account.' : 'We’ll email you a one-time code. No password needed.'}</Text>
          {sentTo
            ? <TextInput key="code" accessibilityLabel="Email code" style={[styles.input, styles.codeInput]} keyboardType="number-pad"
                autoComplete="one-time-code" autoFocus editable={!busy} value={code} onChangeText={value => setCode(value.replace(/\D/g, ''))}
                placeholder="Enter code" placeholderTextColor="#8FA8B9" />
            : <TextInput key="email" accessibilityLabel="Email address" style={styles.input} autoCapitalize="none" autoCorrect={false}
                keyboardType="email-address" autoComplete="email" editable={!busy} value={email} onChangeText={setEmail}
                placeholder="Email address" placeholderTextColor="#8FA8B9" returnKeyType="go" onSubmitEditing={() => { if (!passwordMode && !disabled) void signIn('send') }} />}
          {passwordMode && <TextInput accessibilityLabel="Password" placeholder="Password" placeholderTextColor="#8FA8B9"
            style={styles.input} secureTextEntry autoCapitalize="none" editable={!busy} value={password} onChangeText={setPassword} />}
          {error && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
          {codeNotice && <Text accessibilityLiveRegion="polite" style={styles.body}>{codeNotice}</Text>}
          <Button label={busy ? 'One moment…' : sentTo ? 'Verify code' : passwordMode ? 'Sign in' : 'Send email code'}
            onPress={() => void signIn(action)} disabled={disabled} />
          {sentTo
            ? <>
                <Button label="Resend code" secondary disabled={busy} onPress={() => void signIn('send')} />
                <Button label="Change email address" secondary disabled={busy} onPress={() => { setSentTo(''); setCode(''); setCodeNotice(''); setError('') }} />
              </>
            : <Button label={passwordMode ? 'Use email code' : 'Sign in to a demo account'} secondary disabled={busy}
                onPress={() => { setPasswordMode(!passwordMode); setPassword(''); setError('') }} />}
        </Card>
      )
    }
    if (!profileReady) return profileLoading()
    return (
      <Card>
        <Text accessibilityRole="header" style={styles.cardTitle}>{profile ? 'Your profile' : 'Finish your free registration'}</Text>
        {fields.slice(0, 2).map(([field, label]) => profileField(field, label))}
        <Text style={styles.label}>Preferred wash club</Text>
        {plans.map(plan => {
          const club = plan.name as Club
          const { tint } = clubArt[club]
          const checked = (chosen || draft.preferred_plan) === club
          return (
            <Pressable key={club} accessibilityRole="radio" accessibilityLabel={club} accessibilityState={{ checked }}
              onPress={() => setChosen(club)} style={[styles.choice, checked && styles.selected, checked && { borderColor: tint }]}>
              <View style={[styles.choiceDot, { backgroundColor: tint }]} />
              <Text style={[styles.label, styles.flex]}>{club}</Text>
              <Ionicons name={checked ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={checked ? tint : '#8FA8B9'} />
            </Pressable>
          )
        })}
        <Pressable accessibilityRole="button" accessibilityLabel="Vehicle details, optional" accessibilityState={{ expanded: showVehicle }}
          style={styles.choice} onPress={() => setShowVehicle(!showVehicle)}>
          <Ionicons name="car-outline" size={22} color={cyan} />
          <View style={styles.flex}>
            <Text style={styles.label}>Vehicle details</Text>
            <Text style={styles.caption}>{showVehicle ? 'Optional' : vehicleLabel(draft) || 'Optional · you can add this later'}</Text>
          </View>
          <Ionicons name={showVehicle ? 'chevron-up' : 'chevron-down'} size={18} color={cyan} />
        </Pressable>
        {showVehicle && fields.slice(2).map(([field, label]) => profileField(field, label))}
        <View style={styles.consent}>
          <Text style={[styles.body, styles.flex]}>I understand registration is free and wash access requires separate paid enrollment after opening.</Text>
          <Switch accessibilityLabel="Acknowledge free pre-opening registration" value={acknowledged} onValueChange={setAcknowledged} />
        </View>
        {error && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
        <Button label={busy ? 'Saving…' : profile ? 'Save profile' : 'Join free'} onPress={() => void save()} disabled={busy || !acknowledged || !draft.first_name.trim() || !draft.last_name.trim()} />
      </Card>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView key={tab} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <View style={styles.masthead}>
            <View style={styles.logoFrame}>
              <Image source={require('./assets/logo.png')} style={styles.logo} resizeMode="stretch"
                accessible accessibilityLabel="Braxy Buns Car Wash" />
            </View>
            <BrandGradient />
          </View>
          {error && tab !== 'Garage' && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
          {tab === 'Home' && <>
            {initializing || (userId && !profileReady) ? profileLoading() : (
              <LinearGradient colors={['#0A2B4B', '#071B33']} style={styles.hero}>
                <Text style={styles.eyebrow}>{profile ? 'PRE-OPENING MEMBER' : 'FREE PRE-OPENING REGISTRATION'}</Text>
                <Heading title={profile ? `Welcome, ${profile.first_name}.` : 'Your wash club. In your pocket.'}
                  subtitle={profile ? undefined : 'Choose the wash club you’re interested in and register free.'} />
                {profile ? (
                  <View style={styles.savedClub}>
                    <ClubArtwork club={profile.preferred_plan} size="compact" />
                    <View style={styles.flex}>
                      <Text style={styles.caption}>Preferred wash club</Text>
                      <Text style={[styles.label, { color: clubArt[profile.preferred_plan].tint }]}>{profile.preferred_plan} Wash Club</Text>
                    </View>
                  </View>
                ) : <ClubArtwork club="Dragon" size="hero" />}
                {profile && (
                  <View style={styles.withIcon}>
                    <Ionicons name="car-outline" size={22} color={cyan} />
                    <View style={styles.flex}>
                      <Text style={styles.caption}>My Garage</Text>
                      <Text style={styles.label}>{vehicleLabel(profile) || 'Add a vehicle whenever you’re ready'}</Text>
                    </View>
                  </View>
                )}
                <Button label={profile ? 'View my garage' : userId ? 'Finish registration' : 'Join free'} onPress={() => navigate('Garage')} />
                <Button label="Compare wash clubs" secondary onPress={() => navigate('Clubs')} />
              </LinearGradient>
            )}
            <Card>
              <View style={styles.withIcon}>
                <Ionicons name="calendar-outline" size={22} color={cyan} />
                <Text accessibilityRole="header" style={[styles.cardTitle, styles.flex]}>Opening updates</Text>
              </View>
              <Text style={styles.body}>We’re preparing to open. Visit Braxy Buns online for announcements. Wash access starts after opening and separate paid enrollment.</Text>
              <Button label="Visit braxybuns.com" secondary onPress={() => {
                void Linking.openURL(origin).catch(() => setError('Couldn’t open the Braxy Buns website.'))
              }} />
            </Card>
          </>}
          {tab === 'Clubs' && <>
            <Heading title="Find your kind of shine." subtitle="Compare planned clubs and save the one you’re interested in." />
            {plans.map(plan => {
              const club = plan.name as Club
              const { tint, shade } = clubArt[club]
              return (
                <Card key={club}>
                  <LinearGradient colors={[shade, '#0B1D31']} style={styles.clubBanner}>
                    <ClubArtwork club={club} />
                  </LinearGradient>
                  <Text accessibilityRole="header" style={[styles.cardTitle, { color: tint }]}>{club} Wash Club</Text>
                  <Text style={styles.body}>{plan.description}</Text>
                  <Text style={styles.price}>${plan.price}<Text style={styles.priceSuffix}> / month · planned</Text></Text>
                  <View style={styles.features}>
                    {plan.features.map(feature => (
                      <View key={feature} style={styles.withIcon}>
                        <Ionicons name="checkmark" size={17} color={tint} />
                        <Text style={[styles.body, styles.flex]}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                  <Button label={`Interested in ${club}`} accent={tint} onPress={() => choose(club)} />
                </Card>
              )
            })}
          </>}
          {tab === 'Garage' && <><Heading title="My Garage" subtitle="Save your club preference and optional vehicle details." />{form()}</>}
          {tab === 'Rewards' && <>
            <Heading title="Braxy Bucks" subtitle="A preview of planned rewards. Earning and redemption open later." />
            <Card>
              {rewardLevels.map(level => (
                <View key={level.points} style={styles.rewardRow}>
                  <Ionicons name="gift-outline" size={22} color="#FFD27B" />
                  <Text style={[styles.label, styles.flex]}>{level.reward}</Text>
                  <Text style={styles.rewardPoints}>{level.points} pts</Text>
                </View>
              ))}
            </Card>
          </>}
          {tab === 'Account' && <>
            <Heading title="Account" subtitle={session?.user.email || 'Manage your Braxy Buns account.'} />
            {!session && <Button label="Sign in" onPress={() => navigate('Garage')} />}
            <Button label="Privacy notice" secondary onPress={() => void Linking.openURL(origin + '/privacy')} />
            <Button label="Get support" secondary onPress={() => void Linking.openURL(origin + '/contact')} />
            {session && <>
              <Button label="Sign out" secondary disabled={busy} onPress={() => void endSession(false)} />
              <Button label="Delete account" secondary disabled={busy} onPress={() => Alert.alert(
                'Delete your account?',
                'This permanently removes your sign-in account and saved pre-opening profile.',
                [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete account', style: 'destructive', onPress: () => void endSession(true) }],
              )} />
            </>}
          </>}
        </ScrollView>
        <View accessibilityRole="tablist" style={styles.tabs}>
          {tabs.map(item => (
            <Pressable key={item} accessibilityRole="tab" accessibilityLabel={item} accessibilityState={{ selected: tab === item }}
              onPress={() => navigate(item)} style={({ pressed }) => [styles.tab, tab === item && styles.selected, pressed && styles.disabled]}>
              <Ionicons name={tabIcons[item]} size={22} color={tab === item ? cyan : '#A7BED0'} />
              <Text style={[styles.tabText, tab === item && styles.activeText]}>{item}</Text>
            </Pressable>
          ))}
        </View>
      </KeyboardAvoidingView>
      <Modal visible={Boolean(confirmation)} transparent animationType="fade" onRequestClose={() => setConfirmation(null)}>
        <View style={styles.overlay} accessibilityViewIsModal>
          <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled">
            {confirmation && <Card>
              <Text accessibilityRole="header" style={styles.title}>{confirmation.isNew ? `You’re in, ${confirmation.name}!` : 'Your profile is updated!'}</Text>
              <Text style={styles.body}>{confirmation.isNew ? 'Thanks for joining the Braxy Buns pre-opening club.' : 'Your latest details are saved.'}</Text>
              <View style={styles.savedClub}>
                <ClubArtwork club={confirmation.club} size="compact" />
                <View style={styles.flex}>
                  <Text style={styles.body}>Saved preference</Text>
                  <Text style={[styles.label, { color: clubArt[confirmation.club].tint }]}>{confirmation.club} Wash Club</Text>
                </View>
              </View>
              <Text style={styles.body}>Free registration. No payment or subscription was created.</Text>
              <Button label="Go to my home screen" onPress={() => { setConfirmation(null); navigate('Home') }} />
              <Button label="Review my profile" secondary onPress={() => setConfirmation(null)} />
            </Card>}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

export default function App() {
  return <SafeAreaProvider><WashClub /></SafeAreaProvider>
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#061426' },
  flex: { flex: 1 },
  content: { padding: 20, paddingTop: 8, paddingBottom: 24, gap: 16, width: '100%', maxWidth: 640, alignSelf: 'center' },
  masthead: { gap: 12, alignItems: 'center' },
  logoFrame: { width: '100%', maxWidth: 328, aspectRatio: 534 / 200, alignItems: 'center' },
  logo: { position: 'absolute', width: '168.54%', height: '108%', left: '-34.27%', top: '-4%' },
  brandLine: { width: '100%', height: 3, borderRadius: 2 },
  hero: { gap: 12, padding: 18, borderRadius: 22, borderWidth: 1, borderColor: '#294861' },
  eyebrow: { color: cyan, fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  heading: { gap: 10, marginBottom: 5 },
  title: { color: '#fff', fontSize: 33, fontWeight: '800', letterSpacing: -1 },
  body: { color: '#C2D7E5', fontSize: 16, lineHeight: 24 },
  caption: { color: '#C2D7E5', fontSize: 14, lineHeight: 21 },
  card: { gap: 12, padding: 18, borderWidth: 1, borderColor: '#294258', backgroundColor: '#122031', borderRadius: 20 },
  cardTitle: { color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  label: { color: '#f1f8ff', fontSize: 16, fontWeight: '600' },
  input: { minHeight: 48, marginTop: 7, borderRadius: 10, borderColor: '#456278', borderWidth: 1, backgroundColor: '#061426', color: '#fff', padding: 12, fontSize: 16 },
  codeInput: { fontSize: 22, letterSpacing: 2 },
  buttonBorder: { borderRadius: 13, padding: 2 },
  button: { minHeight: 48, borderRadius: 11, backgroundColor: '#071B33', flexDirection: 'row', gap: 9, alignItems: 'center', justifyContent: 'center', padding: 11 },
  buttonLabel: { flexShrink: 1, color: '#fff', textAlign: 'center', fontWeight: '700', fontSize: 16 },
  secondary: { backgroundColor: 'transparent', borderColor: '#456278', borderWidth: 1 },
  disabled: { opacity: 0.48 },
  choice: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 9, borderWidth: 1, borderColor: '#456278' },
  choiceDot: { width: 8, height: 8, borderRadius: 4 },
  selected: { backgroundColor: '#193449', borderColor: '#3E7B91' },
  consent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  clubBanner: { alignItems: 'center', justifyContent: 'center', borderRadius: 14, overflow: 'hidden' },
  artFrame: { alignSelf: 'center', alignItems: 'center', overflow: 'hidden' },
  price: { color: '#fff', fontSize: 29, fontWeight: '800', letterSpacing: -0.7 },
  priceSuffix: { color: '#C2D7E5', fontSize: 14, fontWeight: '500', letterSpacing: 0 },
  features: { gap: 6, marginBottom: 4 },
  withIcon: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 },
  rewardPoints: { color: '#FFD27B', fontSize: 15, fontWeight: '700' },
  error: { backgroundColor: '#3a2435', padding: 13, borderRadius: 10, color: '#ffd5e8', fontSize: 16 },
  tabs: { flexDirection: 'row', gap: 3, padding: 6, borderTopWidth: 1, borderColor: '#294258' },
  tab: { flex: 1, minHeight: 54, gap: 3, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: 'transparent' },
  tabText: { fontSize: 12, color: '#bfd3e1', fontWeight: '700', textAlign: 'center' },
  activeText: { color: '#fff' },
  overlay: { flex: 1, backgroundColor: '#000c' },
  modalBody: { flexGrow: 1, justifyContent: 'center', padding: 25 },
  savedClub: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#071B33', borderRadius: 12, paddingRight: 8 },
})
