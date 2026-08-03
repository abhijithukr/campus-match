'use client'
import { useState } from 'react'

export default function Bb8ThemeToggle({ size = 16 }: { size?: number }) {
  const [dark, setDark] = useState(false)

  const toggle = () => {
    const next = !dark
    setDark(next)
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
      try { localStorage.setItem('cm-theme', next ? 'dark' : 'light') } catch {}
    }
  }

  return (
    <div className="theme-switch" style={{ transform: `scale(${size / 16})` }} aria-label="Toggle dark theme">
      <label className="switch-label">
        <input className="checkbox" type="checkbox" checked={dark} onChange={toggle} />
        <span className="slider" />
      </label>
    </div>
  )
}