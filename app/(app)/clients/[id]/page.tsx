'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowRight,
  Building2,
  Mail,
  Phone,
  Pencil,
  Plus,
  Save,
  X,
  Trash2,
  MapPin,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Project {
  id: string
  name: string
  address: string
  projectType: string
  status: string
  visitCount: number
  _count: { visits: number }
}

interface Client {
  id: string
  name: string
  company: string | null
  phone: string | null
  email: string | null
  notes: string | null
  projects: Project[]
}

const projectTypeLabels: Record<string, string> = {
  residential: 'מגורים',
  commercial: 'מסחרי',
  industrial: 'תעשייתי',
  infrastructure: 'תשתיות',
  renovation: 'שיפוץ',
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    notes: '',
  })

  const fetchClient = useCallback(async () => {
    try {
      const res = await fetch(`/api/clients/${id}`)
      if (!res.ok) {
        router.push('/clients')
        return
      }
      const data = await res.json()
      setClient(data)
      setForm({
        name: data.name || '',
        company: data.company || '',
        phone: data.phone || '',
        email: data.email || '',
        notes: data.notes || '',
      })
    } catch {
      router.push('/clients')
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchClient()
  }, [fetchClient])

  async function handleSave() {
    if (!form.name.trim()) {
      setError('שם הלקוח הוא שדה חובה')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'שגיאה בשמירה')
      }
      const updated = await res.json()
      setClient((prev) => (prev ? { ...prev, ...updated } : prev))
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('האם למחוק את הלקוח? לא ניתן למחוק לקוח עם פרויקטים.')) return
    const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'שגיאה במחיקה')
      return
    }
    router.push('/clients')
  }

  const inputClass =
    'h-11 w-full border border-input rounded-xl px-4 text-base bg-background focus:outline-none focus:ring-2 focus:ring-ring'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!client) return null

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/clients"
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold truncate">{client.name}</h1>
            {client.company && (
              <p className="text-xs text-muted-foreground truncate">{client.company}</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Client info card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">פרטי לקוח</CardTitle>
              <div className="flex gap-2">
                {!editing ? (
                  <>
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-1 border border-border px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-muted transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      עריכה
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-1 border border-destructive/30 text-destructive px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      מחיקה
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 transition-colors"
                    >
                      {saving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5" />
                      )}
                      שמור
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false)
                        setError('')
                        setForm({
                          name: client.name || '',
                          company: client.company || '',
                          phone: client.phone || '',
                          email: client.email || '',
                          notes: client.notes || '',
                        })
                      }}
                      className="flex items-center gap-1 border border-border px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-muted transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                      ביטול
                    </button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {editing ? (
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">
                    שם <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className={inputClass}
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">חברה</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                    className={inputClass}
                    placeholder="שם החברה (אופציונלי)"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">טלפון</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      className={inputClass}
                      placeholder="05x-xxxxxxx"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">אימייל</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className={inputClass}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">הערות</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    className="w-full border border-input rounded-xl px-4 py-3 text-base bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    placeholder="הערות"
                  />
                </div>
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl">
                    {error}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {client.phone && (
                  <a
                    href={`tel:${client.phone}`}
                    className="flex items-center gap-2.5 text-sm hover:text-primary transition-colors"
                  >
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    {client.phone}
                  </a>
                )}
                {client.email && (
                  <a
                    href={`mailto:${client.email}`}
                    className="flex items-center gap-2.5 text-sm hover:text-primary transition-colors"
                  >
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    {client.email}
                  </a>
                )}
                {!client.phone && !client.email && !client.company && (
                  <p className="text-sm text-muted-foreground italic">אין פרטי קשר</p>
                )}
                {client.notes && (
                  <p className="text-sm text-muted-foreground border-t border-border pt-3 mt-3 whitespace-pre-wrap">
                    {client.notes}
                  </p>
                )}
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl">
                    {error}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Projects */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                פרויקטים ({client.projects.length})
              </CardTitle>
              <Link
                href={`/projects/new?clientId=${client.id}`}
                className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-3 w-3" />
                פרויקט חדש
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {client.projects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">אין פרויקטים עדיין</p>
            ) : (
              <div className="space-y-2">
                {client.projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-medium truncate">{project.name}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{project.address}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {projectTypeLabels[project.projectType] || project.projectType} ·{' '}
                        {project._count.visits} ביקורים
                      </span>
                    </div>
                    <Badge
                      variant={project.status === 'active' ? 'success' : 'secondary'}
                      className="shrink-0 mr-2"
                    >
                      {project.status === 'active' ? 'פעיל' : 'הסתיים'}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
