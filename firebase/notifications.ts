import {
  collection, query, where, orderBy, onSnapshot, updateDoc, doc, Unsubscribe
} from 'firebase/firestore'
import { db } from './config'
import { NotificationDoc } from '@/types'

export function subscribeToNotifications(
  userId: string,
  callback: (notifs: (NotificationDoc & { id: string })[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as NotificationDoc & { id: string })))
  })
}

export async function markNotificationRead(notifId: string) {
  await updateDoc(doc(db, 'notifications', notifId), { read: true })
}

export async function markAllNotificationsRead(userId: string, notifIds: string[]) {
  await Promise.all(notifIds.map(id => markNotificationRead(id)))
}