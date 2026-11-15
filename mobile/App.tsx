import { useEffect, useState, type ReactNode } from 'react'
import {
  ActivityIndicator, Alert, AppState, Image, KeyboardAvoidingView, Linking, Modal, Platform, Pressable,
  ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, View,
} from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import type { Session } from '@supabase/supabase-js'
import { plans, rewardLevels } from '../lib/member/model'
import { auth, memberRequest, origin } from './client'

const tabs = ['Home', 'Clubs', 'Garage', 'Rewards', 'Account'] as const
type Tab = typeof tabs[number]
const clubArt = {
  Gecko: require('./assets/gecko.png'),
  Iguana: require('./assets/iguana.png'),
  Dragon: require('./assets/dragon.png'),
}
type Club = keyof typeof clubArt
const fields = [
  ['first_name', 'First name'], ['last_name', 'Last name'], ['vehicle_make', 'Vehicle make'],
  ['vehicle_model', 'Vehicle model'], ['vehicle_color', 'Vehicle color'], ['license_plate', 'License plate'],
] as const
type Field = typeof fields[number][0]
type Profile = Record<Field, string> & { preferred_plan: Club }
const empty: Profile = {
  first_name: '', last_name: '', vehicle_make: '', vehicle_model: '',
  vehicle_color: '', license_plate: '', preferred_plan: 'Gecko',
}

