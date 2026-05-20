import {
  collection, query, where, orderBy, onSnapshot, updateDoc, doc, Unsubscribe, FirestoreError
} from 'firebase/firestore'
import { db } from './config'
import { NotificationDoc } from '@/types'

export function subscribeToNotifications(
  userId: string,
  callback: (notifs: (NotificationDoc & { id: string })[]) => void
): Unsubscribe {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, snap => {
      try {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as NotificationDoc & { id: string })))
      } catch {
        callback([])
      }
    }, (err: FirestoreError) => {
      console.warn('Notification subscription error:', err.code)
      callback([])
    })
  } catch {
    return () => {}
  }
}

export async function markNotificationRead(notifId: string) {
  try {
    await updateDoc(doc(db, 'notifications', notifId), { read: true })
  } catch (err: any) {
    console.warn('Mark notification read error:', err.code)
  }
}

export async function markAllNotificationsRead(userId: string, notifIds: string[]) {
  try {
    await Promise.all(notifIds.map(id => markNotificationRead(id)))
  } catch {}
}