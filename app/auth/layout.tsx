import { Heart, Shield, Users, Sparkles } from 'lucide-react'

const bullets = [
  { icon: Shield, text: 'Every student verified with their college register number' },
  { icon: Users, text: 'Exclusively for people who actually share your campus' },
  { icon: Sparkles, text: 'Anonymous likes — your crush never knows unless it\'s mutual' },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-body auth-split" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Brand panel */}
      <div className="auth-brand-panel" style={{
        position: 'relative', overflow: 'hidden',
        background: 'var(--text)', color: '#fdf1ec',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 44px',
      }}>
        <div style={{
          position: 'absolute', inset: '-20% -10% auto -10%', height: 520,
          background: 'radial-gradient(closest-side, color-mix(in srgb, var(--purple) 55%, transparent), transparent), radial-gradient(closest-side, color-mix(in srgb, var(--accent) 45%, transparent), transparent)',
          backgroundPosition: '20% 30%, 80% 20%', backgroundRepeat: 'no-repeat', backgroundSize: '70% 70%, 60% 60%',
          filter: 'blur(70px)', opacity: 0.55, pointerEvents: 'none',
        }} />

        <a href="/" className="font-display" style={{
          position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 10,
          fontSize: 19, fontWeight: 700, color: '#fdf1ec', textDecoration: 'none',
        }}>
          <span style={{
            width: 34, height: 34, borderRadius: 10, background: 'var(--grad)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Heart size={16} color="var(--on-bright)" fill="var(--on-bright)" />
          </span>
          Campus Match
        </a>

        <div style={{ position: 'relative', maxWidth: 380 }}>
          <h2 className="font-display" style={{ fontSize: 'clamp(28px, 3vw, 38px)', fontWeight: 700, lineHeight: 1.15, marginBottom: 28 }}>
            The private matchmaking platform, built only for your campus.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {bullets.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{
                  width: 30, height: 30, borderRadius: 9, flexShrink: 0, marginTop: 1,
                  background: 'rgba(253,241,236,0.12)', border: '1px solid rgba(253,241,236,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <b.icon size={14} color="#fdf1ec" />
                </span>
                <span style={{ fontSize: 14.5, lineHeight: 1.6, color: 'rgba(253,241,236,0.85)' }}>{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ position: 'relative', fontSize: 12.5, color: 'rgba(253,241,236,0.5)' }}>
          © Campus Match · Built for your campus, not the whole internet.
        </p>
      </div>

      {/* Form panel */}
      <div className="auth-form-panel" style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '56px 20px', overflowY: 'auto', position: 'relative',
      }}>
        <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1, paddingBottom: 40 }}>
          {children}
        </div>
      </div>
    </div>
  )
}
