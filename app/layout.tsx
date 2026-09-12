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
  themeColor: '#DE5499',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('cm-theme')||'light';document.documentElement.setAttribute('data-theme',t)}catch(e){}})()` }} />
        <style>{`html { transition: background 0.3s; }`}</style>
      </head>
      <body suppressHydrationWarning>
        <ErrorBoundary>
          <Providers>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  border: '1px solid var(--border2)',
                  borderRadius: '12px',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                },
                success: { iconTheme: { primary: '#2f9e6b', secondary: '#fff' } },
                error: { iconTheme: { primary: '#c9433f', secondary: '#fff' } },
              }}
            />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
