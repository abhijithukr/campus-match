'use client'
import { Component, ReactNode } from 'react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() { return { hasError: false } }

  componentDidCatch() { this.setState({ hasError: false }) }

  render() {
    if (this.state.hasError) return this.props.fallback || null
    return this.props.children
  }
}