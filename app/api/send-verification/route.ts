import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomInt } from 'crypto'
import { db } from '@/firebase/config'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { sendVerificationEmail } from '@/lib/mailer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { uid, email } = await req.json()
    if (!uid || !email) {
      return NextResponse.json({ error: 'Missing uid or email' }, { status: 400 })
    }

    const otp = randomInt(0, 1000000).toString().padStart(6, '0')
    const otpHash = createHash('sha256').update(otp).digest('hex')
    const expiresAt = Date.now() + 10 * 60 * 1000

    await setDoc(doc(db, 'email_verification', uid), {
      email,
      otpHash,
      expiresAt,
      attempts: 0,
      createdAt: serverTimestamp(),
    }, { merge: true })

    await sendVerificationEmail(email, otp)

    return NextResponse.json({ sent: true })
  } catch (err: any) {
    console.error('send-verification error:', err?.message || err)
    return NextResponse.json({ error: err?.message || 'Failed to send verification email' }, { status: 500 })
  }
}