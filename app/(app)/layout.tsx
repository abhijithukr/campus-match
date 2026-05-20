'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Flame, Heart, MessageCircle, Feather, Bell, Settings } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import { MatchPopup } from '@/components/animations/MatchPopup'
import { subscribeToNotifications } from '@/firebase/notifications'

const navItems = [
  { href: '/discover', icon: Flame, label: 'Discover' },
  { href: '/matches', icon: Heart, label: 'Matches' },
  { href: '/chat', icon: MessageCircle, label: 'Chat' },
  { href: '/confessions', icon: Feather, label: 'Confessions' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, profile } = useAuthStore()
  const { showMatchPopup, matchedUser, currentMatchId, closeMatchPopup, setUnreadNotifications } = useAppStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    try {
      return subscribeToNotifications(user.uid, (notifs) => {
        try {
          setUnreadNotifications(notifs.filter(n => n && !n.read).length)
        } catch {}
      })
    } catch {}
  }, [user])

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Heart size={22} color="white" fill="white" />
          </div>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', fontFamily: "'DM Sans', sans-serif", color: 'var(--text)', overflow: 'hidden' }}>
      {/* Sidebar */}
      <nav style={{
        width: 68, background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '16px 0', gap: 4, flexShrink: 0, zIndex: 10, height: '100vh', overflowY: 'auto'
      }}>
        {/* Logo */}
        <Link href="/discover" style={{
          width: 40, height: 40, borderRadius: 12, background: 'var(--grad)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16, textDecoration: 'none',
          fontFamily: "'Syne', sans-serif", fontWeight: 800, color: '#fff', fontSize: 14
        }}>CM</Link>

        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname.startsWith(href)
          const unread = label === 'Notifications' ? useAppStore.getState().unreadNotifications : 0
          return (
            <Link key={href} href={href} title={label} style={{
              width: 44, height: 44, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none', transition: 'all 0.2s',
              background: isActive ? 'rgba(138,43,226,0.18)' : 'transparent',
              color: isActive ? 'var(--purple-light)' : 'var(--muted)',
              position: 'relative',
            }}>
              {unread > 0 ? (
                <div style={{ position: 'relative' }}>
                  <Icon size={18} />
                  <div style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#ff6b6b', color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--surface)' }}>
                    {unread > 9 ? '9+' : unread}
                  </div>
                </div>
              ) : <Icon size={18} />}
            </Link>
          )
        })}

        {/* Bottom */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <Link href="/profile" title="Settings" style={{
            width: 44, height: 44, borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none', color: 'var(--muted)',
            background: pathname.startsWith('/profile') ? 'rgba(138,43,226,0.18)' : 'transparent',
          }}>
            <Settings size={18} />
          </Link>
          <Link href="/profile" style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: '#fff',
            textDecoration: 'none', outline: '2px solid rgba(138,43,226,0.4)', outlineOffset: 2
          }}>
            {profile?.profilePhoto ? <img src={profile.profilePhoto} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} alt="" /> : (profile?.fullName?.[0] || 'U')}
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </main>

      {/* Match Popup */}
      {showMatchPopup && matchedUser && currentMatchId && (
        <MatchPopup
          matchedUser={matchedUser}
          matchId={currentMatchId}
          onClose={closeMatchPopup}
        />
      )}
    </div>
  )
}
