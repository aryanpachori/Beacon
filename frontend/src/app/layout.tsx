import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
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

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.ico',
    apple: '/image.png',
  },
  title: 'Beacon — Security that ships with AI',
  description:
    'Beacon is the AI Security Engineer that lives inside your workflow — an IDE extension, MCP server, and CLI that quietly reviews AI-generated code before it reaches production. Local-first. Zero repo access.',
  openGraph: {
    title: 'Beacon — Security that ships with AI',
    description: 'The AI Security Engineer that watches over code as it\u2019s written, not after it ships.',
    type: 'website',
    siteName: 'Beacon',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beacon — Security that ships with AI',
    description: 'The AI Security Engineer that watches over code as it\u2019s written, not after it ships.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
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
