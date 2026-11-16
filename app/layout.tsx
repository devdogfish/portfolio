import type { Metadata, Viewport } from 'next'
import { Brawler, Doto, Geist, Geist_Mono, Hedvig_Letters_Serif } from 'next/font/google'
import { Suspense, type CSSProperties, type ReactNode } from 'react'
import { AnalyticsTracker } from '@/components/analytics-tracker'
import { Providers } from '@/components/providers'
import { site } from '@/content/site'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })
const hedvig = Hedvig_Letters_Serif({ subsets: ['latin'], variable: '--font-hedvig' })
const doto = Doto({ subsets: ['latin'], variable: '--font-doto', preload: false })
const brawler = Brawler({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-brawler', preload: false })

export const metadata: Metadata = {
  metadataBase: new URL(site.origin),
  title: { default: `${site.name}: software, websites and practical tools`, template: `%s · ${site.name}` },
  description: 'Software developer in Halifax. Web applications, client websites, and tools that make day-to-day work easier.',
  openGraph: { siteName: site.name, type: 'website' },
}

export const viewport: Viewport = { themeColor: '#0e1116', colorScheme: 'dark light' }

// Matches the design's default appearance so the first paint is already correct.
const appearance = {
  'data-a63-mode': 'dark', 'data-a63-theme': 'retro', 'data-a63-brand': 'b1', 'data-a63-surface': 'n1',
  'data-a63-type-scale': 'normal', 'data-a63-radius': 'default', 'data-a63-font': 'sans', 'data-a63-os': 'macos',
  'data-a63-icon-theme': 'neutral',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const fonts = [geist, geistMono, hedvig, doto, brawler].map(font => font.variable).join(' ')
  return (
    <html lang="en-CA" className={`dark ${fonts}`} {...appearance} style={{ '--a63-surface-tint': '35%' } as CSSProperties} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
        {/* usePathname suspends on routes with unknown params, like /book/cancel/[token]. */}
        <Suspense fallback={null}><AnalyticsTracker /></Suspense>
      </body>
    </html>
  )
}
