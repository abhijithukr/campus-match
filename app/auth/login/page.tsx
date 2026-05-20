'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, Heart } from 'lucide-react'
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
    <div>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          display: 'inline-flex', width: 56, height: 56, borderRadius: 16,
          background: 'var(--grad)', alignItems: 'center', justifyContent: 'center', marginBottom: 16
        }}>
          <Heart size={24} color="white" fill="white" />
        </div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800 }}>Welcome back</h1>
        <p style={{ color: 'var(--muted)', marginTop: 6, fontSize: 14 }}>Sign in to your Campus Match account</p>
      </div>

      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 24, padding: 32
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} color="var(--muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="input-base" type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@college.edu"
                style={{ paddingLeft: 40 }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="var(--muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="input-base" type={showPass ? 'text' : 'password'} required
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{ paddingLeft: 40, paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)'
              }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--muted)' }}>
          Don't have an account?{' '}
          <Link href="/auth/verify" style={{ color: 'var(--purple-light)', textDecoration: 'none', fontWeight: 500 }}>
            Register with your college ID
          </Link>
        </div>
      </div>

      {/* Demo hint */}
      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--muted)', opacity: 0.7 }}>
        🔒 Exclusively for verified students
      </div>
    </div>
  )
}
