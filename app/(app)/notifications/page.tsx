'use client'
import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, updateDoc, doc, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuthStore } from '@/store/useAuthStore'
import { NotificationDoc } from '@/types'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'

const ICONS: Record<string, string> = {
  match: '💜',
  anonymous_like: '👀',
  message: '💬',
  cycle_reset: '🔄',
  featured: '⭐',
}

const BG: Record<string, string> = {
  match: 'rgba(138,43,226,0.12)',
  anonymous_like: 'rgba(255,79,216,0.12)',
  message: 'rgba(34,197,94,0.12)',
  cycle_reset: 'rgba(96,165,250,0.12)',
  featured: 'rgba(255,210,0,0.12)',
}

export default function NotificationsPage() {
  const { user } = useAuthStore()
  const [notifs, setNotifs] = useState<(NotificationDoc & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid)
    )
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as NotificationDoc & { id: string }))
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      setNotifs(data)
      setLoading(false)
    }, () => {
      getDocs(q).then(snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as NotificationDoc & { id: string }))
        data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        setNotifs(data)
        setLoading(false)
      })
    })
    return unsub
  }, [user])

  const markRead = async (id: string) => {
    await updateDoc(doc(db, 'notifications', id), { read: true })
  }

  const markAllRead = async () => {
    notifs.filter(n => !n.read).forEach(n => updateDoc(doc(db, 'notifications', n.id!), { read: true }))
  }

  const handleClick = (n: NotificationDoc & { id: string }) => {
    markRead(n.id!)
    if (n.type === 'match' || n.type === 'message') router.push('/chat')
    if (n.type === 'anonymous_like') router.push('/discover')
  }

  const unread = notifs.filter(n => !n.read).length

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--muted)' }}>Loading...</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700 }}>Notifications</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{unread} unread</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} style={{ padding: '7px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--muted)', cursor: 'pointer', fontSize: 12 }}>
            Mark all read
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        {notifs.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--muted)', paddingTop: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
            <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 6 }}>All caught up!</p>
            <p style={{ fontSize: 13 }}>Notifications will appear here.</p>
          </div>
        ) : notifs.map(n => (
          <div key={n.id} onClick={() => handleClick(n)}
            style={{
              display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 16,
              marginBottom: 8, cursor: 'pointer', transition: 'background 0.15s',
              background: n.read ? 'var(--surface)' : 'rgba(138,43,226,0.06)',
              border: `1px solid ${n.read ? 'var(--border)' : 'rgba(138,43,226,0.25)'}`,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
            onMouseLeave={e => (e.currentTarget.style.background = n.read ? 'var(--surface)' : 'rgba(138,43,226,0.06)')}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, flexShrink: 0,
              background: BG[n.type] || 'var(--surface2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
            }}>
              {ICONS[n.type] || '🔔'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 600 }}>{n.title}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{n.body}</div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>
              {n.createdAt ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true }) : 'just now'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
