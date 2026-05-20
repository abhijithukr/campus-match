import {
  collection, addDoc, getDocs, updateDoc, doc,
  query, where, orderBy, serverTimestamp, increment,
  onSnapshot, Unsubscribe, limit, getDoc
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
  const q = query(
    collection(db, 'confessions'),
    where('approved', '==', true),
    limit(30)
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as ConfessionDoc & { id: string })))
  })
}

export async function toggleConfessionLike(confessionId: string, userId: string, liked: boolean) {
  const ref = doc(db, 'confessions', confessionId)
  if (liked) {
    await updateDoc(ref, { likes: increment(1) })
  } else {
    await updateDoc(ref, { likes: increment(-1) })
  }
}

export async function getPendingConfessions() {
  const q = query(collection(db, 'confessions'), where('approved', '==', false), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as (ConfessionDoc & { id: string })[]
}

export async function approveConfession(id: string) {
  await updateDoc(doc(db, 'confessions', id), { approved: true })
}

export async function rejectConfession(id: string) {
  const { deleteDoc } = await import('firebase/firestore')
  await deleteDoc(doc(db, 'confessions', id))
}