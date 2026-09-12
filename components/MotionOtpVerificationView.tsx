'use client'
import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MotionOtpVerificationViewProps {
  length?: number
  isVerifying: boolean
  isSuccess: boolean
  isError: boolean
  onCompleted: (value: string) => void
  onResend?: () => void
}

const PLACEHOLDER = '·'

export default function MotionOtpVerificationView({
  length = 6,
  isVerifying,
  isSuccess,
  isError,
  onCompleted,
  onResend,
}: MotionOtpVerificationViewProps) {
  const [val, setVal] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const chars = val.split('')

  const focusInput = () => inputRef.current?.focus()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <div style={{ width: '100%', maxWidth: 340, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <SuccessRing key="success" />
          ) : isVerifying ? (
            <Orbit key="orbit" chars={chars} />
          ) : (
            <motion.div
              key="boxes"
              style={{ display: 'flex', gap: 12 }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.28 }}
            >
              {Array.from({ length }).map((_, i) => (
                <DigitBox key={i} char={chars[i] ?? ''} error={isError} focused={i === chars.length} onClick={focusInput} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={length}
        autoFocus
        autoComplete="one-time-code"
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1 }}
        value={val}
        onChange={e => {
          const next = e.target.value.replace(/\D/g, '').slice(0, length)
          setVal(next)
          if (next.length === length) onCompleted(next)
        }}
      />

      {isError && !isVerifying && !isSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          style={{ color: '#c9433f', fontSize: 13, fontWeight: 600, letterSpacing: 0.3 }}
        >
          Incorrect code. Please try again.
        </motion.div>
      )}

      {onResend && !isVerifying && (
        <button type="button" onClick={onResend} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--purple-light)', fontSize: 13, fontWeight: 600,
          marginTop: 4,
        }}>
          Resend code
        </button>
      )}
    </div>
  )
}

function DigitBox({ char, error, focused, onClick }: { char: string; error: boolean; focused: boolean; onClick: () => void }) {
  return (
    <motion.div
      onClick={onClick}
      animate={{ y: error ? [0, -7, 7, -5, 5, 0] : 0 }}
      transition={error ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' } : {}}
      style={{
        width: 44, height: 56, borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, fontWeight: 800, fontFamily: "'Bricolage Grotesque', sans-serif",
        background: 'var(--surface)',
        border: error ? '2px solid #c9433f' : focused ? '2px solid var(--purple)' : '1px solid var(--border2)',
        boxShadow: focused && !error ? '0 6px 20px color-mix(in srgb, var(--purple) 30%, transparent)' : 'none',
        color: 'var(--text)',
        cursor: 'text',
      }}
    >
      {char || <span className="otp-caret" />}
    </motion.div>
  )
}

function Orbit({ chars }: { chars: string[] }) {
  const radius = 46
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.4 }}
      style={{ position: 'relative', width: 150, height: 150 }}
    >
      {chars.map((ch, i) => {
        const base = (i / Math.max(chars.length, 1)) * Math.PI * 2
        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 40, height: 48, borderRadius: 10,
              marginTop: -24, marginLeft: -20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--surface)', border: '2px solid var(--purple)',
              color: 'var(--purple)', fontSize: 18, fontWeight: 800,
              boxShadow: '0 8px 24px color-mix(in srgb, var(--purple) 32%, transparent)',
            }}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{
              x: Math.cos(base) * radius,
              y: Math.sin(base) * radius,
              opacity: 1,
            }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: i * 0.06 }}
          >
            {ch}
          </motion.div>
        )
      })}
      <motion.div
        style={{ position: 'absolute', top: '50%', left: '50%', marginTop: -32, marginLeft: -32, width: 64, height: 64, borderRadius: 32, border: '3px solid var(--purple)', borderTopColor: 'transparent' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
      />
    </motion.div>
  )
}

function SuccessRing() {
  return (
    <motion.div
      key="success"
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 96, height: 96 }}
    >
      <motion.div
        style={{ position: 'absolute', width: 96, height: 96, borderRadius: 48, background: 'var(--grad)', filter: 'blur(2px)' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.7, 0.35, 0.7] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          style={{ position: 'absolute', width: 96, height: 96, borderRadius: 48, border: '3px solid var(--purple)' }}
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1.9, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5, ease: 'easeOut' }}
        />
      ))}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 320, damping: 16 }}
        style={{
          width: 48, height: 48, borderRadius: 24,
          background: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <motion.svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <motion.path
            d="M4 12.5 L9.5 18 L20 6.5"
            stroke="#fff"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.3, duration: 0.45, ease: 'easeOut' }}
          />
        </motion.svg>
      </motion.div>
    </motion.div>
  )
}
