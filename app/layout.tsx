import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from '@/components/ErrorBoundary'

export const metadata: Metadata = {
  title: 'Campus Match — College Matchmaking',
  description: 'Exclusive college matchmaking platform. Anonymous likes, mutual matches, real connections.',
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
  openGraph: {
    title: 'Campus Match',
    description: 'Your campus. Your match.',
    type: 'website',
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#8A2BE2',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <ErrorBoundary>
          <Providers>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1A1A22',
                  color: '#F0EEF8',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '12px',
                  fontFamily: "'DM Sans', sans-serif",
                }
              }}
            />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
