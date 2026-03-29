'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  company?: string | null
}

const projectTypes = [
  { value: 'residential', label: 'מגורים' },
  { value: 'commercial', label: 'מסחרי' },
  { value: 'industrial', label: 'תעשייתי' },
  { value: 'infrastructure', label: 'תשתיות' },
  { value: 'renovation', label: 'שיפוץ' },
]

export default function NewProjectPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    address: '',
    clientId: '',
    projectType: 'residential',
    startDate: '',
    architect: '',
    architectPhone: '',
    contractor: '',
    contractorPhone: '',
    developer: '',
    developerPhone: '',
    structuralEngineer: '',
    structuralPhone: '',
    notes: '',
  })

  useEffect(() => {
    fetch('/api/clients')
      .then((r) => r.json())
      .then(setClients)
      .catch(console.error)
  }, [])

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.address || !form.clientId) {
      setError('שם, כתובת ולקוח הם שדות חובה')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'שגיאה ביצירת הפרויקט')
      }
      const project = await res.json()
      router.push(`/projects/${project.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה')
      setLoading(false)
    }
  }

  const inputClass = 'h-11 w-full border border-input rounded-xl px-4 text-base bg-background focus:outline-none focus:ring-2 focus:ring-ring'
  const labelClass = 'text-sm font-medium'

  return (
    <div className="pb-6">
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
          <h1 className="font-bold">פרויקט חדש</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="space-y-4">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">פרטים בסיסיים</h2>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>שם הפרויקט <span className="text-destructive">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="שם הפרויקט"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>כתובת <span className="text-destructive">*</span></label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="כתובת האתר"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>לקוח <span className="text-destructive">*</span></label>
            <select
              value={form.clientId}
              onChange={(e) => handleChange('clientId', e.target.value)}
              className={inputClass}
            >
              <option value="">בחר לקוח</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.company ? ` — ${c.company}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass}>סוג פרויקט</label>
            <div className="grid grid-cols-3 gap-2">
              {projectTypes.map((pt) => (
                <button
                  key={pt.value}
                  type="button"
                  onClick={() => handleChange('projectType', pt.value)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-colors ${
                    form.projectType === pt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>תאריך התחלה</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">אנשי קשר</h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>אדריכל</label>
              <input
                type="text"
                value={form.architect}
                onChange={(e) => handleChange('architect', e.target.value)}
                placeholder="שם האדריכל"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>טלפון אדריכל</label>
              <input
                type="tel"
                value={form.architectPhone}
                onChange={(e) => handleChange('architectPhone', e.target.value)}
                placeholder="05x-xxxxxxx"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>קבלן</label>
              <input
                type="text"
                value={form.contractor}
                onChange={(e) => handleChange('contractor', e.target.value)}
                placeholder="שם הקבלן"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>טלפון קבלן</label>
              <input
                type="tel"
                value={form.contractorPhone}
                onChange={(e) => handleChange('contractorPhone', e.target.value)}
                placeholder="05x-xxxxxxx"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>יזם</label>
              <input
                type="text"
                value={form.developer}
                onChange={(e) => handleChange('developer', e.target.value)}
                placeholder="שם היזם"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>טלפון יזם</label>
              <input
                type="tel"
                value={form.developerPhone}
                onChange={(e) => handleChange('developerPhone', e.target.value)}
                placeholder="05x-xxxxxxx"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>מהנדס קונסטרוקציה</label>
              <input
                type="text"
                value={form.structuralEngineer}
                onChange={(e) => handleChange('structuralEngineer', e.target.value)}
                placeholder="שם המהנדס"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>טלפון</label>
              <input
                type="tel"
                value={form.structuralPhone}
                onChange={(e) => handleChange('structuralPhone', e.target.value)}
                placeholder="05x-xxxxxxx"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>הערות</label>
          <textarea
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="הערות נוספות על הפרויקט"
            rows={3}
            className="w-full border border-input rounded-xl px-4 py-3 text-base bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-bold text-base hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'צור פרויקט'}
        </button>
      </form>
    </div>
  )
}
