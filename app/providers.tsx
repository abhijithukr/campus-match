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

function AuthListener() {
  const { setUser, setProfile, setLoading } = useAuthStore()
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    const unsub = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        let retries = 0
        let profile = null
        while (retries < 3 && !profile) {
          profile = await getUserProfile(user.uid)
          if (profile) break
          await new Promise(r => setTimeout(r, 500))
          retries++
        }
        setProfile(profile)
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