'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, ArrowRight, Lock } from 'lucide-react'
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
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <motion.div
          initial={{ scale: 0.6, rotate: 8, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'inline-flex', width: 60, height: 60, borderRadius: 18,
            background: 'color-mix(in srgb, var(--purple) 16%, var(--surface))',
            border: '1px solid color-mix(in srgb, var(--purple) 35%, transparent)',
            alignItems: 'center', justifyContent: 'center', marginBottom: 18,
          }}
        >
          <Shield size={26} color="var(--purple)" />
        </motion.div>
        <h1 className="font-display" style={{ fontSize: 30, fontWeight: 700 }}>Verify your identity</h1>
        <p style={{ color: 'var(--muted)', marginTop: 8, fontSize: 14.5, lineHeight: 1.6 }}>
          Enter your college register number to verify you're a real student.
        </p>
      </div>

      <motion.form
        onSubmit={handleVerify}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border2)',
          borderRadius: 26, padding: 30,
          boxShadow: '0 24px 48px -16px rgba(38,65,67,0.14)',
          display: 'flex', flexDirection: 'column', gap: 18,
        }}
      >
        <div>
          <label htmlFor="verify-regnum" style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)', marginBottom: 8 }}>
            Register Number
          </label>
          <input
            id="verify-regnum"
            className="input-base"
            type="text" required
            value={regNum} onChange={e => setRegNum(e.target.value.toUpperCase())}
            placeholder="e.g. CS21B047"
            style={{ textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, fontSize: 16 }}
          />
          <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 8 }}>
            This is your official college registration number on your ID card.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: loading || !regNum.trim() ? 1 : 1.015 }}
          whileTap={{ scale: loading || !regNum.trim() ? 1 : 0.985 }}
          className="btn-primary" type="submit" disabled={loading || !regNum.trim()}
        >
          {loading ? 'Verifying…' : (<><span>Verify &amp; Continue</span><ArrowRight size={16} /></>)}
        </motion.button>

        <div style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--muted)' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--purple-light)', textDecoration: 'underline', textUnderlineOffset: 2, fontWeight: 700 }}>
            Sign in
          </Link>
        </div>
      </motion.form>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          marginTop: 16, padding: '14px 16px', borderRadius: 14,
          background: 'color-mix(in srgb, var(--purple) 10%, var(--surface))',
          border: '1px solid color-mix(in srgb, var(--purple) 25%, transparent)',
          fontSize: 12.5, color: 'var(--muted)', display: 'flex', gap: 10,
        }}
      >
        <Lock size={15} style={{ flexShrink: 0, marginTop: 1, color: 'var(--purple-light)' }} />
        <span>Your register number is verified against the official college database uploaded by your admin. It is never shared with other students.</span>
      </motion.div>
    </motion.div>
  )
}
