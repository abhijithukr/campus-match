'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, ShieldCheck, RefreshCw } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { getUserProfile } from '@/firebase/auth'
import toast from 'react-hot-toast'

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || otp.trim().length !== 6) return
    setLoading(true)
    try {
      const res = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, otp: otp.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Verification failed')
      const profile = await getUserProfile(user.uid)
      if (profile) setProfile(profile)
      toast.success('Email verified! Welcome to Campus Match 🎉')
      router.push('/discover')
    } catch (err: any) {
      toast.error(err.message || 'Verification failed.')
    } finally { setLoading(false) }
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

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 24, padding: 32 }}>
        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
              Verification Code
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} color="var(--muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="input-base"
                type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} required
                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                style={{ paddingLeft: 40, letterSpacing: 6, fontWeight: 700, fontSize: 18 }}
              />
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
              Code expires in 10 minutes.
            </p>
          </div>
          <button className="btn-primary" type="submit" disabled={loading || otp.length !== 6}>
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button type="button" onClick={handleResend} disabled={resending} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--purple-light)', fontSize: 13, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 6
          }}>
            <RefreshCw size={14} /> {resending ? 'Sending...' : 'Resend code'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--muted)' }}>
          <Link href="/auth/login" style={{ color: 'var(--purple-light)', textDecoration: 'none', fontWeight: 600 }}>
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  )
}
