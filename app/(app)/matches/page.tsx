'use client'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import { getUserMatches } from '@/firebase/swipes'
import { getUserProfile } from '@/firebase/auth'
import { UserProfile, MatchDoc } from '@/types'
import { useRouter } from 'next/navigation'
import { MessageCircle, RefreshCw } from 'lucide-react'
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
        <div style={{ fontSize: 40, marginBottom: 12 }}>💜</div>
        <p>Loading your matches...</p>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700 }}>Your Matches</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{matches.length} mutual match{matches.length !== 1 ? 'es' : ''} this cycle</p>
        </div>
        <div style={{ padding: '8px 14px', borderRadius: 12, background: 'rgba(138,43,226,0.08)', border: '1px solid rgba(138,43,226,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <RefreshCw size={13} color="var(--purple)" />
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Resets in <strong style={{ color: 'var(--purple-light)' }}>{formatDistanceToNow(cycleEnd)}</strong></span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {matches.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--muted)', paddingTop: 80 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>💔</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>No matches yet</h2>
            <p style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 300, margin: '0 auto 24px' }}>Keep swiping! Someone out there is waiting for a mutual match with you.</p>
            <button onClick={() => router.push('/discover')} style={{ padding: '12px 28px', borderRadius: 12, background: 'var(--grad)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Discover People →
            </button>
          </div>
        ) : (
          <>
            {/* New Matches Row */}
            <h2 style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 14 }}>New Matches</h2>
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16, marginBottom: 28 }}>
              {matches.map(match => {
                const p = matchProfiles[match.id]
                return (
                  <div key={match.id} onClick={() => router.push('/chat')} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'transform 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        width: 70, height: 70, borderRadius: '50%', background: 'var(--grad)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, border: '2.5px solid var(--purple)', overflow: 'hidden'
                      }}>
                        {p?.profilePhoto ? <img src={p.profilePhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : p?.fullName?.[0] || '?'}
                      </div>
                      <div style={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: '50%', background: '#22c55e', border: '2px solid var(--bg)' }} />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--muted)', maxWidth: 70, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p?.fullName?.split(' ')[0] || '...'}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Conversations */}
            <h2 style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>Messages</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {matches.map(match => {
                const p = matchProfiles[match.id]
                return (
                  <div key={match.id} onClick={() => router.push('/chat')}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 16, cursor: 'pointer', transition: 'background 0.15s', background: 'var(--surface)', border: '1px solid var(--border)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--grad)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, overflow: 'hidden' }}>
                      {p?.profilePhoto ? <img src={p.profilePhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : p?.fullName?.[0] || '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{p?.fullName || 'Loading...'}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p?.department} · Say hi! 👋
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{formatDistanceToNow(match.createdAt?.toDate?.() || new Date(), { addSuffix: true })}</span>
                      <MessageCircle size={15} color="var(--muted)" />
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
