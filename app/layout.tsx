import type { Metadata, Viewport } from 'next'
import { Heebo } from 'next/font/google'
import './globals.css'

const heebo = Heebo({
  variable: '--font-heebo',
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'חוכמה | Hochma.ai',
  description: 'כלים חכמים לניהול בנייה — דוחות ביקור אתר, ניהול פרויקטים ולקוחות',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'חוכמה',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#D97706',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
