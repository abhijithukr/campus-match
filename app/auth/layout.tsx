export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '40px 20px', overflowX: 'hidden', overflowY: 'auto',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      {/* Background gradient orb */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 500, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(138,43,226,0.08) 0%, transparent 70%)',
      }} />
      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1, paddingBottom: 40 }}>
        {children}
      </div>
    </div>
  )
}
