'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import { getUserMatches } from '@/firebase/swipes'
import { getUserProfile } from '@/firebase/auth'
import { UserProfile, MatchDoc } from '@/types'
import { useRouter } from 'next/navigation'
import { MessageCircle, RefreshCw, Heart, HeartCrack, Sparkles } from 'lucide-react'
import { formatDistanceToNow, addDays } from 'date-fns'

export default function MatchesPage() {
  const { user } = useAuthStore()
  const { matches, setMatches } = useAppStore()
  const [matchProfiles, setMatchProfiles] = useState<Record<string, UserProfile>>({})
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const cycleEnd = addDays(new Date(), 14)

  useEffect(() => {
    if (!user) return
    const interval = setInterval(() => {
      if (useAuthStore.getState().profile) {
        clearInterval(interval)
      }
    }, 200)
    const timeout = setTimeout(() => clearInterval(interval), 5000)
    getUserMatches(user.uid).then(async (m) => {
      setMatches(m)
      const profiles: Record<string, UserProfile> = {}
      for (const match of m) {
        const otherId = match.users.find(u => u !== user.uid)
        if (otherId) {
          const p = await getUserProfile(otherId)
          if (p) profiles[match.id] = p
        }
      }
      setMatchProfiles(profiles)
      setLoading(false)
    })
  }, [user])

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1, repeat: Infinity }} style={{ display: 'inline-flex', marginBottom: 12 }}>
          <Heart size={36} color="var(--purple)" fill="var(--purple)" />
        </motion.div>
        <p>Loading your matches…</p>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 18, fontWeight: 700 }}>Your Matches</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{matches.length} mutual match{matches.length !== 1 ? 'es' : ''} this cycle</p>
        </div>
        <div className="match-reset-chip" style={{ padding: '8px 14px', borderRadius: 12, background: 'color-mix(in srgb, var(--purple) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--purple) 28%, transparent)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <RefreshCw size={13} color="var(--purple)" />
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Resets in <strong style={{ color: 'var(--purple-light)' }}>{formatDistanceToNow(cycleEnd)}</strong></span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {matches.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', color: 'var(--muted)', paddingTop: 80 }}>
            <HeartCrack size={52} color="var(--muted)" style={{ marginBottom: 16 }} />
            <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>No matches yet</h2>
            <p style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 300, margin: '0 auto 24px' }}>Keep swiping! Someone out there is waiting for a mutual match with you.</p>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => router.push('/discover')} style={{ padding: '12px 28px', borderRadius: 12, background: 'var(--purple)', border: 'none', color: 'var(--on-bright)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Discover People →
            </motion.button>
          </motion.div>
        ) : (
          <>
            {/* New Matches Row */}
            <h2 style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 14 }}>New Matches</h2>
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16, marginBottom: 28 }}>
              {matches.map((match, i) => {
                const p = matchProfiles[match.id]
                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -4 }}
                    onClick={() => router.push('/chat')}
                    style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                  >
                    <div style={{ position: 'relative' }}>
                      <div className="font-display" style={{
                        width: 70, height: 70, borderRadius: '50%', background: 'var(--grad)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, fontWeight: 700, color: 'var(--on-bright)', border: '2.5px solid var(--purple-light)', overflow: 'hidden'
                      }}>
                        {p?.profilePhoto ? <img src={p.profilePhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : p?.fullName?.[0] || '?'}
                      </div>
                      <div style={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: '50%', background: '#2f9e6b', border: '2px solid var(--bg)' }} />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--muted)', maxWidth: 70, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p?.fullName?.split(' ')[0] || '…'}
                    </span>
                  </motion.div>
                )
              })}
            </div>

            {/* Conversations */}
            <h2 style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>Messages</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {matches.map((match, i) => {
                const p = matchProfiles[match.id]
                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ backgroundColor: 'var(--surface2)' }}
                    onClick={() => router.push('/chat')}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 16, cursor: 'pointer', background: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
                    <div className="font-display" style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--grad)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'var(--on-bright)', overflow: 'hidden' }}>
                      {p?.profilePhoto ? <img src={p.profilePhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : p?.fullName?.[0] || '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{p?.fullName || 'Loading…'}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {p?.department} · Say hi! <Sparkles size={11} />
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{formatDistanceToNow(match.createdAt?.toDate?.() || new Date(), { addSuffix: true })}</span>
                      <MessageCircle size={15} color="var(--muted)" />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
