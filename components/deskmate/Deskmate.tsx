'use client'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Send, Square, Users, Check } from 'lucide-react'
import '@/styles/deskmate.css'
import { UserProfile } from '@/types'

interface Character { id: string; name: string; head: string; flySoundSrc: string }

const CHARACTERS: Character[] = [
  { id: 'lal', name: 'Lal', head: '/deskmate/lal-head.png', flySoundSrc: '/deskmate/lal-fly.mp3' },
  { id: 'eagle', name: 'Eagle Gaming', head: '/deskmate/eagle-head.png', flySoundSrc: '/deskmate/eagle-fly.mp3' },
  { id: 'sayip', name: 'Sayip', head: '/deskmate/sayip-head.png', flySoundSrc: '/deskmate/sayip-fly.mp3' },
]

const W = 84, H = 128
const WALK_SPEED = 46
const FLY_SPEED = 95
const FLY_CHANCE = 0.35
const GROUND_GAP = 12
const FLY_TOP_GAP = 30
const FLY_CEILING_GAP = 60

type Turn = { role: 'user' | 'assistant'; content: string; hidden?: boolean }

export default function Deskmate({ profile }: { profile?: UserProfile | null }) {
  const [mounted, setMounted] = useState(false)
  const dmRef = useRef<HTMLDivElement>(null)
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({})
  const chatBodyRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const [charId, setCharId] = useState('lal')
  const charIdRef = useRef(charId)
  useEffect(() => { charIdRef.current = charId }, [charId])
  const currentChar = CHARACTERS.find(c => c.id === charId) || CHARACTERS[0]

  const profileRef = useRef(profile)
  useEffect(() => { profileRef.current = profile }, [profile])

  const [facingLeft, setFacingLeft] = useState(false)
  const [flying, setFlying] = useState(false)
  const [paused, setPaused] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [charPanelOpen, setCharPanelOpen] = useState(false)
  const [turns, setTurns] = useState<Turn[]>([])
  const turnsRef = useRef<Turn[]>([])
  useEffect(() => { turnsRef.current = turns }, [turns])
  const [sending, setSending] = useState(false)
  const [input, setInput] = useState('')

  const posRef = useRef({ x: 0, y: 0 })
  const pausedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => setMounted(true), [])

  // ---------------- movement engine ----------------
  useEffect(() => {
    if (!mounted) return
    const dm = dmRef.current
    if (!dm) return

    const groundY = () => Math.max(GROUND_GAP, window.innerHeight - H - GROUND_GAP)
    const randX = () => {
      const margin = 12
      const maxX = Math.max(margin, window.innerWidth - W - margin)
      return margin + Math.random() * (maxX - margin)
    }
    const randFlyY = () => {
      const top = FLY_TOP_GAP
      const bottom = Math.max(top + 20, groundY() - FLY_CEILING_GAP)
      return top + Math.random() * (bottom - top)
    }
    const canFly = () => window.innerHeight > 180

    const place = (px: number, py: number) => {
      posRef.current = { x: px, y: py }
      dm.style.left = px + 'px'
      dm.style.top = py + 'px'
    }
    posRef.current.y = groundY()
    place(posRef.current.x, posRef.current.y)

    const schedule = (fn: () => void, ms: number) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(fn, ms)
    }

    function playFlySound() {
      const char = CHARACTERS.find(c => c.id === charIdRef.current)
      const el = char && audioRefs.current[char.id]
      if (!el) return
      try {
        el.pause(); el.currentTime = 0
        el.play().catch(() => {})
      } catch {}
    }
    function stopFlySound() {
      Object.values(audioRefs.current).forEach(el => {
        if (!el) return
        try { el.pause(); el.currentTime = 0 } catch {}
      })
    }
    ;(dm as any)._stopFlySound = stopFlySound

    function moveTo(target: { x: number; y: number }, speed: number, onArrive?: () => void) {
      if (pausedRef.current) return
      const dx = target.x - posRef.current.x, dy = target.y - posRef.current.y
      const dist = Math.hypot(dx, dy) || 1
      const duration = (dist / speed) * 1000
      setFacingLeft(dx < -1)
      dm.style.transition = `left ${duration}ms linear, top ${duration}ms linear`
      requestAnimationFrame(() => place(target.x, target.y))
      schedule(() => { if (!pausedRef.current && onArrive) onArrive() }, duration)
    }

    function walkLoop() {
      if (pausedRef.current) return
      moveTo({ x: randX(), y: groundY() }, WALK_SPEED, () => {
        schedule(() => {
          if (pausedRef.current) return
          if (canFly() && Math.random() < FLY_CHANCE) startFlying()
          else walkLoop()
        }, 300 + Math.random() * 900)
      })
    }

    function startFlying() {
      if (pausedRef.current) return
      setFlying(true)
      playFlySound()
      const hops = 2 + Math.floor(Math.random() * 3)
      const nextHop = (i: number) => {
        if (pausedRef.current) return
        if (i >= hops) {
          moveTo({ x: randX(), y: groundY() }, FLY_SPEED * 0.7, () => {
            setFlying(false)
            stopFlySound()
            schedule(() => { if (!pausedRef.current) walkLoop() }, 200 + Math.random() * 500)
          })
          return
        }
        moveTo({ x: randX(), y: randFlyY() }, FLY_SPEED, () => {
          schedule(() => nextHop(i + 1), 120 + Math.random() * 300)
        })
      }
      nextHop(0)
    }

    ;(dm as any)._walkLoop = walkLoop
    walkLoop()

    const onResize = () => {
      posRef.current.x = Math.min(posRef.current.x, Math.max(12, window.innerWidth - W - 12))
      if (!dm.classList.contains('dm-flying')) posRef.current.y = groundY()
      else posRef.current.y = Math.min(posRef.current.y, Math.max(12, window.innerHeight - H - 12))
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [mounted])

  // ---------------- audio unlock (autoplay policy) ----------------
  useEffect(() => {
    if (!mounted) return
    let unlocked = false
    const unlockOne = (el: HTMLAudioElement) => {
      const v = el.volume
      el.muted = true
      const p = el.play()
      if (p && (p as any).then) {
        (p as Promise<void>)
          .then(() => { el.pause(); el.currentTime = 0; el.muted = false; el.volume = v })
          .catch(() => { el.muted = false; el.volume = v })
      }
    }
    const events = ['pointerdown', 'keydown', 'touchstart', 'click']
    const unlockAudio = () => {
      if (unlocked) return
      unlocked = true
      Object.values(audioRefs.current).forEach(el => { if (el) unlockOne(el) })
      events.forEach(evt => document.removeEventListener(evt, unlockAudio, true))
    }
    events.forEach(evt => document.addEventListener(evt, unlockAudio, true))
    return () => events.forEach(evt => document.removeEventListener(evt, unlockAudio, true))
  }, [mounted])

  function freeze() {
    const dm = dmRef.current
    if (!dm) return
    const rect = dm.getBoundingClientRect()
    if (timerRef.current) clearTimeout(timerRef.current)
    dm.style.transition = 'none'
    posRef.current = { x: rect.left, y: rect.top }
    dm.style.left = rect.left + 'px'
    dm.style.top = rect.top + 'px'
    pausedRef.current = true
    setPaused(true)
    ;(dm as any)._stopFlySound?.()
  }
  function resume() {
    const dm = dmRef.current
    pausedRef.current = false
    setPaused(false)
    setFlying(false)
    if (dm) {
      const groundY = Math.max(GROUND_GAP, window.innerHeight - H - GROUND_GAP)
      posRef.current.y = groundY
      dm.style.top = groundY + 'px'
      ;(dm as any)._walkLoop?.()
    }
  }

  function scrollChat() {
    requestAnimationFrame(() => {
      if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    })
  }

  function buildUserContext(): UserProfile | undefined {
    return profileRef.current || undefined
  }

  async function requestReply(nextTurns: Turn[]) {
    setSending(true)
    setTurns([...nextTurns, { role: 'assistant', content: '' }])
    scrollChat()
    abortRef.current = new AbortController()
    try {
      const res = await fetch('/api/deskmate-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: charIdRef.current,
          turns: nextTurns.map(({ role, content }) => ({ role, content })),
          userContext: buildUserContext(),
        }),
        signal: abortRef.current.signal,
      })
      const data = await res.json()
      const reply = res.ok ? (data.reply || "Hmm... lost my train of thought there.") : (data.error || 'Something went sideways — try again.')
      setTurns([...nextTurns, { role: 'assistant', content: reply }])
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        setTurns([...nextTurns, { role: 'assistant', content: 'Connection hiccup — try again in a bit.' }])
      }
    } finally {
      setSending(false)
      abortRef.current = null
      scrollChat()
    }
  }

  function greet(character: Character) {
    const trigger: Turn = {
      role: 'user',
      hidden: true,
      content: "I just opened the chat window. Greet me with a short one-line hello, in character — mention something about me naturally if you know it.",
    }
    void character
    requestReply([trigger])
  }

  function openChat() {
    setChatOpen(true)
    freeze()
    if (turnsRef.current.length === 0) greet(currentChar)
  }
  function closeChat() {
    setChatOpen(false)
    resume()
  }

  function handleFigureClick() {
    if (chatOpen) closeChat(); else openChat()
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (sending) {
      abortRef.current?.abort()
      setSending(false)
      return
    }
    const text = input.trim()
    if (!text) return
    setInput('')
    const next = [...turnsRef.current, { role: 'user' as const, content: text }]
    requestReply(next)
  }

  function selectCharacter(id: string) {
    setCharPanelOpen(false)
    if (id === charIdRef.current) return
    const dm = dmRef.current
    ;(dm as any)?._stopFlySound?.()
    const char = CHARACTERS.find(c => c.id === id)!
    setCharId(id)
    setTurns([])
    if (chatOpen) greet(char)
  }

  if (!mounted) return null

  const visibleTurns = turns.filter(t => !t.hidden)

  return createPortal(
    <>
      {CHARACTERS.map(c => (
        <audio
          key={c.id}
          ref={el => { audioRefs.current[c.id] = el }}
          src={c.flySoundSrc}
          preload="auto"
        />
      ))}

      <div
        ref={dmRef}
        id="dm-figure"
        role="button"
        aria-label="Open chat with your Deskmate"
        tabIndex={0}
        className={[
          facingLeft ? 'dm-facing-left' : '',
          flying ? 'dm-flying' : '',
          paused ? 'dm-paused' : '',
        ].filter(Boolean).join(' ')}
        onClick={handleFigureClick}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFigureClick() } }}
      >
        <div className="dm-face">
          <svg viewBox="0 0 300 400">
            <g className="dm-bob">
              <g className="dm-wing dm-wingL"><path d="M148,138 C112,122 88,132 78,152 C98,156 118,158 134,154 C142,151 147,145 148,138 Z" fill="var(--accent)" stroke="var(--text)" strokeWidth={3} strokeLinejoin="round" /></g>
              <g className="dm-wing dm-wingR"><path d="M152,138 C188,122 212,132 222,152 C202,156 182,158 166,154 C158,151 153,145 152,138 Z" fill="var(--accent)" stroke="var(--text)" strokeWidth={3} strokeLinejoin="round" /></g>
              <g className="dm-legL">
                <line x1={150} y1={230} x2={150} y2={360} stroke="var(--text)" strokeWidth={13} strokeLinecap="round" />
                <ellipse cx={150} cy={363} rx={18} ry={8} fill="var(--text)" />
              </g>
              <g className="dm-legR">
                <line x1={150} y1={230} x2={150} y2={360} stroke="var(--text)" strokeWidth={13} strokeLinecap="round" />
                <ellipse cx={150} cy={363} rx={18} ry={8} fill="var(--text)" />
              </g>
              <line x1={150} y1={120} x2={150} y2={230} stroke="var(--text)" strokeWidth={12} strokeLinecap="round" />
              <g className="dm-armL">
                <path d="M150,132 L124,168 L132,206" fill="none" stroke="var(--text)" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
                <circle cx={124} cy={168} r={6.5} fill="var(--text)" />
                <circle cx={132} cy={206} r={8} fill="var(--text)" />
              </g>
              <g className="dm-armR">
                <path d="M150,132 L176,168 L168,206" fill="none" stroke="var(--text)" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
                <circle cx={176} cy={168} r={6.5} fill="var(--text)" />
                <circle cx={168} cy={206} r={8} fill="var(--text)" />
              </g>
              <clipPath id="dm-head-clip"><circle cx={150} cy={80} r={72} /></clipPath>
              <image href={currentChar.head} x={78} y={8} width={144} height={158} clipPath="url(#dm-head-clip)" preserveAspectRatio="xMidYMid slice" />
            </g>
          </svg>
        </div>
      </div>

      <div id="dm-chat-panel" className={chatOpen ? 'dm-open' : ''}>
        <div className="dm-chat-head">
          <span className="dm-mini"><img src={currentChar.head} alt="" /></span>
          <span className="dm-who"><b>Deskmate</b><span>Online · {currentChar.name}</span></span>
          <button type="button" onClick={closeChat} aria-label="Close chat"><X size={15} /></button>
        </div>
        <div className="dm-chat-body" ref={chatBodyRef}>
          {visibleTurns.map((t, i) => (
            <div key={i} className={`dm-msg ${t.role === 'user' ? 'dm-me' : 'dm-them'}${sending && i === visibleTurns.length - 1 && t.role === 'assistant' && !t.content ? ' dm-thinking' : ''}`}>
              {t.role === 'assistant' && !t.content && sending ? 'Thinking…' : t.content}
            </div>
          ))}
        </div>
        <form className="dm-chat-foot" onSubmit={handleSend}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            type="text"
            placeholder="Say something…"
            autoComplete="off"
            maxLength={600}
            disabled={sending}
          />
          <button type="submit" aria-label={sending ? 'Stop' : 'Send'}>
            {sending ? <Square size={14} /> : <Send size={16} />}
          </button>
        </form>
      </div>

      <button id="dm-char-toggle" aria-label="Switch character" title="Switch character" onClick={() => setCharPanelOpen(v => !v)}>
        <Users size={19} />
      </button>
      <div id="dm-char-panel" className={charPanelOpen ? 'dm-open' : ''}>
        <div className="dm-char-head">
          <b>Choose a character</b>
          <button type="button" onClick={() => setCharPanelOpen(false)} aria-label="Close"><X size={13} /></button>
        </div>
        <div className="dm-char-list">
          {CHARACTERS.map(c => (
            <button key={c.id} type="button" className={`dm-char-row${c.id === charId ? ' dm-active' : ''}`} onClick={() => selectCharacter(c.id)}>
              <span className="dm-av"><img src={c.head} alt="" /></span>
              <span className="dm-nm">{c.name}</span>
              <Check className="dm-ck" size={16} />
            </button>
          ))}
        </div>
      </div>
    </>,
    document.body
  )
}
