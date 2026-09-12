import {
  collection, doc, setDoc, getDoc, getDocs,
  query, where, serverTimestamp, addDoc,
  updateDoc, orderBy, limit, Timestamp
} from 'firebase/firestore'
import { db } from './config'
import { SwipeDoc, MatchDoc } from '@/types'
import { addDays } from 'date-fns'

export async function handleSwipe(fromUser: string, toUser: string, type: 'like' | 'skip') {
  try {
    if (fromUser === toUser) return { matched: false }

    const swipeId = `${fromUser}_${toUser}`
    const expiresAt = Timestamp.fromDate(addDays(new Date(), 14))

    await setDoc(doc(db, 'swipes', swipeId), {
      fromUser, toUser, type,
      createdAt: serverTimestamp(),
      expiresAt,
    } as SwipeDoc)

    if (type === 'skip') return { matched: false }

    const reverseId = `${toUser}_${fromUser}`
    const reverseSnap = await getDoc(doc(db, 'swipes', reverseId))

    if (reverseSnap.exists() && reverseSnap.data().type === 'like') {
      const matchId = [fromUser, toUser].sort().join('_')
      await setDoc(doc(db, 'matches', matchId), {
        users: [fromUser, toUser],
        createdAt: serverTimestamp(),
        lastInteraction: serverTimestamp(),
        active: true,
      } as MatchDoc)

      const [fromSnap, toSnap] = await Promise.all([
        getDoc(doc(db, 'users', fromUser)),
        getDoc(doc(db, 'users', toUser)),
      ])
      const fromPrefs = fromSnap.exists() ? fromSnap.data().notifSettings : undefined
      const toPrefs = toSnap.exists() ? toSnap.data().notifSettings : undefined

      if (fromPrefs?.matches !== false) {
        await addDoc(collection(db, 'notifications'), {
          userId: fromUser, type: 'match', title: "It's a Match!",
          body: 'You have a new mutual match!', matchId, read: false,
          createdAt: serverTimestamp(),
        })
      }
      if (toPrefs?.matches !== false) {
        await addDoc(collection(db, 'notifications'), {
          userId: toUser, type: 'match', title: "It's a Match!",
          body: 'You have a new mutual match!', matchId, read: false,
          createdAt: serverTimestamp(),
        })
      }

      return { matched: true, matchId }
    }

    return { matched: false }
  } catch { return { matched: false } }
}

export async function getLikesRemaining(userId: string): Promise<number> {
  try {
    const userSnap = await getDoc(doc(db, 'users', userId))
    if (!userSnap.exists()) return 10
    const data = userSnap.data()
    const lastReset = data.lastLikeReset?.toDate?.() || new Date(0)
    const now = new Date()
    const isNewDay = now.toDateString() !== lastReset.toDateString()

    if (isNewDay) {
      await updateDoc(doc(db, 'users', userId), { likesRemaining: 10, lastLikeReset: serverTimestamp() })
      return 10
    }
    return data.likesRemaining ?? 10
  } catch { return 10 }
}

export async function decrementLike(userId: string) {
  try {
    const userSnap = await getDoc(doc(db, 'users', userId))
    if (!userSnap.exists()) return
    const current = userSnap.data().likesRemaining ?? 10
    await updateDoc(doc(db, 'users', userId), { likesRemaining: Math.max(0, current - 1) })
  } catch {}
}

export async function getDiscoverFeed(userId: string, _userGender?: string) {
  try {
    const now = new Date()
    const swipedQ = query(collection(db, 'swipes'), where('fromUser', '==', userId))
    const swipedSnap = await getDocs(swipedQ)
    const swipedIds = new Set<string>()
    swipedSnap.docs.forEach(d => {
      const data = d.data()
      const exp = data.expiresAt
      const stillActive = !exp || (typeof exp.toDate === 'function' && exp.toDate() > now)
      if (stillActive) swipedIds.add(data.toUser)
    })
    swipedIds.add(userId)

    const usersSnap = await getDocs(query(collection(db, 'users'), limit(500)))
    const users = usersSnap.docs.map(d => d.data())

    const regSnap = await getDocs(query(collection(db, 'student_registry'), limit(500)))
    const regDocs = regSnap.docs.map(d => ({ id: d.id, ...d.data() }))

    const userByReg: Record<string, any> = {}
    users.forEach((u: any) => { if (u.registerNumber) userByReg[u.registerNumber] = u })

    const feed = regDocs
      .filter((r: any) => r.userId !== userId && r.id !== userId)
      .map((r: any) => {
        const user = userByReg[r.id]
        if (user) {
          if (user.privacySettings?.showProfile === false) return null
          return {
            ...user,
            department: user.privacySettings?.departmentVisible === false ? '' : user.department,
            online: user.privacySettings?.onlineStatus === false ? false : true,
          }
        }
        return {
          uid: r.id,
          fullName: r.name || 'Student',
          registerNumber: r.id,
          email: '',
          gender: r.gender || 'other',
          department: r.department || '',
          year: r.year || 1,
          bio: '',
          profilePhoto: '',
          coverPhoto: '',
          hobbies: [],
          interests: [],
          musicTaste: [],
          favoriteMovie: '',
          instagram: '',
          relationshipGoal: 'not_sure',
          personalityTags: [],
          whatsappNumber: '',
          online: false,
          lastSeen: null,
          featuredToday: false,
          profileCompletion: 0,
          likesRemaining: 10,
          lastLikeReset: null,
          createdAt: null,
        }
      })
      .filter((u: any) => u !== null && u.uid !== userId && !swipedIds.has(u.uid))

    for (let i = feed.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[feed[i], feed[j]] = [feed[j], feed[i]]
    }
    return feed
  } catch { return [] }
}

export async function getUserMatches(userId: string) {
  try {
    const q = query(collection(db, 'matches'), where('users', 'array-contains', userId), where('active', '==', true))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as (MatchDoc & { id: string })[]
  } catch { return [] }
}