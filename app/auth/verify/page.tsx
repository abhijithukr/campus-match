'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, ArrowRight } from 'lucide-react'
import { verifyRegisterNumber } from '@/firebase/auth'
import toast from 'react-hot-toast'

export default function VerifyPage() {
  const [regNum, setRegNum] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regNum.trim()) return
    setLoading(true)
    try {
      const result = await verifyRegisterNumber(regNum.trim().toUpperCase())
      if (!result.valid) {
        if (result.reason === 'already_activated') toast.error('This register number already has an account.')
        else toast.error('Register number not found. Contact admin.')
        return
      }
      toast.success('Register number verified! ✅')
      router.push(`/auth/signup?reg=${encodeURIComponent(regNum.trim().toUpperCase())}&name=${encodeURIComponent(result.data?.name || '')}`)
    } catch (err: any) {
      console.error('Verify error:', err)
      toast.error('Verification failed: ' + (err?.message || 'Check console'))
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          display: 'inline-flex', width: 56, height: 56, borderRadius: 16,
          background: 'rgba(138,43,226,0.15)', border: '1px solid rgba(138,43,226,0.3)',
          alignItems: 'center', justifyContent: 'center', marginBottom: 16
        }}>
          <Shield size={24} color="var(--purple-light)" />
        </div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800 }}>Verify your identity</h1>
        <p style={{ color: 'var(--muted)', marginTop: 6, fontSize: 14, lineHeight: 1.6 }}>
          Enter your college register number to verify you're a real student.
        </p>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: 32 }}>
        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
              Register Number
            </label>
            <input
              className="input-base"
              type="text" required
              value={regNum} onChange={e => setRegNum(e.target.value.toUpperCase())}
              placeholder="e.g. CS21B047"
              style={{ textTransform: 'uppercase', letterSpacing: 2, fontWeight: 600, fontSize: 16 }}
            />
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
              This is your official college registration number on your ID card.
            </p>
          </div>
          <button className="btn-primary" type="submit" disabled={loading || !regNum.trim()}>
            {loading ? 'Verifying...' : (<><span>Verify & Continue</span><ArrowRight size={16} /></>)}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--muted)' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--purple-light)', textDecoration: 'none', fontWeight: 500 }}>
            Sign in
          </Link>
        </div>
      </div>

      <div style={{
        marginTop: 16, padding: '12px 16px', borderRadius: 12,
        background: 'rgba(138,43,226,0.06)', border: '1px solid rgba(138,43,226,0.2)',
        fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 8
      }}>
        <span>🔒</span>
        <span>Your register number is verified against the official college database uploaded by your admin. It is never shared with other students.</span>
      </div>
    </div>
  )
}
