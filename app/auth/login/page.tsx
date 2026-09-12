'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, Heart, Lock as LockIcon } from 'lucide-react'
import { loginUser } from '@/firebase/auth'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await loginUser(email, password)
      router.push('/discover')
    } catch (err: any) {
      const msg = err.code === 'auth/invalid-credential' ? 'Invalid email or password.' : 'Sign in failed. Try again.'
      toast.error(msg)
    } finally { setLoading(false) }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <motion.div
          initial={{ scale: 0.6, rotate: -8, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'inline-flex', width: 60, height: 60, borderRadius: 18,
            background: 'var(--grad)', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
            boxShadow: '0 14px 28px -10px color-mix(in srgb, var(--purple) 60%, transparent)',
          }}
        >
          <Heart size={26} color="var(--on-bright)" fill="var(--on-bright)" />
        </motion.div>
        <h1 className="font-display" style={{ fontSize: 30, fontWeight: 700 }}>Welcome back</h1>
        <p style={{ color: 'var(--muted)', marginTop: 8, fontSize: 14.5 }}>Sign in to your Love Pic account</p>
      </div>

      <motion.form
        onSubmit={handleSubmit}
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
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)', marginBottom: 8 }}>Email</label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} color="var(--muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              id="login-email"
              className="input-base" type="email" required
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@college.edu"
              style={{ paddingLeft: 40 }}
            />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)', marginBottom: 8 }}>Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={16} color="var(--muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              id="login-password"
              className="input-base" type={showPass ? 'text' : 'password'} required
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{ paddingLeft: 40, paddingRight: 44 }}
            />
            <button type="button" onClick={() => setShowPass(!showPass)} aria-label={showPass ? 'Hide password' : 'Show password'} style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex'
            }}>
              {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: loading ? 1 : 1.015 }}
          whileTap={{ scale: loading ? 1 : 0.985 }}
          className="btn-primary" type="submit" disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </motion.button>

        <div style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--muted)' }}>
          Don't have an account?{' '}
          <Link href="/auth/verify" style={{ color: 'var(--purple-light)', textDecoration: 'underline', textUnderlineOffset: 2, fontWeight: 700 }}>
            Register with your college ID
          </Link>
        </div>
      </motion.form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 22, fontSize: 12.5, color: 'var(--muted)' }}
      >
        <LockIcon size={13} />
        <span>Exclusively for verified students</span>
      </motion.div>
    </motion.div>
  )
}
