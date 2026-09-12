'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Flame, Heart, MessageCircle, Bell, Settings } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import { MatchPopup } from '@/components/animations/MatchPopup'
import { subscribeToNotifications } from '@/firebase/notifications'

const navItems = [
  { href: '/discover', icon: Flame, label: 'Discover' },
  { href: '/matches', icon: Heart, label: 'Matches' },
  { href: '/chat', icon: MessageCircle, label: 'Chat' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
]

function NavIcon({ href, icon: Icon, label, isActive, unread, size }: any) {
  return (
    <Link key={href} href={href} title={label} style={{
      width: size === 'lg' ? 52 : 44, height: size === 'lg' ? 46 : 44, borderRadius: 14,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      textDecoration: 'none', transition: 'background .2s, color .2s',
      background: isActive ? 'color-mix(in srgb, var(--purple) 16%, transparent)' : 'transparent',
      color: isActive ? 'var(--purple-light)' : 'var(--muted)',
      position: 'relative',
    }}>
      {unread > 0 ? (
        <div style={{ position: 'relative' }}>
          <Icon size={size === 'lg' ? 20 : 18} />
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#e2726d', color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--surface)' }}
          >
            {unread > 9 ? '9+' : unread}
          </motion.div>
        </div>
      ) : <Icon size={size === 'lg' ? 20 : 18} />}
    </Link>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, profile } = useAuthStore()
  const { showMatchPopup, matchedUser, currentMatchId, closeMatchPopup, setUnreadNotifications, unreadNotifications } = useAppStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!loading && user && profile && profile.emailVerified === false) {
      router.push('/auth/verify-email')
    }
  }, [user, loading, profile, router])

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
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          style={{ textAlign: 'center' }}
        >
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Heart size={22} color="var(--on-bright)" fill="var(--on-bright)" />
          </div>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading…</p>
        </motion.div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="app-shell font-body" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Sidebar (desktop) */}
      <nav className="desktop-nav" style={{
        width: 68, background: 'var(--surface)', borderRight: '1px solid var(--border)',
        flexDirection: 'column', alignItems: 'center',
        padding: '16px 0', gap: 4, flexShrink: 0, zIndex: 10, height: '100vh', overflowY: 'auto'
      }}>
        {/* Logo */}
        <Link href="/discover" className="font-display" style={{
          width: 40, height: 40, borderRadius: 12, background: 'var(--grad)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16, textDecoration: 'none',
          fontWeight: 700, color: 'var(--on-bright)', fontSize: 14
        }}>CM</Link>

        {navItems.map(({ href, icon, label }) => (
          <NavIcon key={href} href={href} icon={icon} label={label}
            isActive={pathname.startsWith(href)}
            unread={label === 'Notifications' ? unreadNotifications : 0} />
        ))}

        {/* Bottom */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <Link href="/profile" title="Settings" style={{
            width: 44, height: 44, borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none', color: 'var(--muted)',
            background: pathname.startsWith('/profile') ? 'color-mix(in srgb, var(--purple) 16%, transparent)' : 'transparent',
          }}>
            <Settings size={18} />
          </Link>
          <Link href="/profile" className="font-display" style={{
            width: 36, height: 36, borderRadius: '50%', overflow: 'hidden',
            background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13, color: 'var(--on-bright)',
            textDecoration: 'none', outline: '2px solid color-mix(in srgb, var(--purple) 40%, transparent)', outlineOffset: 2
          }}>
            {profile?.profilePhoto ? <img src={profile.profilePhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : (profile?.fullName?.[0] || 'U')}
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="app-main">
        {children}
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="mobile-bottom-nav">
        {navItems.map(({ href, icon, label }) => (
          <NavIcon key={href} href={href} icon={icon} label={label}
            isActive={pathname.startsWith(href)}
            unread={label === 'Notifications' ? unreadNotifications : 0} size="lg" />
        ))}
        <Link href="/profile" title="Profile" className="font-display" style={{
          width: 44, height: 44, borderRadius: '50%', overflow: 'hidden',
          background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 13, color: 'var(--on-bright)',
          textDecoration: 'none',
          outline: pathname.startsWith('/profile') ? '3px solid color-mix(in srgb, var(--purple) 45%, transparent)' : '2px solid color-mix(in srgb, var(--purple) 40%, transparent)',
          outlineOffset: 2, flexShrink: 0,
        }}>
          {profile?.profilePhoto ? <img src={profile.profilePhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : (profile?.fullName?.[0] || 'U')}
        </Link>
      </nav>

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
