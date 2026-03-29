'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Loader2 } from 'lucide-react'

export function NewClientDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    notes: '',
  })

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name) {
      setError('שם הלקוח הוא שדה חובה')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'שגיאה')
      }
      setOpen(false)
      setForm({ name: '', phone: '', email: '', company: '', notes: '' })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה')
      setLoading(false)
    }
  }

  const inputClass = 'h-11 w-full border border-input rounded-xl px-4 text-base bg-background focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        <Plus className="h-4 w-4" />
        לקוח חדש
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-background rounded-t-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">לקוח חדש</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">
                  שם <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="שם הלקוח"
                  className={inputClass}
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">חברה</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  placeholder="שם החברה (אופציונלי)"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">טלפון</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="05x-xxxxxxx"
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">אימייל</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="email@example.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">הערות</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="הערות"
                  rows={2}
                  className="w-full border border-input rounded-xl px-4 py-3 text-base bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-3 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'הוסף לקוח'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
