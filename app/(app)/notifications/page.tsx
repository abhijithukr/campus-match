'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { collection, query, where, onSnapshot, updateDoc, doc, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuthStore } from '@/store/useAuthStore'
import { NotificationDoc } from '@/types'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Heart, Eye, MessageCircle, RefreshCw, Star, Bell, BellRing } from 'lucide-react'

const ICONS: Record<string, any> = {
  match: Heart,
  anonymous_like: Eye,
  message: MessageCircle,
  cycle_reset: RefreshCw,
  featured: Star,
}

const ICON_COLOR: Record<string, string> = {
  match: 'var(--purple)',
  anonymous_like: 'var(--purple)',
  message: '#2f9e6b',
  cycle_reset: '#5b9bd5',
  featured: 'var(--accent-strong)',
}

const BG: Record<string, string> = {
  match: 'color-mix(in srgb, var(--purple) 16%, transparent)',
  anonymous_like: 'color-mix(in srgb, var(--purple) 16%, transparent)',
  message: 'color-mix(in srgb, #2f9e6b 14%, transparent)',
  cycle_reset: 'color-mix(in srgb, #5b9bd5 16%, transparent)',
  featured: 'color-mix(in srgb, var(--accent) 22%, transparent)',
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
      <p style={{ color: 'var(--muted)' }}>Loading…</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 18, fontWeight: 700 }}>Notifications</h1>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{unread} unread</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} style={{ padding: '7px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--muted)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            Mark all read
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        {notifs.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--muted)', paddingTop: 80 }}>
            <BellRing size={44} color="var(--muted)" style={{ margin: '0 auto 12px' }} />
            <p className="font-display" style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 6 }}>All caught up!</p>
            <p style={{ fontSize: 13 }}>Notifications will appear here.</p>
          </div>
        ) : notifs.map((n, i) => {
          const Icon = ICONS[n.type] || Bell
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              whileHover={{ backgroundColor: 'var(--surface2)' }}
              onClick={() => handleClick(n)}
              style={{
                display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 16,
                marginBottom: 8, cursor: 'pointer',
                background: n.read ? 'var(--surface)' : 'color-mix(in srgb, var(--purple) 10%, transparent)',
                border: `1px solid ${n.read ? 'var(--border)' : 'color-mix(in srgb, var(--purple) 30%, transparent)'}`,
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                background: BG[n.type] || 'var(--surface2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={19} color={ICON_COLOR[n.type] || 'var(--muted)'} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: n.read ? 500 : 700 }}>{n.title}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{n.body}</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>
                {n.createdAt ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true }) : 'just now'}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
