import type { Metadata } from 'next'
import { authorized } from '@/lib/investor-demo/auth'
import Demo from './Demo'
import Login from './Login'
import './demo.css'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {title:'Investor Experience',robots:{index:false,follow:false},description:'Explore the Braxy Buns operating platform.'}
export default async function Page() { return await authorized() ? <Demo/> : <Login/> }
