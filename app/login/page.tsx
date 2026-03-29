import { auth, signIn } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { HardHat } from 'lucide-react'

export default async function LoginPage() {
  const session = await auth()
  if (session?.user) {
    redirect('/reports')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center mx-auto mb-4">
            <HardHat className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">חוכמה</h1>
          <p className="text-muted-foreground mt-1 text-sm">כלים חכמים לניהול בנייה</p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-1">כניסה לחשבון</h2>
          <p className="text-sm text-muted-foreground mb-6">
            התחבר עם חשבון Google שלך כדי להמשיך
          </p>

          <form
            action={async () => {
              'use server'
              await signIn('google', { redirectTo: '/reports' })
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 px-4 rounded-xl transition-colors text-base"
            >
              כניסה עם Google
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          גישה מוגבלת לאנשי הצוות המורשים בלבד
        </p>
      </div>
    </div>
  )
}
