export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-body"
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '48px 20px',
        overflowX: 'hidden',
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      {/* Drifting two-tone aurora glow, matching the marketing hero */}
      <div
        className="aurora-blob"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 520, zIndex: 0 }}
      />
      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1, paddingBottom: 40 }}>
        {children}
      </div>
    </div>
  )
}
