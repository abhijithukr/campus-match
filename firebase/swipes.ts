import {
  collection, doc, setDoc, getDoc, getDocs,
  query, where, serverTimestamp, addDoc,
  updateDoc, orderBy, limit, Timestamp
} from 'firebase/firestore'
import { db } from './config'
import { SwipeDoc, MatchDoc } from '@/types'
import { addDays } from 'date-fns'

// Handle a swipe action
export async function handleSwipe(fromUser: string, toUser: string, type: 'like' | 'skip') {
  const swipeId = `${fromUser}_${toUser}`
  const expiresAt = Timestamp.fromDate(addDays(new Date(), 14))

  await setDoc(doc(db, 'swipes', swipeId), {
    fromUser, toUser, type,
    createdAt: serverTimestamp(),
    expiresAt,
  } as SwipeDoc)

  if (type === 'skip') return { matched: false }

  // Check if reverse like exists
  const reverseId = `${toUser}_${fromUser}`
  const reverseSnap = await getDoc(doc(db, 'swipes', reverseId))

  if (reverseSnap.exists() && reverseSnap.data().type === 'like') {
    // Create match
    const matchId = [fromUser, toUser].sort().join('_')
    await setDoc(doc(db, 'matches', matchId), {
      users: [fromUser, toUser],
      createdAt: serverTimestamp(),
      lastInteraction: serverTimestamp(),
      active: true,
    } as MatchDoc)

    // Send notifications to both users
    await addDoc(collection(db, 'notifications'), {
      userId: fromUser,
      type: 'match',
      title: "It's a Match! 💜",
      body: 'You have a new mutual match!',
      matchId,
      read: false,
      createdAt: serverTimestamp(),
    })
    await addDoc(collection(db, 'notifications'), {
      userId: toUser,
      type: 'match',
      title: "It's a Match! 💜",
      body: 'You have a new mutual match!',
      matchId,
      read: false,
      createdAt: serverTimestamp(),
    })

    return { matched: true, matchId }
  }

  // Anonymous like notification (no identity revealed)
  const toUserSnap = await getDoc(doc(db, 'users', toUser))
  const fromUserData = await getDoc(doc(db, 'users', fromUser))
  if (toUserSnap.exists() && fromUserData.exists()) {
    const dept = fromUserData.data().department || 'campus'
    await addDoc(collection(db, 'notifications'), {
      userId: toUser,
      type: 'anonymous_like',
      title: `Someone from ${dept} liked you 👀`,
      body: 'Match back to find out who!',
      read: false,
      createdAt: serverTimestamp(),
    })
  }

  return { matched: false }
}

// Get remaining likes for today
export async function getLikesRemaining(userId: string): Promise<number> {
  const userSnap = await getDoc(doc(db, 'users', userId))
  if (!userSnap.exists()) return 0
  const data = userSnap.data()

  const lastReset = data.lastLikeReset?.toDate?.() || new Date(0)
  const now = new Date()
  const isNewDay = now.toDateString() !== lastReset.toDateString()

  if (isNewDay) {
    await updateDoc(doc(db, 'users', userId), {
      likesRemaining: 10,
      lastLikeReset: serverTimestamp(),
    })
    return 10
  }

  return data.likesRemaining ?? 10
}

// Decrement like count
export async function decrementLike(userId: string) {
  const userSnap = await getDoc(doc(db, 'users', userId))
  if (!userSnap.exists()) return
  const current = userSnap.data().likesRemaining ?? 10
  await updateDoc(doc(db, 'users', userId), { likesRemaining: Math.max(0, current - 1) })
}

// Get discover feed (users not yet swiped)
export async function getDiscoverFeed(userId: string, userGender: string) {
  // Get already swiped users
  const swipedQ = query(collection(db, 'swipes'), where('fromUser', '==', userId))
  const swipedSnap = await getDocs(swipedQ)
  const swipedIds = new Set(swipedSnap.docs.map(d => d.data().toUser))
  swipedIds.add(userId)

  // Get all users (opposite gender for hetero matching, or all)
  const usersSnap = await getDocs(query(collection(db, 'users'), limit(50)))
  return usersSnap.docs
    .map(d => d.data())
    .filter(u => !swipedIds.has(u.uid))
    .slice(0, 20)
}

// Get matches for a user
export async function getUserMatches(userId: string) {
  const q = query(
    collection(db, 'matches'),
    where('users', 'array-contains', userId),
    where('active', '==', true)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as (MatchDoc & { id: string })[]
}
