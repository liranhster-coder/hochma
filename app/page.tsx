import { auth } from '@/lib/auth'
import { signIn, signOut } from '@/lib/auth'
import Link from 'next/link'
import { HardHat, FileText, Building2, Users, DollarSign, Wrench, LogIn, LogOut, ChevronLeft } from 'lucide-react'

const tools = [
  {
    icon: FileText,
    title: 'דוחות ביקור אתר',
    description: 'צור דוחות מקצועיים עם AI ותמונות מהשטח',
    href: '/reports',
    color: 'bg-amber-500',
    available: true,
  },
  {
    icon: Building2,
    title: 'פרויקטים',
    description: 'נהל את כל פרויקטי הבנייה שלך',
    href: '/projects',
    color: 'bg-blue-500',
    available: true,
  },
  {
    icon: Users,
    title: 'לקוחות',
    description: 'מאגר לקוחות ואנשי קשר',
    href: '/clients',
    color: 'bg-green-500',
    available: true,
  },
  {
    icon: DollarSign,
    title: 'בקרת תקציב',
    description: 'מעקב עלויות ותקציב פרויקטים',
    href: '#',
    color: 'bg-purple-500',
    available: false,
  },
  {
    icon: Wrench,
    title: 'ניהול קבלנים',
    description: 'רשימות קבלנים, חוזים ותשלומים',
    href: '#',
    color: 'bg-rose-500',
    available: false,
  },
]

export default async function HomePage() {
  let session = null
  try {
    session = await auth()
  } catch {
    // auth initialization may fail if env vars are not yet available
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <HardHat className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">חוכמה</span>
          </div>

          {session?.user ? (
            <form
              action={async () => {
                'use server'
                await signOut({ redirectTo: '/' })
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
              >
                <LogOut className="h-4 w-4" />
                יציאה
              </button>
            </form>
          ) : (
            <form
              action={async () => {
                'use server'
                await signIn('google', { redirectTo: '/reports' })
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-1.5 text-sm font-medium bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                כניסה
              </button>
            </form>
          )}
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-2xl mx-auto px-4 pt-12 pb-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center mx-auto mb-5">
          <HardHat className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-4xl font-extrabold mb-3 tracking-tight">
          חוכמה
        </h1>
        <p className="text-lg text-muted-foreground font-medium">
          כלים חכמים לניהול בנייה
        </p>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
          דוחות ביקור אתר מקצועיים עם AI, ניהול פרויקטים ולקוחות — הכל במקום אחד
        </p>

        {session?.user && (
          <div className="mt-4 inline-flex items-center gap-2 bg-green-500/10 text-green-700 dark:text-green-400 text-sm px-4 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            מחובר כ-{session.user.name || session.user.email}
          </div>
        )}
      </div>

      {/* Tools Grid */}
      <div className="max-w-2xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 gap-3">
          {tools.map((tool) => {
            const Icon = tool.icon
            if (!tool.available) {
              return (
                <div
                  key={tool.title}
                  className="relative flex items-center gap-4 p-4 rounded-2xl bg-muted/40 border border-border/50 opacity-60 cursor-not-allowed"
                >
                  <div className={`w-12 h-12 rounded-xl ${tool.color} opacity-40 flex items-center justify-center shrink-0`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base">{tool.title}</h3>
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                        בקרוב
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{tool.description}</p>
                  </div>
                </div>
              )
            }

            return (
              <Link
                key={tool.title}
                href={session?.user ? tool.href : '/login'}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200 active:scale-[0.98]"
              >
                <div className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base">{tool.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{tool.description}</p>
                </div>
                <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </Link>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="max-w-2xl mx-auto px-4 text-center text-xs text-muted-foreground">
          חוכמה · Hochma.ai · כלים חכמים לניהול בנייה
        </div>
      </footer>
    </div>
  )
}
