'use client'
import { useState, useEffect, useRef } from 'react'
import { SlidersHorizontal, RotateCcw, RefreshCw } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import { getDiscoverFeed, handleSwipe, getLikesRemaining, decrementLike } from '@/firebase/swipes'
import { UserProfile } from '@/types'
import toast from 'react-hot-toast'
import { formatDistanceToNow, addDays } from 'date-fns'

export default function DiscoverPage() {
  const { profile, user } = useAuthStore()
  const { triggerMatchPopup } = useAppStore()
  const [feed, setFeed] = useState<UserProfile[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [likesLeft, setLikesLeft] = useState(10)
  const [loading, setLoading] = useState(true)
  const [dragging, setDragging] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [dragStart, setDragStart] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)
  const cycleEnd = addDays(new Date(), 14)

  useEffect(() => {
    if (!user || !profile) return
    const load = async () => {
      const [feedData, likes] = await Promise.all([
        getDiscoverFeed(user.uid, profile.gender),
        getLikesRemaining(user.uid)
      ])
      setFeed(feedData as UserProfile[])
      setLikesLeft(likes)
      setLoading(false)
    }
    load()
  }, [user, profile])

  const current = feed[currentIdx]
  const next = feed[currentIdx + 1]
  const next2 = feed[currentIdx + 2]

  const onAction = async (type: 'like' | 'skip') => {
    if (!current || !user) return
    if (type === 'like' && likesLeft <= 0) { toast.error('No likes remaining today! Come back tomorrow 💔'); return }

    if (type === 'like') {
      await decrementLike(user.uid)
      setLikesLeft(l => l - 1)
    }

    const result = await handleSwipe(user.uid, current.uid, type)
    if (result.matched && result.matchId) {
      setTimeout(() => triggerMatchPopup(current, result.matchId!), 400)
    }
    setCurrentIdx(i => i + 1)
  }

  // Drag handlers
  const onMouseDown = (e: React.MouseEvent) => { setDragging(true); setDragStart(e.clientX) }
  const onMouseMove = (e: React.MouseEvent) => { if (dragging) setDragX(e.clientX - dragStart) }
  const onMouseUp = (e: React.MouseEvent) => {
    setDragging(false)
    const dx = e.clientX - dragStart
    if (dx > 80) onAction('like')
    else if (dx < -80) onAction('skip')
    setDragX(0)
  }

  const swipeDir = dragX > 60 ? 'like' : dragX < -60 ? 'skip' : null

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>💫</div>
        <p>Finding your people...</p>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{
        padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)', flexShrink: 0
      }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700 }}>Discover People</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            {feed.length - currentIdx} profiles remaining
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ padding: '7px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--muted)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <SlidersHorizontal size={13} /> Filter
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Swipe zone */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>

          {/* Featured banner */}
          <div style={{
            width: '100%', maxWidth: 340,
            background: 'linear-gradient(90deg, rgba(138,43,226,0.1), rgba(255,79,216,0.1))',
            border: '1px solid rgba(255,79,216,0.25)', borderRadius: 14, padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <span>⭐</span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              Today's spotlight: <span style={{ color: 'var(--pink-light)', fontWeight: 500 }}>Nadia K.</span> — CSE Final Year
            </span>
          </div>

          {/* Card stack */}
          {!current ? (
            <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🌙</div>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>You've seen everyone!</p>
              <p style={{ fontSize: 14 }}>Come back tomorrow for a fresh batch.</p>
            </div>
          ) : (
            <div style={{ position: 'relative', width: 320, height: 460 }}>
              {/* Card 3 */}
              {next2 && <div style={{
                position: 'absolute', inset: 0,
                background: 'var(--surface)', borderRadius: 28,
                transform: 'scale(0.88) translateY(20px)', opacity: 0.4,
                border: '1px solid var(--border)', zIndex: 1
              }} />}
              {/* Card 2 */}
              {next && <div style={{
                position: 'absolute', inset: 0,
                background: 'var(--surface2)', borderRadius: 28,
                transform: 'scale(0.94) translateY(10px)', opacity: 0.7,
                border: '1px solid var(--border)', zIndex: 2
              }} />}
              {/* Card 1 - TOP */}
              <div
                ref={cardRef}
                onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
                style={{
                  position: 'absolute', inset: 0, zIndex: 3,
                  background: 'var(--surface)',
                  borderRadius: 28, overflow: 'hidden',
                  border: `1px solid ${swipeDir === 'like' ? 'rgba(34,197,94,0.5)' : swipeDir === 'skip' ? 'rgba(255,107,107,0.5)' : 'var(--border)'}`,
                  boxShadow: `0 20px 60px rgba(138,43,226,0.25)`,
                  transform: `translateX(${dragX}px) rotate(${dragX / 25}deg)`,
                  transition: dragging ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  cursor: dragging ? 'grabbing' : 'grab',
                  userSelect: 'none',
                }}
              >
                {/* Photo area */}
                <div style={{
                  height: '62%', position: 'relative', overflow: 'hidden',
                  background: `linear-gradient(135deg, #3d0066, #6600cc, #cc00aa)`
                }}>
                  {current.profilePhoto && <img src={current.profilePhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.7))' }} />

                  {/* Like/Skip overlay */}
                  {swipeDir === 'like' && <div style={{ position: 'absolute', top: 20, left: 20, padding: '8px 18px', borderRadius: 10, border: '2px solid #22c55e', color: '#22c55e', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, transform: 'rotate(-12deg)' }}>LIKE ✓</div>}
                  {swipeDir === 'skip' && <div style={{ position: 'absolute', top: 20, right: 20, padding: '8px 18px', borderRadius: 10, border: '2px solid #ff6b6b', color: '#ff6b6b', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, transform: 'rotate(12deg)' }}>PASS ✗</div>}

                  {/* Name overlay */}
                  <div style={{ position: 'absolute', bottom: 14, left: 18 }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, color: '#fff' }}>
                      {current.fullName.split(' ')[0]}
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                      {current.department} · {current.year}{current.year === 1 ? 'st' : current.year === 2 ? 'nd' : current.year === 3 ? 'rd' : 'th'} Year
                    </div>
                  </div>

                  {/* Compat badge */}
                  <div style={{
                    position: 'absolute', top: 14, right: 14,
                    background: 'rgba(138,43,226,0.8)', backdropFilter: 'blur(8px)',
                    padding: '4px 10px', borderRadius: 100,
                    fontSize: 12, color: '#fff', fontWeight: 600
                  }}>
                    {70 + Math.floor(Math.random() * 25)}% match
                  </div>
                </div>

                {/* Info area */}
                <div style={{ padding: '16px 18px' }}>
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 12 }}>
                    {current.bio || 'No bio yet. Mystery person. 🌙'}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(current.interests || []).slice(0, 4).map(tag => (
                      <span key={tag} style={{
                        padding: '3px 10px', borderRadius: 100,
                        background: 'rgba(138,43,226,0.12)', border: '1px solid rgba(138,43,226,0.25)',
                        fontSize: 11, color: 'var(--purple-light)'
                      }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {current && (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <button onClick={() => onAction('skip')} style={{
                width: 56, height: 56, borderRadius: '50%', border: '1px solid var(--border)',
                background: 'var(--surface2)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, transition: 'all 0.2s', color: 'var(--muted)'
              }} title="Skip">✕</button>
              <button style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'rgba(255,210,0,0.1)', border: '1px solid rgba(255,210,0,0.3)',
                cursor: 'pointer', fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }} title="Super Like">⭐</button>
              <button onClick={() => onAction('like')} disabled={likesLeft <= 0} style={{
                width: 56, height: 56, borderRadius: '50%', border: 'none',
                background: likesLeft > 0 ? 'var(--grad)' : 'var(--surface2)',
                cursor: likesLeft > 0 ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, boxShadow: likesLeft > 0 ? '0 4px 20px rgba(255,79,216,0.4)' : 'none',
                transition: 'all 0.2s'
              }} title="Like">♥</button>
            </div>
          )}

          {/* Likes remaining */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: likesLeft <= 3 ? '#ff6b6b' : 'var(--muted)', marginBottom: 6 }}>
              Likes remaining today: <strong style={{ color: likesLeft <= 3 ? '#ff6b6b' : 'var(--purple-light)' }}>{likesLeft} / 10</strong>
            </p>
            <div style={{ width: 200, height: 3, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden', margin: '0 auto' }}>
              <div style={{ height: '100%', background: 'var(--grad)', width: `${(likesLeft / 10) * 100}%`, transition: 'width 0.4s', borderRadius: 2 }} />
            </div>
          </div>
        </div>

        {/* Profile detail panel */}
        {current && (
          <div style={{
            width: 260, borderLeft: '1px solid var(--border)',
            background: 'var(--surface)', padding: 20, overflowY: 'auto', flexShrink: 0
          }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              {/* Compat ring */}
              <div style={{
                width: 80, height: 80, borderRadius: '50%', margin: '0 auto 12px',
                background: `conic-gradient(var(--purple) 0% ${current.compatibilityScore || 73}%, var(--surface2) ${current.compatibilityScore || 73}%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{ width: 62, height: 62, borderRadius: '50%', background: 'var(--surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 800, color: 'var(--purple-light)' }}>{current.compatibilityScore || 73}%</div>
                  <div style={{ fontSize: 9, color: 'var(--muted)' }}>match</div>
                </div>
              </div>
            </div>

            <h3 style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>Details</h3>
            {[
              { label: 'Department', val: current.department },
              { label: 'Year', val: `${current.year}${current.year === 1 ? 'st' : current.year === 2 ? 'nd' : current.year === 3 ? 'rd' : 'th'} Year` },
              { label: 'Music', val: (current.musicTaste || []).slice(0, 2).join(', ') || '—' },
              { label: 'Fav Movie', val: current.favoriteMovie || '—' },
              { label: 'Goal', val: current.relationshipGoal || '—' },
            ].map(({ label, val }) => (
              <div key={label} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{val}</span>
              </div>
            ))}

            <div style={{ marginTop: 16 }}>
              <h3 style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>Interests</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(current.interests || ['Music', 'Movies', 'Coffee']).map(t => (
                  <span key={t} style={{ padding: '3px 10px', borderRadius: 100, background: 'rgba(138,43,226,0.12)', border: '1px solid rgba(138,43,226,0.25)', fontSize: 11, color: 'var(--purple-light)' }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Cycle timer */}
            <div style={{
              marginTop: 16, padding: '12px 14px',
              background: 'rgba(138,43,226,0.06)', border: '1px solid rgba(138,43,226,0.2)',
              borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>Cycle resets in</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: 'var(--purple-light)' }}>
                  {formatDistanceToNow(cycleEnd)}
                </div>
              </div>
              <RefreshCw size={16} color="var(--purple)" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
