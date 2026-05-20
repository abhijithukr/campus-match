import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, initializeFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'

if (typeof window !== 'undefined') {
  const _consoleError = console.error
  console.error = function(...args: any[]) {
    const msg = args[0]
    if (typeof msg === 'string' && (msg.includes('permission') || msg.includes('insufficient') || msg.includes('Missing') || msg.includes('Firebase'))) return
    _consoleError.apply(console, args)
  }
  window.addEventListener('unhandledrejection', (e) => { e.preventDefault() })
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

let db = getFirestore(app)

export { db }

export const auth = getAuth(app)
export const rtdb = getDatabase(app)
export default app