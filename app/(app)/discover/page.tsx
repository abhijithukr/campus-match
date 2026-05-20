'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { SlidersHorizontal, RotateCcw, Volume2, VolumeX, Flame, Star, X, Heart } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import { getDiscoverFeed, handleSwipe, getLikesRemaining, decrementLike } from '@/firebase/swipes'
import { UserProfile } from '@/types'
import toast from 'react-hot-toast'
import { formatDistanceToNow, addDays, startOfTomorrow } from 'date-fns'

const SWIPE_THRESHOLD = 80
const VELOCITY_THRESHOLD = 0.5

function CardContent({ current, swipeDir }: { current: UserProfile; swipeDir: string | null }) {
  const compatScore = current.compatibilityScore || 70 + Math.floor(Math.random() * 25)
  return (
    <>
      <div style={{ height: '60%', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #3d0066, #6600cc, #cc00aa)' }}>
        {current.profilePhoto ? (
          <img src={current.profilePhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, fontFamily: "'Syne', sans-serif", fontWeight: 800 }}>
            {current.fullName[0]}
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.8))' }} />
        {swipeDir === 'like' && (
          <div style={{ position: 'absolute', top: 24, left: 24, padding: '10px 20px', borderRadius: 12, border: '3px solid #22c55e', color: '#22c55e', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, transform: 'rotate(-15deg)', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
            LIKE
          </div>
        )}
        {swipeDir === 'skip' && (
          <div style={{ position: 'absolute', top: 24, right: 24, padding: '10px 20px', borderRadius: 12, border: '3px solid #ff6b6b', color: '#ff6b6b', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, transform: 'rotate(15deg)', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
            SKIP
          </div>
        )}
        {swipeDir === 'like' && <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 60px rgba(34,197,94,0.4)' }} />}
        {swipeDir === 'skip' && <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 60px rgba(255,107,107,0.4)' }} />}
        <div style={{ position: 'absolute', bottom: 16, left: 20 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, color: '#fff' }}>{current.fullName.split(' ')[0]}</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{current.department} · {current.year}{current.year === 1 ? 'st' : current.year === 2 ? 'nd' : current.year === 3 ? 'rd' : 'th'} Year</div>
        </div>
        <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(138,43,226,0.85)', backdropFilter: 'blur(12px)', padding: '5px 12px', borderRadius: 100, fontSize: 13, color: '#fff', fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)' }}>
          {compatScore}% match
        </div>
      </div>
      <div style={{ padding: '18px 20px' }}>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 14, minHeight: 44 }}>{current.bio || 'No bio yet. Get to know them! 🌙'}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(current.interests || []).slice(0, 5).map((tag: string) => (
            <span key={tag} style={{ padding: '4px 12px', borderRadius: 100, background: 'rgba(138,43,226,0.12)', border: '1px solid rgba(138,43,226,0.25)', fontSize: 12, color: 'var(--purple-light)' }}>{tag}</span>
          ))}
          {(!current.interests || current.interests.length === 0) && (
            <span style={{ padding: '4px 12px', borderRadius: 100, background: 'rgba(138,43,226,0.08)', border: '1px solid rgba(138,43,226,0.15)', fontSize: 12, color: 'var(--muted)' }}>Exploring</span>
          )}
        </div>
      </div>
    </>
  )
}

function FeaturedSpotlight({ featured }: { featured: UserProfile | null }) {
  if (!featured) return null
  return (
    <div style={{ width: '100%', maxWidth: 360, background: 'linear-gradient(135deg, rgba(138,43,226,0.12), rgba(255,79,216,0.08))', border: '1px solid rgba(255,210,0,0.3)', borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, cursor: 'pointer', transition: 'all 0.2s', animation: 'featuredPulse 2s infinite' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,210,0,0.6)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,210,0,0.3)')}>
      <style>{`@keyframes featuredPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,210,0,0); } 50% { box-shadow: 0 0 20px 2px rgba(255,210,0,0.15); } }`}</style>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #ffd200, #ff9500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>⭐</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: '#ffd200', fontWeight: 600, marginBottom: 2 }}>FEATURED TODAY</div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{featured.fullName}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{featured.department} · {featured.year}{featured.year === 1 ? 'st' : 'th'} Year</div>
      </div>
      <div style={{ fontSize: 20 }}>→</div>
    </div>
  )
}

export default function DiscoverPage() {
  const { profile, user } = useAuthStore()
  const { triggerMatchPopup } = useAppStore()
  const [feed, setFeed] = useState<UserProfile[]>([])
  const [featured, setFeatured] = useState<UserProfile | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [likesLeft, setLikesLeft] = useState(10)
  const [resetTime, setResetTime] = useState<Date>(new Date())
  const [loading, setLoading] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [velocity, setVelocity] = useState({ x: 0, y: 0 })
  const [animating, setAnimating] = useState(false)
  const [swipeDir, setSwipeDir] = useState<'like' | 'skip' | null>(null)
  const [lastTap, setLastTap] = useState(0)
  const cardContainerRef = useRef<HTMLDivElement>(null)
  const lastMoveRef = useRef({ x: 0, y: 0, t: 0 })
  const startPosRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!user || !profile) return
    const load = async () => {
      const [feedData, likes] = await Promise.all([getDiscoverFeed(user.uid, profile.gender), getLikesRemaining(user.uid)])
      setFeed(feedData as UserProfile[])
      setLikesLeft(likes)
      setResetTime(startOfTomorrow())
      const featuredUsers = (feedData as UserProfile[]).filter((u: UserProfile) => u.featuredToday)
      if (featuredUsers.length > 0) setFeatured(featuredUsers[0])
      setLoading(false)
    }
    load()
  }, [user, profile])

  const current = feed[currentIdx]
  const next = feed[currentIdx + 1]
  const next2 = feed[currentIdx + 2]
  const cycleEnd = addDays(new Date(), 14)

  const playSound = useCallback((type: 'like' | 'skip' | 'match') => {
    if (!soundEnabled) return
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      if (type === 'like') { osc.frequency.value = 880; osc.type = 'sine' }
      else if (type === 'skip') { osc.frequency.value = 220; osc.type = 'triangle' }
      else { osc.frequency.value = 660; osc.type = 'sine' }
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
      osc.start()
      osc.stop(ctx.currentTime + 0.3)
    } catch {}
  }, [soundEnabled])

  const processSwipe = useCallback(async (type: 'like' | 'skip') => {
    if (!current || !user) return
    if (type === 'like' && likesLeft <= 0) { toast.error('No likes remaining today! Come back tomorrow 💔'); return }
    setAnimating(true)
    setSwipeDir(type)
    playSound(type)
    if (type === 'like') { await decrementLike(user.uid); setLikesLeft(l => l - 1) }
    const result = await handleSwipe(user.uid, current.uid, type)
    if (result.matched && result.matchId) {
      setTimeout(() => { playSound('match'); triggerMatchPopup(current, result.matchId!) }, 300)
    }
  }, [current, user, likesLeft, playSound, triggerMatchPopup])

  const handleAnimComplete = () => {
    setAnimating(false)
    setSwipeDir(null)
    setDragX(0)
    setDragY(0)
    setCurrentIdx(i => i + 1)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (animating) return
    setIsDragging(true)
    startPosRef.current = { x: e.clientX, y: e.clientY }
    lastMoveRef.current = { x: e.clientX, y: e.clientY, t: Date.now() }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging || animating) return
    const dx = e.clientX - startPosRef.current.x
    const dy = e.clientY - startPosRef.current.y
    const now = Date.now()
    const dt = Math.max(now - lastMoveRef.current.t, 1)
    setVelocity({ x: (e.clientX - lastMoveRef.current.x) / dt, y: (e.clientY - lastMoveRef.current.y) / dt })
    lastMoveRef.current = { x: e.clientX, y: e.clientY, t: now }
    setDragX(dx)
    setDragY(dy * 0.3)
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return
    setIsDragging(false)
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    const dx = dragX
    const vx = velocity.x
    if (Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(vx) > VELOCITY_THRESHOLD) {
      if (dx > 0) { processSwipe('like') } else { processSwipe('skip') }
    } else {
      setDragX(0)
      setDragY(0)
    }
  }

  const handleDoubleTap = () => {
    if (!current) return
    const now = Date.now()
    if (now - lastTap < 300) { processSwipe('like'); toast.success('Super Like! ⭐') }
    setLastTap(now)
  }

  const localSwipeDir = dragX > 60 ? 'like' : dragX < -60 ? 'skip' : null

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
        <div style={{ fontSize: 48, marginBottom: 16, animation: 'float 2s ease-in-out infinite' }}>💫</div>
        <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16 }}>Finding your people...</p>
      </div>
      <style>{`@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`}</style>
    </div>
  )

  const hoursLeft = Math.max(0, Math.ceil((resetTime.getTime() - Date.now()) / (1000 * 60 * 60)))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'var(--surface)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Flame size={18} color="var(--pink)" />
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800 }}>Discover</h1>
          </div>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{feed.length - currentIdx} people left</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setSoundEnabled(s => !s)} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid var(--border)', background: soundEnabled ? 'rgba(138,43,226,0.1)' : 'var(--surface2)', color: soundEnabled ? 'var(--purple-light)' : 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
          <button style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--muted)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
            <SlidersHorizontal size={12} /> Filter
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 24px', gap: 16, position: 'relative' }}>
          {featured && <FeaturedSpotlight featured={featured} />}

          <div ref={cardContainerRef} style={{ position: 'relative', width: '100%', maxWidth: 340, height: 460 }}>
            {next2 && (
              <div style={{ position: 'absolute', inset: 0, background: 'var(--surface)', borderRadius: 28, transform: 'scale(0.85) translateY(18px)', opacity: 0.35, border: '1px solid var(--border)', zIndex: 1, overflow: 'hidden' }}>
                <div style={{ height: '60%', background: 'var(--surface2)', borderRadius: '28px 28px 0 0' }} />
              </div>
            )}
            {next && (
              <div style={{ position: 'absolute', inset: 0, background: 'var(--surface)', borderRadius: 28, transform: 'scale(0.93) translateY(9px)', opacity: 0.7, border: '1px solid var(--border)', zIndex: 2, overflow: 'hidden' }}>
                <div style={{ height: '60%', background: 'linear-gradient(135deg, #2a0050, #4a0099)', borderRadius: '28px 28px 0 0' }} />
              </div>
            )}

            {animating && current && (
              <div onAnimationEnd={handleAnimComplete} style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'var(--surface)', borderRadius: 28, overflow: 'hidden', border: '2px solid var(--border)', transform: `translateX(${swipeDir === 'like' ? 500 : -500}px) rotate(${swipeDir === 'like' ? 30 : -30}deg)`, transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)', opacity: 0 }}>
                <CardContent current={current} swipeDir={swipeDir} />
              </div>
            )}

            {current && !animating && (
              <div onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onDoubleClick={handleDoubleTap}
                style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'var(--surface)', borderRadius: 28, overflow: 'hidden', border: `2px solid ${localSwipeDir === 'like' ? '#22c55e' : localSwipeDir === 'skip' ? '#ff6b6b' : 'var(--border)'}`, boxShadow: localSwipeDir === 'like' ? '0 0 40px rgba(34,197,94,0.35)' : localSwipeDir === 'skip' ? '0 0 40px rgba(255,107,107,0.35)' : '0 8px 40px rgba(0,0,0,0.4)', transform: `translateX(${dragX}px) translateY(${dragY}px) rotate(${dragX / 20}deg)`, transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275), border-color 0.15s, box-shadow 0.15s', touchAction: 'none', userSelect: 'none' }}>
                <CardContent current={current} swipeDir={localSwipeDir} />
              </div>
            )}

            {!current && !animating && (
              <div style={{ position: 'absolute', inset: 0, background: 'var(--surface)', borderRadius: 28, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🌙</div>
                <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>You've seen everyone!</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', maxWidth: 220 }}>Check back tomorrow for new faces 👀</p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <button onClick={() => processSwipe('skip')} disabled={!current}
              style={{ width: 60, height: 60, borderRadius: '50%', border: '2px solid rgba(255,107,107,0.3)', background: 'rgba(255,107,107,0.08)', cursor: current ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', color: '#ff6b6b' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,107,107,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,107,107,0.08)')}>
              <X size={26} strokeWidth={2.5} />
            </button>
            <button onClick={() => processSwipe('like')} disabled={!current || likesLeft <= 0}
              style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,210,0,0.08)', border: '2px solid rgba(255,210,0,0.3)', cursor: current && likesLeft > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', color: '#ffd200', fontSize: 20 }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,210,0,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,210,0,0.08)')}>
              <Star size={20} fill="#ffd200" strokeWidth={0} />
            </button>
            <button onClick={() => processSwipe('like')} disabled={!current || likesLeft <= 0}
              style={{ width: 64, height: 64, borderRadius: '50%', border: 'none', background: likesLeft > 0 && current ? 'var(--grad)' : 'var(--surface2)', cursor: likesLeft > 0 && current ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: likesLeft > 0 ? '0 4px 24px rgba(255,79,216,0.45)' : 'none', transition: 'all 0.2s', color: '#fff' }}>
              <Heart size={28} fill="white" strokeWidth={0} />
            </button>
          </div>

          <div style={{ width: '100%', maxWidth: 320 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Daily Likes</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: likesLeft <= 2 ? '#ff6b6b' : 'var(--purple-light)' }}>{likesLeft} / 10</span>
            </div>
            <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: likesLeft <= 2 ? '#ff6b6b' : 'var(--grad)', width: `${(likesLeft / 10) * 100}%`, transition: 'width 0.4s', borderRadius: 4 }} />
            </div>
            {likesLeft <= 2 && <p style={{ fontSize: 11, color: '#ff6b6b', marginTop: 6, textAlign: 'center' }}>⚠️ Resets in {hoursLeft}h</p>}
          </div>
        </div>

        {current && (
          <div style={{ width: 240, borderLeft: '1px solid var(--border)', background: 'var(--surface)', padding: 20, overflowY: 'auto', flexShrink: 0 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 84, height: 84, borderRadius: '50%', margin: '0 auto 12px', background: `conic-gradient(var(--purple) 0% ${current.compatibilityScore || 73}%, var(--surface2) ${current.compatibilityScore || 73}%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
                <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'var(--surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: 'var(--purple-light)' }}>{current.compatibilityScore || 73}%</div>
                  <div style={{ fontSize: 9, color: 'var(--muted)' }}>compatibility</div>
                </div>
              </div>
            </div>
            {[{ label: 'Department', val: current.department }, { label: 'Year', val: `${current.year}${current.year === 1 ? 'st' : 'th'} Year` }, { label: 'Music', val: (current.musicTaste || []).slice(0, 2).join(', ') || '—' }, { label: 'Fav Movie', val: current.favoriteMovie || '—' }, { label: 'Goal', val: current.relationshipGoal?.replace('_', ' ') || '—' }].map(({ label, val }) => (
              <div key={label} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 500, display: 'block', marginTop: 2, textTransform: 'capitalize' }}>{val}</span>
              </div>
            ))}
            <div style={{ marginTop: 16 }}>
              <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'block', marginBottom: 10 }}>Interests</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {(current.interests || ['Music', 'Movies', 'Coffee']).map((t: string) => (
                  <span key={t} style={{ padding: '4px 10px', borderRadius: 100, background: 'rgba(138,43,226,0.1)', border: '1px solid rgba(138,43,226,0.2)', fontSize: 11, color: 'var(--purple-light)' }}>{t}</span>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 20, padding: '14px', background: 'rgba(138,43,226,0.06)', border: '1px solid rgba(138,43,226,0.2)', borderRadius: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <RotateCcw size={13} color="var(--purple)" />
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>Fresh Cycle</span>
              </div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: 'var(--purple-light)' }}>{formatDistanceToNow(cycleEnd)}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>until all users reset</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}