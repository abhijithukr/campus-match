'use client'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { submitConfession, subscribeToApprovedConfessions, toggleConfessionLike } from '@/firebase/confessions'
import { ConfessionDoc } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export default function ConfessionsPage() {
  const { user, profile } = useAuthStore()
  const [confessions, setConfessions] = useState<(ConfessionDoc & { id: string })[]>([])
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeToApprovedConfessions((data) => {
      setConfessions(data)
      setLoading(false)
    })
    return unsub
  }, [])

  const handleSubmit = async () => {
    if (!text.trim() || !user || !profile) return
    setSubmitting(true)
    try {
      await submitConfession(user.uid, text.trim(), profile.department, profile.year)
      setText('')
      toast.success('Confession submitted! Awaiting admin approval 🔒')
    } catch {
      toast.error('Failed to submit. Try again.')
    } finally { setSubmitting(false) }
  }

  const handleLike = async (confessionId: string) => {
    const liked = likedIds.has(confessionId)
    setLikedIds(prev => {
      const next = new Set(prev)
      liked ? next.delete(confessionId) : next.add(confessionId)
      return next
    })
    await toggleConfessionLike(confessionId, user?.uid || '', !liked)
  }

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--muted)' }}>Loading...</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700 }}>Confession Wall</h1>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Anonymous. Unfiltered. Campus energy.</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {/* Input card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 20, marginBottom: 24 }}>
          <textarea
            value={text} onChange={e => setText(e.target.value)}
            placeholder="Share a confession, crush note, or random thought... 🤫"
            maxLength={300}
            style={{
              width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '12px 16px', color: 'var(--text)',
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, resize: 'none',
              outline: 'none', minHeight: 80, lineHeight: 1.6,
              transition: 'border-color 0.2s'
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--purple)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>
              🔒 Completely anonymous · Reviewed before posting · {text.length}/300
            </div>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || submitting}
              style={{
                padding: '8px 20px', borderRadius: 10, border: 'none',
                background: text.trim() ? 'var(--grad)' : 'var(--surface2)',
                color: text.trim() ? '#fff' : 'var(--muted)',
                fontSize: 13, fontWeight: 500, cursor: text.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}>
              {submitting ? 'Posting...' : 'Post Anonymously'}
            </button>
          </div>
        </div>

        {/* Confessions list */}
        {confessions.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--muted)', paddingTop: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🤫</div>
            <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 6 }}>No confessions yet</p>
            <p style={{ fontSize: 13 }}>Be the first to post something anonymous!</p>
          </div>
        ) : confessions.map(conf => (
          <div key={conf.id}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 20, padding: 20, marginBottom: 14,
              transition: 'border-color 0.2s'
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(138,43,226,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👤</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Anonymous · {conf.department}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {conf.year}{conf.year === 1 ? 'st' : conf.year === 2 ? 'nd' : conf.year === 3 ? 'rd' : 'th'} Year · {conf.createdAt ? formatDistanceToNow(conf.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                </div>
              </div>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: '#ccc', marginBottom: 14 }}>{conf.text}</p>
            <div style={{ display: 'flex', gap: 16 }}>
              <button onClick={() => handleLike(conf.id!)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, display: 'flex', alignItems: 'center', gap: 5,
                  color: likedIds.has(conf.id!) ? 'var(--pink)' : 'var(--muted)',
                  transition: 'color 0.2s'
                }}>
                {likedIds.has(conf.id!) ? '♥' : '♡'} {conf.likes + (likedIds.has(conf.id!) ? 1 : 0)}
              </button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                💬 {conf.comments?.length || 0}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
