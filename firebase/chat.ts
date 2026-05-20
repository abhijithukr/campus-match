import {
  ref, push, onValue, off, set, serverTimestamp as rtServerTimestamp,
  query as rtQuery, orderByChild, limitToLast, DatabaseReference
} from 'firebase/database'
import { rtdb } from './config'
import { ChatMessage } from '@/types'

// Send a message
export function sendMessage(matchId: string, senderId: string, text: string, imageUrl?: string) {
  const msgRef = ref(rtdb, `chats/${matchId}/messages`)
  return push(msgRef, {
    senderId,
    text: text || '',
    imageUrl: imageUrl || null,
    seen: false,
    createdAt: rtServerTimestamp(),
  })
}

// Listen to messages in real-time
export function subscribeToMessages(
  matchId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  const msgRef = rtQuery(
    ref(rtdb, `chats/${matchId}/messages`),
    orderByChild('createdAt'),
    limitToLast(50)
  )
  const handler = onValue(msgRef, (snapshot) => {
    const msgs: ChatMessage[] = []
    snapshot.forEach((child) => {
      msgs.push({ id: child.key!, ...child.val() })
    })
    callback(msgs)
  })
  return () => off(msgRef, 'value', handler)
}

// Set typing indicator
export function setTyping(matchId: string, userId: string, isTyping: boolean) {
  const typingRef = ref(rtdb, `chats/${matchId}/typing/${userId}`)
  return set(typingRef, isTyping ? true : null)
}

// Subscribe to typing indicator
export function subscribeToTyping(
  matchId: string,
  currentUserId: string,
  callback: (isTyping: boolean) => void
): () => void {
  const typingRef = ref(rtdb, `chats/${matchId}/typing`)
  const handler = onValue(typingRef, (snap) => {
    const data = snap.val()
    const othersTyping = data
      ? Object.keys(data).some(uid => uid !== currentUserId && data[uid])
      : false
    callback(othersTyping)
  })
  return () => off(typingRef, 'value', handler)
}

// Mark messages as seen
export function markSeen(matchId: string, messageId: string) {
  return set(ref(rtdb, `chats/${matchId}/messages/${messageId}/seen`), true)
}

// Set online status
export function setOnlineStatus(userId: string, isOnline: boolean) {
  return set(ref(rtdb, `presence/${userId}`), {
    online: isOnline,
    lastSeen: rtServerTimestamp(),
  })
}

// Subscribe to user online status
export function subscribeToPresence(
  userId: string,
  callback: (online: boolean) => void
): () => void {
  const presRef = ref(rtdb, `presence/${userId}`)
  const handler = onValue(presRef, (snap) => {
    const data = snap.val()
    callback(data?.online === true)
  })
  return () => off(presRef, 'value', handler)
}
