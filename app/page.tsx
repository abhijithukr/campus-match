'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Shield, Zap, Users, Lock, RefreshCw, UserCheck, Compass, MessageCircle, Sparkles, GraduationCap } from 'lucide-react'

const guideSteps = [
  {
    icon: Shield,
    step: '01',
    title: 'Verify your identity',
    desc: 'Click "Join Now" and enter your college register number. It is checked against the official campus list uploaded by your admin, so only real students get in.',
    tip: 'Use the register number on your ID card — e.g. CS21B047.',
  },
  {
    icon: UserCheck,
    step: '02',
    title: 'Set up your profile',
    desc: 'Add your photo, bio, department and interests. A complete profile makes it much more likely people swipe right on you.',
    tip: 'Complete all sections — they show up on your discover card.',
  },
  {
    icon: Compass,
    step: '03',
    title: 'Browse & swipe',
    desc: 'Head to Discover and swipe on students from your campus. Tap the heart to like, or skip past. Every like is anonymous.',
    tip: 'If the person likes you back — it\'s an instant match!',
  },
  {
    icon: MessageCircle,
    step: '04',
    title: 'Match & chat',
    desc: 'Mutual likes unlock a match with confetti, then a private real-time chat. You can also jump straight to WhatsApp with one tap.',
    tip: 'Cycles reset every 14 days, so new people keep coming.',
  },
]

const features = [
  { icon: Lock, title: 'Anonymous Likes', desc: 'Your crush never knows — unless they like you back.', wide: true },
  { icon: Shield, title: 'Verified Students', desc: 'Register number verified. Real people, real campus.' },
  { icon: Zap, title: 'Instant Matches', desc: 'Mutual likes create matches with instant chat access.' },
  { icon: Users, title: 'Campus Only', desc: 'Exclusive to your college. No outsiders, ever.' },
  { icon: RefreshCw, title: '14-Day Cycles', desc: 'Fresh match cycles keep the campus ecosystem alive.', wide: true },
  { icon: Heart, title: 'Real Connections', desc: 'From crush to chat. From chat to something real.' },
]

const trustFacts = [
  { icon: GraduationCap, text: 'Verified students only' },
  { icon: Lock, text: '100% campus-only' },
  { icon: Users, text: 'Anonymous likes' },
  { icon: MessageCircle, text: 'Real conversations' },
  { icon: RefreshCw, text: 'New matches every 14 days' },
  { icon: Sparkles, text: 'Zero strangers off campus' },
]

function Spotlight({ children, style, ...props }: any) {
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }
  return (
    <div className="spotlight" onMouseMove={onMouseMove} style={style} {...props}>
      {children}
    </div>
  )
}

