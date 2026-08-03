'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X, MessageCircle } from 'lucide-react'
import { UserProfile } from '@/types'

interface MatchPopupProps {
  matchedUser: UserProfile
  matchId: string
  onClose: () => void
}

export function MatchPopup({ matchedUser, matchId, onClose }: MatchPopupProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    spawnConfetti()
  }, [])

  function spawnConfetti() {
    const container = containerRef.current
    if (!container) return
    const colors = ['#fe019a', '#ffc6c7', '#ffd200', '#c3f0ca', '#60a5fa', '#f97316']
    for (let i = 0; i < 50; i++) {
      const piece = document.createElement('div')
      const size = 4 + Math.random() * 8
      piece.style.cssText = `
        position:absolute;
        width:${size}px; height:${size}px;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
        left:${Math.random() * 100}%;
        top:-10px;
        animation: confettiFall ${1.5 + Math.random() * 1.5}s ease-in ${Math.random() * 0.8}s forwards;
        pointer-events:none;
      `
      container.appendChild(piece)
    }
  }

  const handleStartChat = () => {
    onClose()
    router.push(`/chat/${matchId}`)
  }

  const handleWhatsApp = () => {
    if (matchedUser.whatsappNumber) {
      window.open(`https://wa.me/${matchedUser.whatsappNumber.replace(/\D/g, '')}`, '_blank')
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(51,39,42,0.6)', backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.3s ease'
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(500px) rotate(720deg); opacity: 0; }
        }
        @keyframes popIn {
          0% { transform: scale(0.6); opacity: 0; }
          70% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes heartPulse {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.4); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div style={{
        background: 'linear-gradient(145deg, #fffffe, #fdf1eb)',
        border: '1px solid rgba(254,1,154,0.5)',
        borderRadius: 32, padding: '48px 36px 36px',
        textAlign: 'center', maxWidth: 380, width: '90%',
        boxShadow: '0 0 80px rgba(254,1,154,0.35), 0 32px 64px rgba(51,39,42,0.25)',
        position: 'relative', overflow: 'hidden',
        animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
      }} ref={containerRef}>

        {/* Close button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(254,1,154,0.1)', border: '1px solid var(--border2)',
          borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--muted)', transition: 'all 0.2s'
        }}>
          <X size={15} />
        </button>

        {/* Header */}
        <div style={{ fontSize: 42, marginBottom: 8 }}>💜</div>
        <h2 style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 36, marginBottom: 6,
          background: 'linear-gradient(135deg, #fe019a, #e0557e)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>It's a Match!</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 28 }}>
          You and {matchedUser.fullName} both liked each other!
        </p>

        {/* Avatars */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 12 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #fe019a, #ffc6c7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, border: '3px solid #fffffe', marginRight: -16, zIndex: 1, color: '#33272a'
          }}>
            {matchedUser.profilePhoto ? <img src={matchedUser.profilePhoto} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="" /> : '💜'}
          </div>
          <div style={{ fontSize: 28, animation: 'heartPulse 1s infinite', zIndex: 2, position: 'relative' }}>💜</div>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #ffc6c7, #fe019a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, border: '3px solid #fffffe', marginLeft: -16, color: '#33272a'
          }}>
            {matchedUser.fullName[0]}
          </div>
        </div>

        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 28 }}>
          {matchedUser.department} · {matchedUser.year}{matchedUser.year === 1 ? 'st' : matchedUser.year === 2 ? 'nd' : matchedUser.year === 3 ? 'rd' : 'th'} Year
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={handleStartChat} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '13px 24px', borderRadius: 14, background: 'var(--purple)',
            border: 'none', color: '#33272a', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', transition: 'opacity 0.2s'
          }}>
            <MessageCircle size={16} /> Start Chatting
          </button>
          {matchedUser.whatsappNumber && (
            <button onClick={handleWhatsApp} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '13px 24px', borderRadius: 14,
              background: 'rgba(47,158,68,0.1)', border: '1px solid rgba(47,158,68,0.3)',
              color: 'var(--green-strong)', fontSize: 14, cursor: 'pointer', transition: 'all 0.2s'
            }}>
              <span>📱</span> Open WhatsApp
            </button>
          )}
          <button onClick={onClose} style={{
            padding: '10px', border: 'none', background: 'none',
            color: 'var(--muted)', fontSize: 13, cursor: 'pointer'
          }}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
