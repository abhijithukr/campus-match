import {
  collection, addDoc, getDocs, updateDoc, doc,
  query, where, orderBy, serverTimestamp, increment,
  onSnapshot, Unsubscribe, limit, getDoc, FirestoreError
} from 'firebase/firestore'
import { db } from './config'
import { ConfessionDoc } from '@/types'

export async function submitConfession(userId: string, text: string, department: string, year: number) {
  return addDoc(collection(db, 'confessions'), {
    authorId: userId,
    text,
    department,
    year,
    likes: 0,
    likedBy: [],
    comments: [],
    approved: false,
    createdAt: serverTimestamp(),
  })
}

export function subscribeToApprovedConfessions(callback: (confessions: (ConfessionDoc & { id: string })[]) => void): Unsubscribe {
  try {
    const q = query(
      collection(db, 'confessions'),
      where('approved', '==', true),
      limit(30)
    )
    return onSnapshot(q, (snap) => {
      try {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as ConfessionDoc & { id: string })))
      } catch {
        callback([])
      }
    }, (err: FirestoreError) => {
      console.warn('Confession subscription error:', err.code)
      callback([])
    })
  } catch {
    return () => {}
  }
}

export async function toggleConfessionLike(confessionId: string, userId: string, liked: boolean) {
  try {
    const ref = doc(db, 'confessions', confessionId)
    if (liked) {
      await updateDoc(ref, { likes: increment(1) })
    } else {
      await updateDoc(ref, { likes: increment(-1) })
    }
  } catch {}
}

export async function getPendingConfessions() {
  try {
    const q = query(collection(db, 'confessions'), where('approved', '==', false), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as (ConfessionDoc & { id: string })[]
  } catch {
    return []
  }
}

export async function approveConfession(id: string) {
  try {
    await updateDoc(doc(db, 'confessions', id), { approved: true })
  } catch {}
}

export async function rejectConfession(id: string) {
  try {
    const { deleteDoc } = await import('firebase/firestore')
    await deleteDoc(doc(db, 'confessions', id))
  } catch {}
}