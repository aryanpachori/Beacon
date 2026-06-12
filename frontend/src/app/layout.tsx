import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from 'sonner'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-inter',   // keep same CSS var so existing classes work
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const geistMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.png',
  },
  title: 'DriftLogg — Predictive Dependency Health',
  description:
    'Know which open source packages are dying before they become production incidents. Predictive dependency intelligence for engineering teams.',
  openGraph: {
    title: 'DriftLogg — Predictive Dependency Health',
    description: 'Know which packages are dying — 60 days before they do.',
    type: 'website',
    siteName: 'DriftLogg',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DriftLogg — Predictive Dependency Health',
    description: 'Know which packages are dying — 60 days before they do.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className={`${plusJakarta.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <Toaster
          position="bottom-right"
          theme="light"
          richColors
          toastOptions={{
            style: {
              background: '#ffffff',
              border: '1px solid #c6d1d7',
              color: '#555663',
              fontFamily: 'var(--font-inter)',
            },
          }}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
