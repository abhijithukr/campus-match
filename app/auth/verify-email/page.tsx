'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
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
      toast.success('Email verified! Welcome to Love Pic')
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
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'inline-flex', width: 60, height: 60, borderRadius: 18,
            background: 'color-mix(in srgb, var(--purple) 16%, var(--surface))',
            border: '1px solid color-mix(in srgb, var(--purple) 35%, transparent)',
            alignItems: 'center', justifyContent: 'center', marginBottom: 18,
          }}
        >
          <ShieldCheck size={26} color="var(--purple)" />
        </motion.div>
        <h1 className="font-display" style={{ fontSize: 30, fontWeight: 700 }}>Verify your email</h1>
        <p style={{ color: 'var(--muted)', marginTop: 8, fontSize: 14.5, lineHeight: 1.6 }}>
          We sent a 6-digit code to <strong style={{ color: 'var(--text)' }}>{user?.email}</strong>. Enter it below to activate your account.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 26, padding: '32px 24px',
          boxShadow: '0 24px 48px -16px rgba(38,65,67,0.14)',
        }}
      >
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

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13.5, color: 'var(--muted)' }}>
          <Link href="/auth/login" style={{ color: 'var(--purple-light)', textDecoration: 'underline', textUnderlineOffset: 2, fontWeight: 700 }}>
            Sign in instead
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}
