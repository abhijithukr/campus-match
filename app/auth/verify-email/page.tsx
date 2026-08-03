'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { getUserProfile } from '@/firebase/auth'
import MotionOtpVerificationView from '@/components/MotionOtpVerificationView'
import toast from 'react-hot-toast'

export default function VerifyEmailPage() {
  const [phase, setPhase] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')
  const [resending, setResending] = useState(false)
  const router = useRouter()
  const { user, setProfile } = useAuthStore()

  const sendCode = async () => {
    if (!user) return
    const res = await fetch('/api/send-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: user.uid, email: user.email }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || 'Failed to send verification email')
    }
  }

  useEffect(() => {
    if (user) sendCode().catch(() => {})
  }, [user])

  const handleVerify = async (otp: string) => {
    if (!user) return
    setPhase('verifying')
    try {
      const res = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, otp }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Verification failed')
      setPhase('success')
      const profile = await getUserProfile(user.uid)
      if (profile) setProfile(profile)
      toast.success('Email verified! Welcome to Campus Match 🎉')
      setTimeout(() => router.push('/discover'), 1600)
    } catch (err: any) {
      setPhase('error')
      toast.error(err.message || 'Verification failed.')
      setTimeout(() => setPhase('idle'), 1600)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await sendCode()
      toast.success('New code sent! Check your inbox.')
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend.')
    } finally { setResending(false) }
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          display: 'inline-flex', width: 56, height: 56, borderRadius: 16,
          background: 'rgba(254,1,154,0.18)', border: '1px solid rgba(254,1,154,0.4)',
          alignItems: 'center', justifyContent: 'center', marginBottom: 16
        }}>
          <ShieldCheck size={24} color="var(--purple)" />
        </div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800 }}>Verify your email</h1>
        <p style={{ color: 'var(--muted)', marginTop: 6, fontSize: 14, lineHeight: 1.6 }}>
          We sent a 6-digit code to <strong>{user?.email}</strong>. Enter it below to activate your account.
        </p>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 24, padding: '32px 24px' }}>
        <MotionOtpVerificationView
          length={6}
          isVerifying={phase === 'verifying'}
          isSuccess={phase === 'success'}
          isError={phase === 'error'}
          onCompleted={handleVerify}
          onResend={handleResend}
        />

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 20 }}>
          Code expires in 10 minutes.
        </p>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--muted)' }}>
          <Link href="/auth/login" style={{ color: 'var(--purple-light)', textDecoration: 'none', fontWeight: 600 }}>
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  )
}
