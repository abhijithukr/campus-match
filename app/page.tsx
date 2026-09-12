'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Shield, Zap, Users, Lock, RefreshCw, UserCheck, Compass, MessageCircle, Sparkles, GraduationCap, X, ArrowRight, Star } from 'lucide-react'

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

const stats = [
  { value: '100%', label: 'Campus verified' },
  { value: '14', label: 'Day match cycles' },
  { value: '0', label: 'Strangers off-campus' },
  { value: '24/7', label: 'Real-time chat' },
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

function PhoneMockup() {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 340, margin: '0 auto' }}>
      {/* floating match badge */}
      <motion.div
        initial={{ opacity: 0, y: 10, rotate: -8 }}
        animate={{ opacity: 1, y: 0, rotate: -8 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        style={{
          position: 'absolute', top: 18, left: -36, zIndex: 3,
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
          padding: '10px 14px', boxShadow: '0 16px 32px -10px color-mix(in srgb, var(--purple) 40%, transparent)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}
      >
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Heart size={13} color="var(--on-bright)" fill="var(--on-bright)" />
        </div>
        <div>
          <div className="font-display" style={{ fontSize: 12, fontWeight: 700 }}>It's a Match!</div>
          <div style={{ fontSize: 10, color: 'var(--muted)' }}>Just now</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10, rotate: 6 }}
        animate={{ opacity: 1, y: 0, rotate: 6 }}
        transition={{ delay: 0.75, duration: 0.5 }}
        style={{
          position: 'absolute', bottom: 66, right: -30, zIndex: 3,
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
          padding: '9px 13px', boxShadow: '0 16px 32px -10px color-mix(in srgb, var(--accent) 45%, transparent)',
          display: 'flex', alignItems: 'center', gap: 7,
        }}
      >
        <Star size={13} color="var(--accent-strong)" fill="var(--accent-strong)" />
        <span style={{ fontSize: 11.5, fontWeight: 700 }}>Verified · CET</span>
      </motion.div>

      {/* device frame */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        style={{
          position: 'relative', zIndex: 2,
          background: 'var(--text)', borderRadius: 40, padding: 12,
          boxShadow: '0 40px 80px -24px color-mix(in srgb, var(--purple) 45%, transparent), 0 12px 24px -8px rgba(20,15,16,0.25)',
        }}
      >
        <div style={{ background: 'var(--bg)', borderRadius: 30, overflow: 'hidden', position: 'relative' }}>
          {/* notch */}
          <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 70, height: 16, borderRadius: 10, background: 'var(--text)', zIndex: 2 }} />
          {/* card photo area */}
          <div style={{
            height: 300, position: 'relative',
            background: 'linear-gradient(160deg, var(--purple) 0%, var(--accent) 100%)',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,15,16,0.65), transparent 55%)' }} />
            <div style={{ position: 'absolute', bottom: 16, left: 18, right: 18, color: '#fff' }}>
              <div className="font-display" style={{ fontSize: 20, fontWeight: 700 }}>Aisha, 20</div>
              <div style={{ fontSize: 12.5, opacity: 0.9, marginTop: 2 }}>Computer Science · 3rd Year</div>
            </div>
          </div>
          {/* action row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, padding: '18px 0 26px', background: 'var(--surface)' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={20} color="var(--muted)" />
            </div>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 24px -6px color-mix(in srgb, var(--purple) 55%, transparent)' }}>
              <Heart size={24} color="var(--on-bright)" fill="var(--on-bright)" />
            </div>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={18} color="var(--accent-strong)" />
            </div>
          </div>
        </div>
      </motion.div>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <img src="/brand/love-pic-icon.png" alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          <span className="font-display" style={{ fontWeight: 800, fontSize: 20, background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Love Pic
          </span>
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

      {/* Hero — split layout */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '72px 40px 40px' }}>
        <div className="aurora-blob" />
        <div style={{
          position: 'relative', maxWidth: 1180, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'minmax(0,1.05fr) minmax(0,0.95fr)', gap: 48,
          alignItems: 'center',
        }} className="hero-grid">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'color-mix(in srgb, var(--purple) 14%, transparent)', border: '1px solid color-mix(in srgb, var(--purple) 35%, transparent)',
                borderRadius: 100, padding: '7px 16px', fontSize: 12.5, fontWeight: 600, marginBottom: 24, color: 'var(--purple-light)'
              }}
            >
              <Sparkles size={13} /> Now live at your campus
            </motion.div>
            <h1 className="font-display" style={{
              fontWeight: 700, fontSize: 'clamp(40px, 5.4vw, 70px)', lineHeight: 1.04, letterSpacing: '-0.02em',
              marginBottom: 22
            }}>
              Find your{' '}
              <span style={{ background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                person
              </span>
              , someone worth the climb.
            </h1>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 18 }}>
              Higher Together
            </div>
            <p style={{ fontSize: 17, color: 'var(--muted)', maxWidth: 460, marginBottom: 34, lineHeight: 1.7 }}>
              The private matchmaking platform built only for verified students at your college. Anonymous likes, mutual matches, real conversations.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 40 }}>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/auth/verify" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 30px', borderRadius: 14, background: 'var(--purple)',
                  color: 'var(--on-bright)', textDecoration: 'none', fontSize: 15.5, fontWeight: 700,
                  boxShadow: '0 10px 32px -8px color-mix(in srgb, var(--purple) 65%, transparent)'
                }}>
                  Get Started Free <ArrowRight size={16} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/auth/login" style={{
                  display: 'inline-block', padding: '15px 30px', borderRadius: 14,
                  background: 'var(--surface)', border: '1px solid var(--border2)',
                  color: 'var(--text)', textDecoration: 'none', fontSize: 15.5, fontWeight: 600
                }}>
                  Already a student? Sign in
                </Link>
              </motion.div>
            </div>

            {/* stats row */}
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              {stats.map((s, i) => (
                <div key={i}>
                  <div className="font-display" style={{ fontSize: 24, fontWeight: 700, background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="hero-mockup">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* Trust marquee */}
      <div className="marquee-wrap" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '18px 0', background: 'var(--surface2)', marginTop: 24 }}>
        <div className="marquee-track">
          {[...trustFacts, ...trustFacts].map((f, i) => (
            <span key={i} className="tag-pill" style={{ fontSize: 13, padding: '8px 16px', color: 'var(--text)' }}>
              <f.icon size={14} color="var(--purple)" /> {f.text}
            </span>
          ))}
        </div>
      </div>

      {/* How to use — editorial split */}
      <section style={{ padding: '96px 40px', maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,0.8fr) minmax(0,1.2fr)', gap: 56 }} className="steps-grid">
          <div>
            <span style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--purple-light)' }}>The flow</span>
            <h2 className="font-display" style={{ fontSize: 38, fontWeight: 700, marginTop: 10, marginBottom: 16, lineHeight: 1.1 }}>
              How it works
            </h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: 32, maxWidth: 380 }}>
              Four simple steps from sign-up to your first real conversation.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {guideSteps.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  onMouseEnter={() => setActiveStep(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
                    padding: '14px 16px', borderRadius: 14, cursor: 'pointer', border: 'none',
                    background: i === activeStep ? 'var(--surface)' : 'transparent',
                    boxShadow: i === activeStep ? '0 8px 24px -12px color-mix(in srgb, var(--purple) 40%, transparent)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <span className="font-display" style={{
                    fontSize: 13, fontWeight: 700, width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: i === activeStep ? 'var(--grad)' : 'var(--surface2)',
                    color: i === activeStep ? 'var(--on-bright)' : 'var(--muted)',
                  }}>{s.step}</span>
                  <span style={{ fontSize: 15, fontWeight: i === activeStep ? 700 : 500, color: i === activeStep ? 'var(--text)' : 'var(--muted)' }}>{s.title}</span>
                </button>
              ))}
            </div>
          </div>

          <Spotlight style={{ alignSelf: 'start' }}>
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 28, padding: 40, position: 'relative', overflow: 'hidden',
              }}
            >
              <span className="font-display" style={{
                position: 'absolute', top: -16, right: 8, fontSize: 140, fontWeight: 700,
                color: 'color-mix(in srgb, var(--purple) 6%, transparent)', lineHeight: 1, userSelect: 'none',
              }}>{active.step}</span>
              <div style={{
                width: 64, height: 64, borderRadius: 18, marginBottom: 22,
                background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', zIndex: 1,
              }}>
                <active.icon size={28} color="var(--on-bright)" />
              </div>
              <h3 className="font-display" style={{ fontWeight: 700, fontSize: 24, marginBottom: 12, position: 'relative', zIndex: 1 }}>
                {active.title}
              </h3>
              <p style={{ fontSize: 15.5, color: 'var(--muted)', lineHeight: 1.75, marginBottom: 20, position: 'relative', zIndex: 1, maxWidth: 440 }}>
                {active.desc}
              </p>
              <div style={{
                display: 'inline-flex', gap: 8, alignItems: 'center', position: 'relative', zIndex: 1,
                background: 'color-mix(in srgb, var(--purple) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--purple) 30%, transparent)',
                borderRadius: 12, padding: '9px 14px', fontSize: 13, color: 'var(--purple-light)', fontWeight: 600,
              }}>
                <Zap size={14} />
                <span>{active.tip}</span>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 28, position: 'relative', zIndex: 1 }}>
                {guideSteps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    aria-label={`Go to step ${i + 1}`}
                    style={{
                      padding: 0, height: 8, borderRadius: 6, border: 'none', cursor: 'pointer',
                      background: i === activeStep ? 'var(--purple)' : 'var(--surface3)',
                      transition: 'all 0.25s', width: i === activeStep ? 24 : 8
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </Spotlight>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '20px 40px 96px', maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 44, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--purple-light)' }}>Why Love Pic</span>
            <h2 className="font-display" style={{ fontSize: 36, fontWeight: 700, marginTop: 10 }}>
              Built for real campus life
            </h2>
          </div>
          <p style={{ color: 'var(--muted)', maxWidth: 340, fontSize: 15, lineHeight: 1.6 }}>
            Every feature designed around one goal: genuine, meaningful connections between people who actually share a campus.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="features-grid">
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
      <section style={{ padding: '20px 40px 96px', maxWidth: 1180, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'var(--grad)', position: 'relative', overflow: 'hidden',
            borderRadius: 36, padding: '72px 48px', color: 'var(--on-bright)',
            boxShadow: '0 30px 60px -20px color-mix(in srgb, var(--purple) 45%, transparent)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, opacity: 0.5, background: 'radial-gradient(circle at 85% 20%, rgba(255,255,255,0.35), transparent 55%)' }} />
          <div style={{ position: 'relative', maxWidth: 440 }}>
            <h2 className="font-display" style={{ fontSize: 34, fontWeight: 700, marginBottom: 14, lineHeight: 1.1 }}>
              Ready to find your match?
            </h2>
            <p style={{ opacity: 0.85, fontSize: 15.5, lineHeight: 1.6 }}>
              Join students already making real connections on your own campus.
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ position: 'relative' }}>
            <Link href="/auth/verify" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 40px', borderRadius: 14,
              background: 'var(--on-bright)', color: '#fff', textDecoration: 'none',
              fontSize: 16, fontWeight: 700, boxShadow: '0 14px 30px -10px rgba(0,0,0,.35)'
            }}>
              Join Love Pic <ArrowRight size={17} />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <footer style={{ padding: '32px 24px', textAlign: 'center', fontSize: 13, color: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
        © Love Pic · Built for your campus, not the whole internet.
      </footer>
    </main>
  )
}
