import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var savedTheme = localStorage.getItem('theme');
                var currentTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.setAttribute('data-theme', currentTheme === 'dark' ? 'app' : 'light');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
