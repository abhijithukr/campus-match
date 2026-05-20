import { create } from 'zustand'
import { User } from 'firebase/auth'
import { UserProfile } from '@/types'

interface AuthStore {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  initComplete: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  profile: null,
  loading: true,
  initComplete: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  reset: () => set({ user: null, profile: null, loading: false, initComplete: false }),
}))