'use client'
import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '@/firebase/config'
import { useAuthStore } from '@/store/useAuthStore'
import { getUserProfile } from '@/firebase/auth'
import toast from 'react-hot-toast'

const queryClient = new QueryClient()

function AuthListener() {
  const { setUser, setProfile, setLoading } = useAuthStore()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        try {
          const profile = await getUserProfile(user.uid)
          setProfile(profile)
        } catch (err: any) {
          if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
            await signOut(auth)
            setUser(null)
            setProfile(null)
            return
          }
          setProfile(null)
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
