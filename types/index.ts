import { Timestamp } from 'firebase/firestore'

export interface UserProfile {
  uid: string
  fullName: string
  registerNumber: string
  email: string
  gender: 'male' | 'female' | 'other'
  department: string
  year: number
  dateOfBirth?: string
  bio: string
  profilePhoto: string
  coverPhoto: string
  hobbies: string[]
  interests: string[]
  musicTaste: string[]
  favoriteMovie: string
  instagram: string
  relationshipGoal: 'friendship' | 'relationship' | 'casual' | 'not_sure'
  personalityTags: string[]
  compatibilityScore?: number
  whatsappNumber: string
  online: boolean
  lastSeen: Timestamp
  featuredToday: boolean
  profileCompletion: number
  likesRemaining: number
  lastLikeReset: Timestamp
  createdAt: Timestamp
  banned?: boolean
  isAdmin?: boolean
  banReason?: string
  privacySettings?: {
    showProfile: boolean
    anonymousLikes: boolean
    onlineStatus: boolean
    departmentVisible: boolean
  }
  notifSettings?: {
    matches: boolean
    anonymousLikes: boolean
    messages: boolean
    confessions: boolean
    cycleReset: boolean
  }
}

export interface SwipeDoc {
  fromUser: string
  toUser: string
  type: 'like' | 'skip'
  createdAt: Timestamp
  expiresAt: Timestamp
}

export interface MatchDoc {
  users: [string, string]
  createdAt: Timestamp
  lastInteraction: Timestamp
  active: boolean
}

export interface ChatMessage {
  id: string
  senderId: string
  text: string
  imageUrl?: string
  seen: boolean
  createdAt: number
}

export interface NotificationDoc {
  id?: string
  userId: string
  type: 'match' | 'anonymous_like' | 'message' | 'cycle_reset' | 'featured'
  title: string
  body: string
  read: boolean
  matchId?: string
  createdAt: Timestamp
}

export interface ConfessionDoc {
  id?: string
  authorId: string
  text: string
  department: string
  year: number
  likes: number
  likedBy: string[]
  comments: ConfessionComment[]
  approved: boolean
  createdAt: Timestamp
}

export interface ConfessionComment {
  id: string
  authorId: string
  text: string
  createdAt: Timestamp
}

export interface StudentRegistry {
  name: string
  department: string
  gender: string
  year: number
  activated: boolean
  userId?: string
}
