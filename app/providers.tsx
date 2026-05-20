'use client'
import { useEffect, useRef } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase/config'
import { useAuthStore } from '@/store/useAuthStore'
import { getUserProfile } from '@/firebase/auth'

const queryClient = new QueryClient()

if (typeof window !== 'undefined') {
  window.onerror = function() { return true }
  window.addEventListener('unhandledrejection', function(e) { e.preventDefault() })
}

async function fetchProfileWithRetry(uid: string, retries = 3): Promise<import('@/types').UserProfile | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const profile = await getUserProfile(uid)
      if (profile) return profile
      if (i < retries - 1) await new Promise(r => setTimeout(r, 800 * (i + 1)))
    } catch {}
  }
  return null
}

function AuthListener() {
  const { setUser, setProfile, setLoading } = useAuthStore()
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    const unsub = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        const profile = await fetchProfileWithRetry(user.uid)
        if (profile) {
          setProfile(profile)
        } else {
          const fallback = {
            uid: user.uid,
            fullName: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            registerNumber: '',
            gender: 'other' as const,
            department: '',
            year: 1,
            bio: '',
            profilePhoto: '',
            coverPhoto: '',
            hobbies: [],
            interests: [],
            musicTaste: [],
            favoriteMovie: '',
            instagram: '',
            relationshipGoal: 'not_sure' as const,
            personalityTags: [],
            whatsappNumber: '',
            online: true,
            lastSeen: null as any,
            featuredToday: false,
            profileCompletion: 0,
            likesRemaining: 10,
            lastLikeReset: null as any,
            createdAt: null as any,
          }
          setProfile(fallback)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [setUser, setProfile, setLoading])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthListener />
      {children}
    </QueryClientProvider>
  )
}