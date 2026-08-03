import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { db } from '@/firebase/config'
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { uid, otp } = await req.json()
    if (!uid || !otp) {
      return NextResponse.json({ error: 'Missing uid or otp' }, { status: 400 })
    }

    const ref = doc(db, 'email_verification', uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      return NextResponse.json({ error: 'No verification in progress. Request a new code.' }, { status: 400 })
    }

    const data = snap.data()
    if (Date.now() > (data.expiresAt || 0)) {
      await deleteDoc(ref)
      return NextResponse.json({ error: 'Code expired. Request a new one.' }, { status: 400 })
    }

    const hash = createHash('sha256').update(otp).digest('hex')
    if (hash !== data.otpHash) {
      await updateDoc(ref, { attempts: (data.attempts || 0) + 1 })
      return NextResponse.json({ error: 'Incorrect code. Try again.' }, { status: 400 })
    }

    await updateDoc(doc(db, 'users', uid), { emailVerified: true })
    await deleteDoc(ref)

    return NextResponse.json({ verified: true })
  } catch (err: any) {
    console.error('verify-email error:', err?.message || err)
    return NextResponse.json({ error: err?.message || 'Verification failed' }, { status: 500 })
  }
}