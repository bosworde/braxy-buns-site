import 'react-native-url-polyfill/auto'
import * as SecureStore from 'expo-secure-store'
import { createClient } from '@supabase/supabase-js'

const url = process.env.EXPO_PUBLIC_SUPABASE_URL
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
export const origin = process.env.EXPO_PUBLIC_BRAXY_URL || 'https://www.braxybuns.com'
export const auth = url && key ? createClient(url, key, {
  auth: {
    storage: {
      getItem: name => SecureStore.getItemAsync(name),
      setItem: (name, value) => SecureStore.setItemAsync(name, value),
      removeItem: name => SecureStore.deleteItemAsync(name),
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}).auth : null

export async function memberRequest<T>(path: '/api/preopening' | '/api/account/delete', token: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(origin + path, {
    method,
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await response.json().catch(() => null)
  if (!response.ok || !data) throw new Error(data?.error || 'Braxy Buns is temporarily unavailable. Please try again.')
  return data
}