export default function LandingPage() {
  const [activeStep, setActiveStep] = useState(0)
  const active = guideSteps[activeStep]

  return (
    <main className="font-body" style={{ background: 'var(--bg)', minHeight: '100vh', overflow: 'auto', color: 'var(--text)' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 40px', borderBottom: '1px solid var(--border)',
        background: 'color-mix(in srgb, var(--bg) 82%, transparent)', backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div className="font-display" style={{ fontWeight: 700, fontSize: 20, background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Campus Match
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/auth/login" style={{ padding: '9px 20px', borderRadius: 10, border: '1px solid var(--border2)', background: 'var(--surface)', color: 'var(--text)', textDecoration: 'none', fontSize: 14, fontWeight: 600, transition: 'border-color 0.2s' }}>
            Sign In
          </Link>
          <Link href="/auth/verify" style={{ padding: '9px 20px', borderRadius: 10, background: 'var(--purple)', color: 'var(--on-bright)', textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
            Join Now
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '110px 20px 64px', position: 'relative', overflow: 'hidden' }}>
        <div className="aurora-blob" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} style={{ position: 'relative' }}>
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'color-mix(in srgb, var(--purple) 14%, transparent)', border: '1px solid color-mix(in srgb, var(--purple) 35%, transparent)',
              borderRadius: 100, padding: '7px 16px', fontSize: 12.5, fontWeight: 600, marginBottom: 26, color: 'var(--purple-light)'
            }}
          >
            <Sparkles size={13} /> Now live at your campus
          </motion.div>
          <h1 className="font-display" style={{
            fontWeight: 700, fontSize: 'clamp(46px, 8vw, 92px)', lineHeight: 1.03, letterSpacing: '-0.01em',
            marginBottom: 24
          }}>
            <span style={{ background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Your Campus.
            </span>
            <br />
            Your Match.
          </h1>
          <p style={{ fontSize: 18, color: 'var(--muted)', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7 }}>
            The private matchmaking platform for college students. Anonymous likes, mutual matches, real connections.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/auth/verify" style={{
                display: 'inline-block', padding: '15px 38px', borderRadius: 14, background: 'var(--purple)',
                color: 'var(--on-bright)', textDecoration: 'none', fontSize: 16, fontWeight: 700,
                boxShadow: '0 10px 32px -8px color-mix(in srgb, var(--purple) 65%, transparent)'
              }}>
                Get Started Free →
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/auth/login" style={{
                display: 'inline-block', padding: '15px 38px', borderRadius: 14,
                background: 'var(--surface)', border: '1px solid var(--border2)',
                color: 'var(--text)', textDecoration: 'none', fontSize: 16, fontWeight: 600
              }}>
                Already a student? Sign in
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Trust marquee */}
      <div className="marquee-wrap" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '18px 0', background: 'var(--surface2)' }}>
        <div className="marquee-track">
          {[...trustFacts, ...trustFacts].map((f, i) => (
            <span key={i} className="tag-pill" style={{ fontSize: 13, padding: '8px 16px', color: 'var(--text)' }}>
              <f.icon size={14} color="var(--purple)" /> {f.text}
            </span>
          ))}
        </div>
      </div>

      {/* How to use */}
      <section style={{ padding: '80px 20px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 28, padding: '44px 40px 48px', boxShadow: '0 20px 60px rgba(38,65,67,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--purple-light)' }}>The flow</span>
          </div>
          <h2 className="font-display" style={{ fontSize: 34, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
            How it works
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: 36 }}>
            Four simple steps to find your match.
          </p>

          {/* Step tabs */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
            {guideSteps.map((s, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                onMouseEnter={() => setActiveStep(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 18px', borderRadius: 100, cursor: 'pointer',
                  border: `1px solid ${i === activeStep ? 'var(--purple)' : 'var(--border2)'}`,
                  background: i === activeStep ? 'color-mix(in srgb, var(--purple) 14%, transparent)' : 'var(--surface)',
                  color: i === activeStep ? 'var(--purple-light)' : 'var(--muted)',
                  fontWeight: 700, fontSize: 14,
                  transition: 'all 0.2s'
                }}
              >
                <s.icon size={16} color={i === activeStep ? 'var(--purple)' : 'var(--muted)'} />
                {s.title}
              </button>
            ))}
          </div>

          {/* Active step card */}
          <Spotlight>
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'flex', gap: 24, alignItems: 'center',
                background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: 20, padding: 28, position: 'relative',
              }}
            >
              <div style={{
                minWidth: 96, height: 96, borderRadius: 24, flexShrink: 0,
                background: 'var(--grad)', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', color: 'var(--on-bright)', position: 'relative', zIndex: 1,
              }}>
                <active.icon size={32} color="var(--on-bright)" />
                <span className="font-display" style={{ fontWeight: 700, fontSize: 14, marginTop: 4 }}>
                  {active.step}
                </span>
              </div>
              <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                <h3 className="font-display" style={{ fontWeight: 700, fontSize: 22, marginBottom: 10 }}>
                  {active.title}
                </h3>
                <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 14 }}>
                  {active.desc}
                </p>
                <div style={{
                  display: 'inline-flex', gap: 8, alignItems: 'center',
                  background: 'color-mix(in srgb, var(--purple) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--purple) 30%, transparent)',
                  borderRadius: 12, padding: '9px 14px', fontSize: 13, color: 'var(--purple-light)', fontWeight: 600,
                }}>
                  <Zap size={14} />
                  <span>{active.tip}</span>
                </div>
              </div>
            </motion.div>
          </Spotlight>

          {/* Step indicator dots */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
            {guideSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                aria-label={`Go to step ${i + 1}`}
                style={{
                  padding: 0, height: 10, borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: i === activeStep ? 'var(--purple)' : 'var(--surface3)',
                  transition: 'all 0.25s', width: i === activeStep ? 28 : 10
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '20px 40px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 className="font-display" style={{ fontSize: 36, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
          Built for real campus life
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: 48 }}>
          Every feature designed to create genuine, meaningful connections.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {features.map((f, i) => (
            <Spotlight
              key={i}
              style={{ gridColumn: f.wide ? 'span 2' : 'span 1' }}
              className="spotlight"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: (i % 3) * 0.08, duration: 0.5 }}
                whileHover={{ y: -4 }}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 20, padding: 28, transition: 'border-color 0.2s, box-shadow 0.2s',
                  position: 'relative', zIndex: 1, height: '100%',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'color-mix(in srgb, var(--accent) 18%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 35%, transparent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
                }}>
                  <f.icon size={20} color="var(--accent-strong)" />
                </div>
                <h3 className="font-display" style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            </Spotlight>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '20px 20px 96px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'var(--grad)',
            borderRadius: 32,
            padding: '64px 40px', maxWidth: 640, margin: '0 auto', color: 'var(--on-bright)',
            boxShadow: '0 30px 60px -20px color-mix(in srgb, var(--purple) 45%, transparent)',
          }}
        >
          <h2 className="font-display" style={{ fontSize: 38, fontWeight: 700, marginBottom: 16 }}>
            Ready to find your match?
          </h2>
          <p style={{ opacity: 0.85, marginBottom: 32, fontSize: 16 }}>
            Join thousands of students already making connections.
          </p>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-block' }}>
            <Link href="/auth/verify" style={{
              display: 'inline-block', padding: '15px 48px', borderRadius: 14,
              background: 'var(--on-bright)', color: '#fff', textDecoration: 'none',
              fontSize: 16, fontWeight: 700, boxShadow: '0 14px 30px -10px rgba(0,0,0,.35)'
            }}>
              Join Campus Match
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <footer style={{ padding: '32px 24px', textAlign: 'center', fontSize: 13, color: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
        © Campus Match · Built for your campus, not the whole internet.
      </footer>
    </main>
  )
}