function Button({ label, onPress, secondary = false, disabled = false }: {
  label: string; onPress: () => void; secondary?: boolean; disabled?: boolean
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }}
      style={[styles.button, secondary && styles.secondary, disabled && styles.disabled]}
      onPress={onPress} disabled={disabled}>
      <Text style={[styles.buttonLabel, secondary && styles.secondaryLabel]}>{label}</Text>
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
  const [retry, setRetry] = useState(0)
  const [draft, setDraft] = useState<Profile>(empty)
  const [chosen, setChosen] = useState<Club | null>(null)
  const [email, setEmail] = useState('')
  const [sentTo, setSentTo] = useState('')
  const [code, setCode] = useState('')
  const [passwordMode, setPasswordMode] = useState(false)
  const [password, setPassword] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState<{ name: string; club: Club; isNew: boolean } | null>(null)
  const userId = session?.user.id
  const token = session?.access_token

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
      return memberRequest<{ member: Profile | null }>('/api/preopening', current.access_token)
    })
      .then(data => {
        if (!active) return
        setProfile(data.member)
        setDraft(data.member || empty)
        setProfileReady(true)
      })
      .catch(error => { if (active) setError(message(error)) })
    return () => { active = false }
  }, [userId, retry])

  function navigate(next: Tab) {
    setError('')
    if (next === 'Garage' && token && !profileReady) setRetry(value => value + 1)
    setTab(next)
  }

  function choose(club: Club) {
    setChosen(club)
    navigate('Garage')
  }

  async function signIn(verify: boolean) {
    if (!auth) return
    setBusy(true)
    setError('')
    try {
      if (passwordMode) {
        const { error } = await auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
        if (error) throw error
        setPassword('')
        setTab('Garage')
      } else if (verify) {
        const { error } = await auth.verifyOtp({ email: sentTo, token: code.trim(), type: 'email' })
        if (error) throw error
        setSentTo('')
        setCode('')
        setTab('Garage')
      } else {
        const address = email.trim().toLowerCase()
        const { error } = await auth.signInWithOtp({ email: address })
        if (error) throw error
        setSentTo(address)
      }
    } catch (error) { setError(message(error)) }
    finally { setBusy(false) }
  }

  async function save() {
    if (!token || !profileReady) return
    setBusy(true)
    setError('')
    try {
      const next = { ...draft, preferred_plan: chosen || draft.preferred_plan }
      await memberRequest('/api/preopening', token, 'POST', { ...next, acknowledgement: acknowledged })
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
    setDraft(empty)
    setChosen(null)
    setAcknowledged(false)
    setEmail('')
    setPassword('')
    setPasswordMode(false)
    setSentTo('')
    setCode('')
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

  function form() {
    if (!auth) return <Text style={styles.body}>Account sign-in is unavailable in this build.</Text>
    if (initializing) return <ActivityIndicator color="#5de6e8" />
    if (!userId) return (
      <Card>
        <Text style={styles.cardTitle}>{sentTo ? 'Enter your email code' : 'Sign in or register free'}</Text>
        <Text style={styles.body}>{sentTo ? `Enter the one-time code sent to ${sentTo}.` : passwordMode ? 'Use the password provided for your demo account.' : 'We’ll send a one-time code to your email.'}</Text>
        {sentTo
          ? <TextInput accessibilityLabel="Email code" style={styles.input} keyboardType="number-pad" autoComplete="one-time-code" value={code} onChangeText={setCode} />
          : <TextInput accessibilityLabel="Email address" style={styles.input} autoCapitalize="none" keyboardType="email-address" autoComplete="email" value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor="#8fa8b9" />}
        {passwordMode && <TextInput accessibilityLabel="Password" style={styles.input} secureTextEntry autoCapitalize="none" value={password} onChangeText={setPassword} />}
        <Button label={passwordMode ? 'Sign in' : sentTo ? 'Verify code' : 'Send email code'} onPress={() => void signIn(Boolean(sentTo))} disabled={busy || (sentTo ? code.trim().length < 6 : !email.includes('@') || (passwordMode && !password))} />
        {!sentTo && <Button label={passwordMode ? 'Use email code' : 'Sign in to a demo account'} secondary disabled={busy} onPress={() => { setPasswordMode(!passwordMode); setPassword(''); setError('') }} />}
        {sentTo && <Button label="Change email or request another code" secondary disabled={busy} onPress={() => { setSentTo(''); setCode(''); setError('') }} />}
      </Card>
    )
    if (!profileReady) return error
      ? <Button label="Retry loading profile" onPress={() => { setError(''); setRetry(value => value + 1) }} />
      : <ActivityIndicator color="#5de6e8" />
    return (
      <Card>
        {fields.map(([field, label], index) => (
          <View key={field}>
            <Text style={styles.label}>{label}{index > 1 && ' (optional)'}</Text>
            <TextInput accessibilityLabel={label} style={styles.input} value={draft[field]} maxLength={50}
              autoCapitalize={field === 'license_plate' ? 'characters' : 'words'}
              onChangeText={value => setDraft(current => ({ ...current, [field]: value }))} />
          </View>
        ))}
        <Text style={styles.label}>Preferred wash club</Text>
        {plans.map(plan => (
          <Pressable key={plan.name} accessibilityRole="radio" accessibilityState={{ checked: (chosen || draft.preferred_plan) === plan.name }}
            onPress={() => setChosen(plan.name as Club)} style={[styles.choice, (chosen || draft.preferred_plan) === plan.name && styles.selected]}>
            <Text style={styles.label}>{plan.name}</Text>
          </Pressable>
        ))}
        <View style={styles.consent}>
          <Text style={[styles.body, styles.flex]}>I understand registration is free and wash access requires separate paid enrollment after opening.</Text>
          <Switch accessibilityLabel="Acknowledge free pre-opening registration" value={acknowledged} onValueChange={setAcknowledged} />
        </View>
        <Button label={busy ? 'Saving…' : profile ? 'Save profile' : 'Join free'} onPress={() => void save()} disabled={busy || !acknowledged || !draft.first_name.trim() || !draft.last_name.trim()} />
      </Card>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView key={tab} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <Image source={require('./assets/logo.png')} style={styles.logo} resizeMode="contain" accessibilityLabel="Braxy Buns Car Wash" />
          {error && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
          {tab === 'Home' && <>
            <Heading title={profile ? `Welcome, ${profile.first_name}.` : 'Your wash club. In your pocket.'}
              subtitle="Braxy Buns is preparing to open. Save your vehicle and preferred club with a free pre-opening account." />
            <Card>
              <Text style={styles.cardTitle}>{profile ? 'You’re registered' : 'Join free before opening'}</Text>
              <Text style={styles.body}>{profile ? `Your preferred club is ${profile.preferred_plan}.` : 'No card, payment, or subscription is required.'}</Text>
              <Button label={profile ? 'View my garage' : 'Get started'} onPress={() => navigate('Garage')} />
            </Card>
            <Card><Text style={styles.cardTitle}>Wash access</Text><Text style={styles.body}>Live wash passes and wash history will be available after opening and paid enrollment.</Text></Card>
          </>}
          {tab === 'Clubs' && <>
            <Heading title="Find your kind of shine." subtitle="Compare planned clubs and save the one you’re interested in." />
            {plans.map(plan => <Card key={plan.name}>
              <Image source={clubArt[plan.name as Club]} accessibilityLabel={plan.name + ' mascot'} resizeMode="contain" style={styles.mascot} />
              <Text style={styles.cardTitle}>{plan.name} Wash Club</Text>
              <Text style={styles.body}>${plan.price}/month · planned</Text>
              <Text style={styles.body}>{plan.features.join(' • ')}</Text>
              <Button label={'Interested in ' + plan.name} onPress={() => choose(plan.name as Club)} />
            </Card>)}
          </>}
          {tab === 'Garage' && <><Heading title="My Garage" subtitle="Save your club preference and optional vehicle details." />{form()}</>}
          {tab === 'Rewards' && <>
            <Heading title="Braxy Bucks" subtitle="A preview of planned rewards. Earning and redemption open later." />
            <Card>{rewardLevels.map(level => <Text key={level.points} style={styles.body}>{level.points} points · {level.reward}</Text>)}</Card>
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
            <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: tab === item }}
              onPress={() => navigate(item)} style={[styles.tab, tab === item && styles.selected]}>
              <Text style={[styles.tabText, tab === item && styles.activeText]}>{item}</Text>
            </Pressable>
          ))}
        </View>
      </KeyboardAvoidingView>
      <Modal visible={Boolean(confirmation)} transparent animationType="fade" onRequestClose={() => setConfirmation(null)}>
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled">
            {confirmation && <Card>
              <Text accessibilityRole="header" style={styles.title}>{confirmation.isNew ? `You’re in, ${confirmation.name}!` : 'Your profile is updated!'}</Text>
              <Text style={styles.body}>{confirmation.isNew ? 'Thanks for joining the Braxy Buns pre-opening club.' : 'Your latest details are saved.'}</Text>
              <Text style={styles.label}>{confirmation.club} Wash Club · saved preference</Text>
              <Text style={styles.body}>Free registration. No payment or subscription was created.</Text>
              <Button label="Explore my club" onPress={() => { setConfirmation(null); navigate('Home') }} />
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
  safe: { flex: 1, backgroundColor: '#081829' },
  flex: { flex: 1 },
  content: { padding: 20, gap: 14, width: '100%', maxWidth: 640, alignSelf: 'center' },
  logo: { width: 235, height: 80, alignSelf: 'center', marginBottom: 10 },
  heading: { gap: 10, marginBottom: 5 },
  title: { color: '#fff', fontSize: 33, fontWeight: '800', letterSpacing: -1 },
  body: { color: '#c2d7e5', fontSize: 16, lineHeight: 24 },
  card: { gap: 12, padding: 18, borderWidth: 1, borderColor: '#27445a', backgroundColor: '#10263a', borderRadius: 18 },
  cardTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  label: { color: '#f1f8ff', fontSize: 16, fontWeight: '600' },
  input: { minHeight: 48, marginTop: 7, borderRadius: 10, borderColor: '#456278', borderWidth: 1, color: '#fff', padding: 12, fontSize: 16 },
  button: { minHeight: 48, borderRadius: 10, backgroundColor: '#66ece9', alignItems: 'center', justifyContent: 'center', padding: 11 },
  buttonLabel: { color: '#081829', textAlign: 'center', fontWeight: '700', fontSize: 16 },
  secondary: { backgroundColor: 'transparent', borderColor: '#456278', borderWidth: 1 },
  secondaryLabel: { color: '#e5f9ff' },
  disabled: { opacity: 0.48 },
  choice: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 9, borderWidth: 1, borderColor: '#456278' },
  selected: { backgroundColor: '#23455c', borderColor: '#66ece9' },
  consent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mascot: { height: 95, width: 150, alignSelf: 'center' },
  error: { backgroundColor: '#3a2435', padding: 13, borderRadius: 10, color: '#ffd5e8', fontSize: 16 },
  tabs: { flexDirection: 'row', gap: 3, padding: 6, borderTopWidth: 1, borderColor: '#27445a' },
  tab: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: 'transparent' },
  tabText: { fontSize: 12, color: '#bfd3e1', fontWeight: '700' },
  activeText: { color: '#fff' },
  overlay: { flex: 1, backgroundColor: '#000c' },
  modalBody: { flexGrow: 1, justifyContent: 'center', padding: 25 },
})
