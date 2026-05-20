'use client'
import { create } from 'zustand'
import { UserProfile, MatchDoc } from '@/types'

interface AppStore {
  discoverFeed: UserProfile[]
  matches: (MatchDoc & { id: string })[]
  likesRemaining: number
  unreadNotifications: number
  showMatchPopup: boolean
  matchedUser: UserProfile | null
  currentMatchId: string | null
  setDiscoverFeed: (feed: UserProfile[]) => void
  setMatches: (matches: (MatchDoc & { id: string })[]) => void
  setLikesRemaining: (n: number) => void
  setUnreadNotifications: (n: number) => void
  triggerMatchPopup: (user: UserProfile, matchId: string) => void
  closeMatchPopup: () => void
}

export const useAppStore = create<AppStore>((set) => ({
  discoverFeed: [],
  matches: [],
  likesRemaining: 10,
  unreadNotifications: 0,
  showMatchPopup: false,
  matchedUser: null,
  currentMatchId: null,
  setDiscoverFeed: (feed) => set({ discoverFeed: feed }),
  setMatches: (matches) => set({ matches }),
  setLikesRemaining: (likesRemaining) => set({ likesRemaining }),
  setUnreadNotifications: (unreadNotifications) => set({ unreadNotifications }),
  triggerMatchPopup: (user, matchId) => set({ showMatchPopup: true, matchedUser: user, currentMatchId: matchId }),
  closeMatchPopup: () => set({ showMatchPopup: false, matchedUser: null, currentMatchId: null }),
}))
