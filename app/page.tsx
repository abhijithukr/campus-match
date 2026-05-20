'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Shield, Zap, Users, Lock, RefreshCw } from 'lucide-react'

const features = [
  { icon: Lock, title: 'Anonymous Likes', desc: 'Your crush never knows — unless they like you back.' },
  { icon: Shield, title: 'Verified Students', desc: 'Register number verified. Real people, real campus.' },
  { icon: Zap, title: 'Instant Matches', desc: 'Mutual likes create matches with instant chat access.' },
  { icon: Users, title: 'Campus Only', desc: 'Exclusive to your college. No outsiders, ever.' },
  { icon: RefreshCw, title: '14-Day Cycles', desc: 'Fresh match cycles keep the campus ecosystem alive.' },
  { icon: Heart, title: 'Real Connections', desc: 'From crush to chat. From chat to something real.' },
]

export default function LandingPage() {
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', overflow: 'auto', fontFamily: "'DM Sans', sans-serif", color: 'var(--text)' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 40px', borderBottom: '1px solid var(--border)',
        background: 'rgba(11,11,15,0.9)', backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Campus Match
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/auth/login" style={{ padding: '8px 20px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', textDecoration: 'none', fontSize: 14, transition: 'border-color 0.2s' }}>
            Sign In
          </Link>
          <Link href="/auth/verify" style={{ padding: '8px 20px', borderRadius: 10, background: 'var(--grad)', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
            Join Now
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '100px 20px 80px', position: 'relative', overflow: 'hidden' }}>
        {/* BG glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(138,43,226,0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(138,43,226,0.1)', border: '1px solid rgba(138,43,226,0.3)',
            borderRadius: 100, padding: '6px 16px', fontSize: 12, marginBottom: 24, color: 'var(--purple-light)'
          }}>
            ✨ Now live at your campus
          </div>
          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: 'clamp(48px, 8vw, 96px)', lineHeight: 1.05,
            marginBottom: 24
          }}>
            <span style={{ background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Your Campus.
            </span>
            <br />
            Your Match.
          </h1>
          <p style={{ fontSize: 18, color: 'var(--muted)', maxWidth: 500, margin: '0 auto 40px', lineHeight: 1.7 }}>
            The private matchmaking platform for college students. Anonymous likes, mutual matches, real connections.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/verify" style={{
              padding: '14px 36px', borderRadius: 14, background: 'var(--grad)',
              color: '#fff', textDecoration: 'none', fontSize: 16, fontWeight: 600,
              boxShadow: '0 8px 32px rgba(138,43,226,0.4)'
            }}>
              Get Started Free →
            </Link>
            <Link href="/auth/login" style={{
              padding: '14px 36px', borderRadius: 14,
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text)', textDecoration: 'none', fontSize: 16
            }}>
              Already a student? Sign in
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ padding: '60px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, textAlign: 'center', marginBottom: 12 }}>
          Built for real campus life
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: 48 }}>
          Every feature designed to create genuine, meaningful connections.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 20, padding: 28, transition: 'border-color 0.2s'
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(138,43,226,0.15)', border: '1px solid rgba(138,43,226,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
              }}>
                <f.icon size={20} color="var(--purple-light)" />
              </div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 17, marginBottom: 8 }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(138,43,226,0.12), rgba(255,79,216,0.12))',
          border: '1px solid rgba(138,43,226,0.25)', borderRadius: 28,
          padding: '60px 40px', maxWidth: 600, margin: '0 auto'
        }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
            Ready to find your match?
          </h2>
          <p style={{ color: 'var(--muted)', marginBottom: 32, fontSize: 16 }}>
            Join thousands of students already making connections.
          </p>
<Link href="/auth/verify" style={{
              display: 'inline-block', padding: '14px 48px', borderRadius: 14,
              background: 'var(--grad)', color: '#fff', textDecoration: 'none',
              fontSize: 16, fontWeight: 600, boxShadow: '0 8px 32px rgba(138,43,226,0.4)'
            }}>
            Join Campus Match
          </Link>
        </div>
      </section>
    </main>
  )
}
