'use client'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import { getUserMatches } from '@/firebase/swipes'
import { getUserProfile } from '@/firebase/auth'
import { sendMessage, subscribeToMessages, subscribeToTyping, setTyping, subscribeToPresence } from '@/firebase/chat'
import { UserProfile, ChatMessage, MatchDoc } from '@/types'
import { Send, ImageIcon, Smile, MessageCircle, Heart, ArrowLeft, Check, CheckCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function ChatPage() {
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const { matches, setMatches } = useAppStore()
  const [matchProfiles, setMatchProfiles] = useState<Record<string, UserProfile>>({})
  const [selectedMatch, setSelectedMatch] = useState<(MatchDoc & { id: string }) | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTypingOther, setIsTypingOther] = useState(false)
  const [onlineStatus, setOnlineStatus] = useState<Record<string, boolean>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeout = useRef<NodeJS.Timeout | null>(null)
  const requestedMatch = searchParams.get('match')

  useEffect(() => {
    if (!user) return
    const interval = setInterval(() => {
      if (useAuthStore.getState().profile) {
        clearInterval(interval)
      }
    }, 200)
    const timeout = setTimeout(() => clearInterval(interval), 5000)
    getUserMatches(user.uid).then(async (m) => {
      setMatches(m)
      const profiles: Record<string, UserProfile> = {}
      for (const match of m) {
        const otherId = match.users.find(u => u !== user.uid)
        if (otherId) {
          const p = await getUserProfile(otherId)
          if (p) {
            profiles[match.id] = p
            subscribeToPresence(otherId, (online) => {
              setOnlineStatus(prev => ({ ...prev, [otherId]: online }))
            })
          }
        }
      }
      setMatchProfiles(profiles)
      if (m.length > 0) {
        if (requestedMatch) {
          const target = m.find(x => x.id === requestedMatch)
          setSelectedMatch(target || m[0])
        } else {
          setSelectedMatch(m[0])
        }
      }
    })
  }, [user, requestedMatch])

  useEffect(() => {
    if (!selectedMatch || !user) return
    const unsub = subscribeToMessages(selectedMatch.id, setMessages)
    const unsubTyping = subscribeToTyping(selectedMatch.id, user.uid, setIsTypingOther)
    return () => { unsub(); unsubTyping() }
  }, [selectedMatch, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !selectedMatch || !user) return
    const text = input
    setInput('')
    setTyping(selectedMatch.id, user.uid, false)
    await sendMessage(selectedMatch.id, user.uid, text)
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    if (!selectedMatch || !user) return
    setTyping(selectedMatch.id, user.uid, true)
    clearTimeout(typingTimeout.current ?? undefined)
    typingTimeout.current = setTimeout(() => setTyping(selectedMatch.id, user.uid, false), 2000)
  }

  const currentProfile = selectedMatch ? matchProfiles[selectedMatch.id] : null

  return (
    <div className="chat-container" style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div className={`chat-sidebar${selectedMatch ? ' chat-sidebar-hidden' : ''}`} style={{ width: 260, borderRight: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0, flexDirection: 'column' }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-display" style={{ fontSize: 15, fontWeight: 700 }}>Messages</h2>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          {matches.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 20, fontSize: 13 }}>
              <MessageCircle size={30} color="var(--muted)" style={{ margin: '0 auto 8px' }} />
              No matches yet. Keep swiping!
            </div>
          )}
          {matches.map(match => {
            const p = matchProfiles[match.id]
            const isSelected = selectedMatch?.id === match.id
            return (
              <div key={match.id} onClick={() => setSelectedMatch(match)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                borderRadius: 12, cursor: 'pointer', transition: 'background 0.15s',
                background: isSelected ? 'color-mix(in srgb, var(--purple) 16%, transparent)' : 'transparent',
              }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div className="font-display" style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700, overflow: 'hidden', color: 'var(--on-bright)'
                  }}>
                    {p?.profilePhoto ? <img src={p.profilePhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : p?.fullName?.[0] || '?'}
                  </div>
                  {onlineStatus[p?.uid || ''] && (
                    <div style={{ position: 'absolute', bottom: 1, right: 1, width: 9, height: 9, borderRadius: '50%', background: '#2f9e6b', border: '2px solid var(--surface)' }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p?.fullName || 'Loading…'}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p?.department || ''}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chat window */}
      {selectedMatch && currentProfile ? (
        <div className="chat-window chat-window-active" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface)', flexShrink: 0 }}>
            <button onClick={() => setSelectedMatch(null)} className="chat-back-btn" style={{
              width: 34, height: 34, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface2)',
              color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ArrowLeft size={16} />
            </button>
            <div className="font-display" style={{
              width: 40, height: 40, borderRadius: '50%', background: 'var(--grad)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0, color: 'var(--on-bright)'
            }}>
              {currentProfile.fullName[0]}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{currentProfile.fullName}</div>
              <div style={{ fontSize: 11, color: onlineStatus[currentProfile.uid] ? '#2f9e6b' : 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: onlineStatus[currentProfile.uid] ? '#2f9e6b' : 'var(--muted)', display: 'inline-block' }} />
                {onlineStatus[currentProfile.uid] ? 'Online' : 'Offline'}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--muted)', margin: 'auto', fontSize: 14 }}>
                <Heart size={36} color="var(--purple)" fill="var(--purple)" style={{ margin: '0 auto 12px' }} />
                <p>You matched! Say hello.</p>
              </div>
            )}
            <AnimatePresence initial={false}>
              {messages.map(msg => {
                const isMine = msg.senderId === user?.uid
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex', gap: 8, maxWidth: '70%', alignSelf: isMine ? 'flex-end' : 'flex-start', flexDirection: isMine ? 'row-reverse' : 'row' }}
                  >
                    <div className="font-display" style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--grad)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--on-bright)' }}>
                      {isMine ? (useAuthStore.getState().profile?.fullName?.[0] || 'Y') : currentProfile.fullName[0]}
                    </div>
                    <div>
                      <div style={{
                        padding: '10px 14px', borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        background: isMine ? 'var(--purple)' : 'var(--surface2)',
                        color: isMine ? 'var(--on-bright)' : 'var(--text)', fontSize: 13, lineHeight: 1.5
                      }}>{msg.text}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, textAlign: isMine ? 'right' : 'left', display: 'flex', alignItems: 'center', gap: 4, justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                        {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : 'just now'}
                        {isMine && (msg.seen ? <CheckCheck size={11} /> : <Check size={11} />)}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            {isTypingOther && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: 8, maxWidth: '70%' }}>
                <div className="font-display" style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--on-bright)' }}>
                  {currentProfile.fullName[0]}
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', background: 'var(--surface2)', padding: '10px 14px', borderRadius: '18px 18px 18px 4px' }}>
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                      style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--muted)' }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center', background: 'var(--surface)', flexShrink: 0 }}>
            <button style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><Smile size={18} /></button>
            <input
              id="chat-message-input"
              className="input-base" style={{ borderRadius: 24, fontSize: 13 }}
              value={input} onChange={handleTyping}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type a message…"
            />
            <button style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><ImageIcon size={18} /></button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleSend} disabled={!input.trim()} style={{
              width: 38, height: 38, borderRadius: '50%', background: input.trim() ? 'var(--purple)' : 'var(--surface2)',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--on-bright)', transition: 'background 0.2s', flexShrink: 0,
            }}>
              <Send size={14} />
            </motion.button>
          </div>
        </div>
      ) : (
        <div className="chat-window-empty" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
          <div style={{ textAlign: 'center' }}>
            <MessageCircle size={44} color="var(--muted)" style={{ margin: '0 auto 12px' }} />
            <p className="font-display" style={{ fontWeight: 700, fontSize: 16 }}>Select a conversation</p>
          </div>
        </div>
      )}
    </div>
  )
}
