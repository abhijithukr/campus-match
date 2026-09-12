'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { X, MessageCircle, Heart } from 'lucide-react'
import { UserProfile } from '@/types'

interface MatchPopupProps {
  matchedUser: UserProfile
  matchId: string
  onClose: () => void
}

export function MatchPopup({ matchedUser, matchId, onClose }: MatchPopupProps) {
  const router = useRouter()

  useEffect(() => {
    const colors = ['#DE5499', '#E99F4C', '#f8d8e7', '#57c98d']
    const fire = (opts: confetti.Options) =>
      confetti({ colors, disableForReducedMotion: true, ...opts })
    fire({ particleCount: 70, spread: 70, origin: { x: 0.5, y: 0.55 }, startVelocity: 45 })
    const t1 = setTimeout(() => fire({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0, y: 0.6 } }), 150)
    const t2 = setTimeout(() => fire({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1, y: 0.6 } }), 150)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const handleStartChat = () => {
    onClose()
    router.push(`/chat?match=${matchId}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(20,15,16,0.6)', backdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }} onClick={(e) => e.target === e.currentTarget && onClose()}>

      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          background: 'linear-gradient(145deg, var(--surface), var(--surface2))',
          border: '1px solid color-mix(in srgb, var(--purple) 45%, transparent)',
          borderRadius: 32, padding: '48px 36px 36px',
          textAlign: 'center', maxWidth: 380, width: '90%',
          boxShadow: '0 0 80px color-mix(in srgb, var(--purple) 32%, transparent), 0 32px 64px rgba(20,15,16,0.25)',
          position: 'relative', overflow: 'hidden',
        }}>

        {/* Close button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'color-mix(in srgb, var(--purple) 10%, transparent)', border: '1px solid var(--border2)',
          borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--muted)',
        }}>
          <X size={15} />
        </button>

        {/* Header */}
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 260 }}
          style={{ display: 'inline-flex', marginBottom: 10 }}
        >
          <Heart size={40} color="var(--purple)" fill="var(--purple)" />
        </motion.div>
        <h2 className="font-display" style={{
          fontWeight: 700, fontSize: 36, marginBottom: 6,
          background: 'var(--grad)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>It's a Match!</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 28 }}>
          You and {matchedUser.fullName} both liked each other!
        </p>

        {/* Avatars */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 12 }}>
          <div className="font-display" style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'var(--grad)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, fontWeight: 700, border: '3px solid var(--surface)', marginRight: -16, zIndex: 1, color: 'var(--on-bright)'
          }}>
            {matchedUser.profilePhoto ? <img src={matchedUser.profilePhoto} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="" /> : <Heart size={26} fill="currentColor" />}
          </div>
          <motion.div
            animate={{ scale: [1, 1.35, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ zIndex: 2, position: 'relative', color: 'var(--purple)' }}
          >
            <Heart size={26} fill="currentColor" />
          </motion.div>
          <div className="font-display" style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--purple))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, fontWeight: 700, border: '3px solid var(--surface)', marginLeft: -16, color: 'var(--on-bright)'
          }}>
            {matchedUser.fullName[0]}
          </div>
        </div>

        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 28 }}>
          {matchedUser.department} · {matchedUser.year}{matchedUser.year === 1 ? 'st' : matchedUser.year === 2 ? 'nd' : matchedUser.year === 3 ? 'rd' : 'th'} Year
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleStartChat} className="btn-primary">
            <MessageCircle size={16} /> Start Chatting
          </motion.button>
          <button onClick={onClose} style={{
            padding: '10px', border: 'none', background: 'none',
            color: 'var(--muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer'
          }}>
            Maybe later
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
