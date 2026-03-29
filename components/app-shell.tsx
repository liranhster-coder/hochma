'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  HardHat,
  FileText,
  Building2,
  Users,
  Home,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface User {
  name?: string | null
  email?: string | null
  image?: string | null
}

const navItems = [
  { href: '/', icon: Home, label: 'בית' },
  { href: '/reports', icon: FileText, label: 'דוחות' },
  { href: '/projects', icon: Building2, label: 'פרויקטים' },
  { href: '/clients', icon: Users, label: 'לקוחות' },
]

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode
  user: User
}) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <HardHat className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">חוכמה</span>
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="border-t border-border bg-background">
            <div className="max-w-2xl mx-auto px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}

              <div className="pt-2 mt-2 border-t border-border">
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  {user.name || user.email}
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  יציאה
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto">
        {children}
      </main>

      {/* Bottom nav bar (mobile) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur border-t border-border/50 pb-safe">
        <div className="max-w-2xl mx-auto px-2 flex justify-around py-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl text-xs font-medium transition-colors min-w-[60px]',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className={cn('h-5 w-5', active && 'scale-110 transition-transform')} />
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Bottom padding for nav bar */}
      <div className="h-16" />
    </div>
  )
}
