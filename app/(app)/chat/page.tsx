'use client'
import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import { getUserMatches } from '@/firebase/swipes'
import { getUserProfile } from '@/firebase/auth'
import { sendMessage, subscribeToMessages, subscribeToTyping, setTyping, subscribeToPresence } from '@/firebase/chat'
import { UserProfile, ChatMessage, MatchDoc } from '@/types'
import { Send, Phone, MoreVertical, ImageIcon, Smile } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function ChatPage() {
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

  useEffect(() => {
    if (!user) return
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
      if (m.length > 0) setSelectedMatch(m[0])
    })
  }, [user])

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
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: 260, borderRight: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700 }}>Messages</h2>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          {matches.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 20, fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
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
                background: isSelected ? 'rgba(138,43,226,0.1)' : 'transparent',
              }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, overflow: 'hidden'
                  }}>
                    {p?.profilePhoto ? <img src={p.profilePhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : p?.fullName?.[0] || '?'}
                  </div>
                  {onlineStatus[p?.uid || ''] && (
                    <div style={{ position: 'absolute', bottom: 1, right: 1, width: 9, height: 9, borderRadius: '50%', background: '#22c55e', border: '2px solid var(--surface)' }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p?.fullName || 'Loading...'}</div>
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface)', flexShrink: 0 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', background: 'var(--grad)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0
            }}>
              {currentProfile.fullName[0]}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{currentProfile.fullName}</div>
              <div style={{ fontSize: 11, color: onlineStatus[currentProfile.uid] ? '#22c55e' : 'var(--muted)' }}>● {onlineStatus[currentProfile.uid] ? 'Online' : 'Offline'}</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              {currentProfile.whatsappNumber && (
                <a href={`https://wa.me/${currentProfile.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{
                  padding: '6px 14px', borderRadius: 10, border: '1px solid rgba(34,197,94,0.3)',
                  background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontSize: 12, textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: 5
                }}>
                  📱 WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--muted)', margin: 'auto', fontSize: 14 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>💜</div>
                <p>You matched! Say hello 👋</p>
              </div>
            )}
            {messages.map(msg => {
              const isMine = msg.senderId === user?.uid
              return (
                <div key={msg.id} style={{ display: 'flex', gap: 8, maxWidth: '70%', alignSelf: isMine ? 'flex-end' : 'flex-start', flexDirection: isMine ? 'row-reverse' : 'row' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--grad)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>
                    {isMine ? (useAuthStore.getState().profile?.fullName?.[0] || 'Y') : currentProfile.fullName[0]}
                  </div>
                  <div>
                    <div style={{
                      padding: '10px 14px', borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: isMine ? 'var(--grad)' : 'var(--surface2)',
                      color: '#fff', fontSize: 13, lineHeight: 1.5
                    }}>{msg.text}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, textAlign: isMine ? 'right' : 'left' }}>
                      {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : 'just now'}
                      {isMine && <span style={{ marginLeft: 6 }}>{msg.seen ? '✓✓' : '✓'}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
            {isTypingOther && (
              <div style={{ display: 'flex', gap: 8, maxWidth: '70%' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
                  {currentProfile.fullName[0]}
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', background: 'var(--surface2)', padding: '10px 14px', borderRadius: '18px 18px 18px 4px' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--muted)', animation: `typingBounce 1.2s ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <style>{`@keyframes typingBounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }`}</style>

          {/* Input */}
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center', background: 'var(--surface)', flexShrink: 0 }}>
            <button style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}><Smile size={18} /></button>
            <input
              className="input-base" style={{ borderRadius: 24, fontSize: 13 }}
              value={input} onChange={handleTyping}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
            />
            <button style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}><ImageIcon size={18} /></button>
            <button onClick={handleSend} disabled={!input.trim()} style={{
              width: 38, height: 38, borderRadius: '50%', background: input.trim() ? 'var(--grad)' : 'var(--surface2)',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', transition: 'all 0.2s'
            }}>
              <Send size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
            <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16 }}>Select a conversation</p>
          </div>
        </div>
      )}
    </div>
  )
}
