import type { Metadata } from 'next'
import {
  Inter,
  Instrument_Sans,
  Instrument_Serif,
  JetBrains_Mono,
  Space_Grotesk,
  Source_Serif_4,
} from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-sans',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sidebar',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  icons: {
    icon: [
      // ?v= busts sticky browser/CDN favicon caches after logo updates
      { url: '/favicon.ico?v=3', sizes: 'any' },
      { url: '/beacon-mark.png?v=3', type: 'image/png', sizes: '1024x1024' },
    ],
    apple: [{ url: '/apple-touch-icon.png?v=3', sizes: '180x180', type: 'image/png' }],
  },
  title: 'Beacon — Security that ships at agent speed',
  description:
    'Beacon rides along with Cursor, Claude Code and Copilot, reviewing every line the moment it\u2019s written — inside your editor, on your machine. Local-first. Zero repo access.',
  openGraph: {
    title: 'Beacon — Security that ships at agent speed',
    description: 'Beacon catches secrets, SQL injection, and broken auth before commit — inline, locally.',
    type: 'website',
    siteName: 'Beacon',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beacon — Security that ships at agent speed',
    description: 'Beacon catches secrets, SQL injection, and broken auth before commit — inline, locally.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Beacon defaults to dark — its native, premium surface. Users can opt into light for the dashboard. */}
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('dl_theme');if(t!=='light')document.documentElement.classList.add('dark')}catch(e){document.documentElement.classList.add('dark')}` }} />
      </head>
      <body
        className={`${inter.variable} ${instrumentSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} ${sourceSerif.variable} font-sans antialiased`}
      >
        {children}
        <Toaster
          position="bottom-right"
          richColors
          toastOptions={{
            style: {
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
