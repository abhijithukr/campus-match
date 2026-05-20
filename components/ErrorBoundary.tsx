'use client'
import { Component, ReactNode } from 'react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error?: Error }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    console.error('[ErrorBoundary caught]', error.message, error.stack)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error.message, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
          <p style={{ color: '#ff6b6b', fontWeight: 600 }}>Error: {this.state.error?.message}</p>
          <p style={{ marginTop: 8 }}>Something went wrong. Please check browser console (F12) for details.</p>
        </div>
      )
    }
    return this.props.children
  }
}