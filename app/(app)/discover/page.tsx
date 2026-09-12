'use client'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { SlidersHorizontal, Flame, Star, Moon, AlertTriangle, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import { getDiscoverFeed, handleSwipe, getLikesRemaining, decrementLike } from '@/firebase/swipes'
import { UserProfile } from '@/types'
import toast from 'react-hot-toast'
import { startOfTomorrow } from 'date-fns'
import Bb8ThemeToggle from '@/components/Bb8ThemeToggle'

const SWIPE_THRESHOLD = 80
const VELOCITY_THRESHOLD = 0.5

function CardContent({ current, swipeDir }: { current: UserProfile; swipeDir: string | null }) {
  return (
    <>
      <div style={{ height: '60%', position: 'relative', overflow: 'hidden', background: 'var(--grad)' }}>
        {current.profilePhoto ? (
          <img src={current.profilePhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
        ) : (
          <div className="font-display" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, fontWeight: 700, color: 'var(--on-bright)' }}>
            {(current.fullName || '?')[0]}
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(20,15,16,0.65))' }} />
        {swipeDir === 'like' && (
          <div className="font-display" style={{ position: 'absolute', top: 24, left: 24, padding: '10px 20px', borderRadius: 12, border: '3px solid #2f9e6b', color: '#57c98d', fontWeight: 800, fontSize: 28, transform: 'rotate(-15deg)', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
            LIKE
          </div>
        )}
        {swipeDir === 'skip' && (
          <div className="font-display" style={{ position: 'absolute', top: 24, right: 24, padding: '10px 20px', borderRadius: 12, border: '3px solid #e2726d', color: '#e2726d', fontWeight: 800, fontSize: 28, transform: 'rotate(15deg)', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
            SKIP
          </div>
        )}
        {swipeDir === 'like' && <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 60px rgba(47,158,107,0.4)' }} />}
        {swipeDir === 'skip' && <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 60px rgba(226,114,109,0.4)' }} />}
        <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20 }}>
          <div className="font-display" style={{ fontWeight: 700, color: '#fff', lineHeight: 1.15, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, fontSize: (current.fullName?.length || 0) > 22 ? 17 : (current.fullName?.length || 0) > 15 ? 20 : 24 }} title={current.fullName || 'User'}>{current.fullName || 'User'}</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{current.department || 'Campus'} · {current.year}{current.year === 1 ? 'st' : current.year === 2 ? 'nd' : current.year === 3 ? 'rd' : 'th'} Year</div>
        </div>
        <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 6, background: current.online ? 'rgba(47,158,107,0.9)' : 'rgba(38,65,67,0.55)', backdropFilter: 'blur(12px)', padding: '5px 12px', borderRadius: 100, fontSize: 12, color: '#fff', fontWeight: 700, border: '1px solid rgba(255,255,255,0.3)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: current.online ? '#8ee6b8' : '#f0938e', display: 'inline-block' }} />
          {current.online ? 'Active' : 'Not registered'}
        </div>
      </div>
      <div style={{ padding: '18px 20px' }}>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 14, minHeight: 44 }}>{current.bio || 'No bio yet. Get to know them!'}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(current.interests || []).slice(0, 5).map((tag: string) => (
            <span key={tag} className="tag-pill" style={{ fontSize: 12 }}>{tag}</span>
          ))}
          {(!current.interests || current.interests.length === 0) && (
            <span className="tag-pill" style={{ fontSize: 12, opacity: 0.7 }}>Exploring</span>
          )}
        </div>
      </div>
    </>
  )
}

function FeaturedSpotlight({ featured }: { featured: UserProfile | null }) {
  if (!featured) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      style={{ width: '100%', maxWidth: 360, background: 'linear-gradient(135deg, color-mix(in srgb, var(--purple) 20%, transparent), color-mix(in srgb, var(--accent) 25%, transparent))', border: '1px solid color-mix(in srgb, var(--accent) 45%, transparent)', borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, cursor: 'pointer' }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Star size={18} color="var(--on-bright)" fill="var(--on-bright)" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: 'var(--accent-strong)', fontWeight: 700, marginBottom: 2, letterSpacing: '.03em' }}>FEATURED TODAY</div>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{featured.fullName || 'User'}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{(featured.department || 'Campus')} · {(featured.year || 1)}{(featured.year === 1 ? 'st' : 'th')} Year</div>
      </div>
      <span style={{ fontSize: 20, color: 'var(--accent-strong)' }}>→</span>
    </motion.div>
  )
}

function FilterChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 12px', borderRadius: 100, cursor: 'pointer', fontSize: 12, fontWeight: 700,
      background: active ? 'color-mix(in srgb, var(--purple) 16%, transparent)' : 'var(--surface2)',
      border: active ? '1px solid var(--purple)' : '1px solid var(--border2)',
      color: active ? 'var(--purple-light)' : 'var(--muted)',
      transition: 'all 0.15s',
    }}>{label}</button>
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
  const soundEnabled = useState(false)[0]
  const [showFilters, setShowFilters] = useState(false)
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female' | 'other'>('all')
  const [deptFilter, setDeptFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all')
  const [onlineOnly, setOnlineOnly] = useState(false)
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

  const filteredFeed = useMemo(() => {
    return feed.filter((u: UserProfile) => {
      if (genderFilter !== 'all' && (u.gender || 'other') !== genderFilter) return false
      if (deptFilter !== 'all' && (u.department || '') !== deptFilter) return false
      if (yearFilter !== 'all' && (u.year || 1) !== yearFilter) return false
      if (onlineOnly && !u.online) return false
      return true
    })
  }, [feed, genderFilter, deptFilter, yearFilter, onlineOnly])

  useEffect(() => { setCurrentIdx(0); setDragX(0); setDragY(0) }, [genderFilter, deptFilter, yearFilter, onlineOnly])

  const current = filteredFeed[currentIdx]
  const next = filteredFeed[currentIdx + 1]

  const DEPTS = ['Computer Science', 'Electronics', 'Electrical', 'Mechanical', 'Industrial Engineering']
  const YEARS = [1, 2, 3, 4]
  const hasActiveFilters = genderFilter !== 'all' || deptFilter !== 'all' || yearFilter !== 'all' || onlineOnly

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
    if (type === 'like' && likesLeft <= 0) { toast.error('No likes remaining today! Come back tomorrow.'); return }
    setAnimating(true)
    setSwipeDir(type)
    playSound(type)
    const swiped = current
    if (type === 'like') { decrementLike(user.uid).catch(() => {}); setLikesLeft(l => l - 1) }
    handleSwipe(user.uid, swiped.uid, type).then(result => {
      if (result.matched && result.matchId) {
        setTimeout(() => { playSound('match'); triggerMatchPopup(swiped, result.matchId!) }, 300)
      }
    }).catch(() => {})
    setFeed(f => f.filter(u => u.uid !== swiped.uid))
    setTimeout(() => {
      setAnimating(false)
      setSwipeDir(null)
      setDragX(0)
      setDragY(0)
    }, 380)
  }, [current, user, likesLeft, playSound, triggerMatchPopup])

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
    if (now - lastTap < 300) { processSwipe('like'); toast.success('Super Like!') }
    setLastTap(now)
  }

  const localSwipeDir = dragX > 60 ? 'like' : dragX < -60 ? 'skip' : null

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ display: 'inline-flex', marginBottom: 16 }}
        >
          <Sparkles size={44} color="var(--purple)" />
        </motion.div>
        <p className="font-display" style={{ fontWeight: 700, fontSize: 16 }}>Finding your people…</p>
      </div>
    </div>
  )

  const hoursLeft = Math.max(0, Math.ceil((resetTime.getTime() - Date.now()) / (1000 * 60 * 60)))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'var(--surface)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Flame size={18} color="var(--pink)" />
            <h1 className="font-display" style={{ fontSize: 18, fontWeight: 700 }}>Discover</h1>
          </div>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{filteredFeed.length - currentIdx} people left</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Bb8ThemeToggle size={16} />
          <button onClick={() => setShowFilters(s => !s)} style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid var(--border)', background: hasActiveFilters ? 'color-mix(in srgb, var(--purple) 15%, transparent)' : 'var(--surface2)', color: hasActiveFilters ? 'var(--purple-light)' : 'var(--muted)', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
            <SlidersHorizontal size={12} /> Filter {hasActiveFilters && '•'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0, overflow: 'hidden' }}
          >
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="font-display" style={{ fontWeight: 700, fontSize: 15 }}>Filters</span>
                <button onClick={() => { setGenderFilter('all'); setDeptFilter('all'); setYearFilter('all'); setOnlineOnly(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--purple-light)', fontSize: 12, fontWeight: 700 }}>Reset all</button>
              </div>

              <div>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>Gender</span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[['all','Everyone'],['male','Male'],['female','Female'],['other','Other']].map(([val, label]) => (
                    <FilterChip key={val} active={genderFilter === val} label={label} onClick={() => setGenderFilter(val as any)} />
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>Department</span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <FilterChip active={deptFilter === 'all'} label="All" onClick={() => setDeptFilter('all')} />
                  {DEPTS.map(d => <FilterChip key={d} active={deptFilter === d} label={d.split(' ')[0]} onClick={() => setDeptFilter(d)} />)}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>Batch / Year</span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <FilterChip active={yearFilter === 'all'} label="All" onClick={() => setYearFilter('all')} />
                  {YEARS.map(y => <FilterChip key={y} active={yearFilter === y} label={`${y}${y===1?'st':y===2?'nd':y===3?'rd':'th'} Year`} onClick={() => setYearFilter(y)} />)}
                </div>
              </div>

              <button onClick={() => setOnlineOnly(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 10, padding: '10px 12px', cursor: 'pointer' }}>
                <div style={{ width: 36, height: 20, borderRadius: 100, background: onlineOnly ? 'var(--purple)' : 'var(--surface3)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 2, left: onlineOnly ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </div>
                <span style={{ fontWeight: 700 }}>Registered / Online only</span>
              </button>

              <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowFilters(false)} className="btn-primary" style={{ marginTop: 4 }}>
                Apply Filters
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 24px', gap: 16, position: 'relative' }}>
          {featured && <FeaturedSpotlight featured={featured} />}

          <div ref={cardContainerRef} style={{ position: 'relative', width: '100%', maxWidth: 340, height: 460 }}>
            {next && (
              <div style={{ position: 'absolute', inset: 0, background: 'var(--surface)', borderRadius: 28, transform: 'scale(0.96) translateY(6px)', opacity: 0.85, border: '1px solid var(--border)', zIndex: 1, overflow: 'hidden' }}>
                <CardContent current={next} swipeDir={null} />
              </div>
            )}

            {animating && current && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'var(--surface)', borderRadius: 28, overflow: 'hidden', border: '2px solid var(--border)', transform: `translateX(${swipeDir === 'like' ? 500 : -500}px) rotate(${swipeDir === 'like' ? 30 : -30}deg)`, transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)', opacity: 0 }}>
                <CardContent current={current} swipeDir={swipeDir} />
              </div>
            )}

            {current && !animating && (
              <div onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onDoubleClick={handleDoubleTap}
                style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'var(--surface)', borderRadius: 28, overflow: 'hidden', border: `2px solid ${localSwipeDir === 'like' ? '#2f9e6b' : localSwipeDir === 'skip' ? '#e2726d' : 'var(--border)'}`, boxShadow: localSwipeDir === 'like' ? '0 0 40px rgba(47,158,107,0.35)' : localSwipeDir === 'skip' ? '0 0 40px rgba(226,114,109,0.35)' : '0 8px 40px rgba(38,65,67,0.28)', transform: `translateX(${dragX}px) translateY(${dragY}px) rotate(${dragX / 20}deg)`, transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275), border-color 0.15s, box-shadow 0.15s', touchAction: 'none', userSelect: 'none' }}>
                <CardContent current={current} swipeDir={localSwipeDir} />
              </div>
            )}

            {!current && !animating && (
              <div style={{ position: 'absolute', inset: 0, background: 'var(--surface)', borderRadius: 28, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
                <Moon size={48} color="var(--muted)" style={{ marginBottom: 16 }} />
                <p className="font-display" style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>You've seen everyone!</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', maxWidth: 220 }}>Check back tomorrow for new faces.</p>
              </div>
            )}
          </div>

          <div style={{ width: '100%', maxWidth: 320 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Daily Likes</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: likesLeft <= 2 ? '#e2726d' : 'var(--purple-light)' }}>{likesLeft} / 10</span>
            </div>
            <div style={{ height: 5, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${(likesLeft / 10) * 100}%` }}
                transition={{ duration: 0.4 }}
                style={{ height: '100%', background: likesLeft <= 2 ? '#e2726d' : 'var(--grad)', borderRadius: 4 }}
              />
            </div>
            {likesLeft <= 2 && (
              <p style={{ fontSize: 11, color: '#e2726d', marginTop: 6, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <AlertTriangle size={12} /> Resets in {hoursLeft}h
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
