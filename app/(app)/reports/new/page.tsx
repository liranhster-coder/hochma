'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, ChevronLeft, ChevronRight, X, Check, Loader2, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface Project {
  id: string
  name: string
  address: string
  client: { name: string }
}

interface PhotoPreview {
  file: File
  preview: string
  caption: string
}

const visitTypes = [
  { value: 'regular', label: 'ביקור שגרתי' },
  { value: 'handover', label: 'ביקור מסירה' },
  { value: 'concrete_pour', label: 'לפני יציקה' },
  { value: 'inspection', label: 'ביקור בדיקה' },
]

export default function NewReportPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(1)
  const [projects, setProjects] = useState<Project[]>([])
  const [visitId, setVisitId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)

  // Step 1
  const [projectId, setProjectId] = useState('')
  const [engineerName, setEngineerName] = useState('')
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0])
  const [visitType, setVisitType] = useState('regular')
  const [attendees, setAttendees] = useState('')

  // Step 2
  const [photos, setPhotos] = useState<PhotoPreview[]>([])

  // Step 3
  const [typedNotes, setTypedNotes] = useState('')

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then(setProjects)
      .catch(console.error)
  }, [])

  async function handleStep1() {
    if (!projectId || !engineerName || !visitDate) {
      setError('אנא מלא את כל השדות הנדרשים')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, engineerName, visitDate, visitType, attendees }),
      })
      if (!res.ok) throw new Error('שגיאה ביצירת הביקור')
      const visit = await res.json()
      setVisitId(visit.id)
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה')
    } finally {
      setLoading(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const newPhotos: PhotoPreview[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      caption: '',
    }))
    setPhotos((prev) => [...prev, ...newPhotos])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].preview)
      updated.splice(index, 1)
      return updated
    })
  }

  function updateCaption(index: number, caption: string) {
    setPhotos((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], caption }
      return updated
    })
  }

  async function handleStep2() {
    if (!visitId) return
    if (photos.length > 0) {
      setUploading(true)
      setError('')
      try {
        const formData = new FormData()
        photos.forEach((p, i) => {
          formData.append('photos', p.file)
          if (p.caption) formData.append(`caption_${i}`, p.caption)
        })
        const res = await fetch(`/api/visits/${visitId}/photos`, {
          method: 'POST',
          body: formData,
        })
        if (!res.ok) throw new Error('שגיאה בהעלאת התמונות')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'שגיאה')
        setUploading(false)
        return
      } finally {
        setUploading(false)
      }
    }
    setStep(3)
  }

  async function saveNotes() {
    if (!visitId) return
    await fetch(`/api/visits/${visitId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ typedNotes }),
    })
  }

  async function handleSave() {
    setLoading(true)
    setError('')
    try {
      await saveNotes()
      router.push(`/visits/${visitId}`)
    } catch {
      setError('שגיאה בשמירה')
      setLoading(false)
    }
  }

  async function handleGenerate() {
    setGenerating(true)
    setError('')
    try {
      await saveNotes()
      const res = await fetch(`/api/visits/${visitId}/generate`, { method: 'POST' })
      if (!res.ok) throw new Error('שגיאה ביצירת הדוח')
      router.push(`/visits/${visitId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה')
      setGenerating(false)
    }
  }

  return (
    <div className="pb-4">
      {/* Mobile header with steps */}
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold">
            {step === 1 ? 'פרטי הביקור' : step === 2 ? 'תמונות מהאתר' : 'הערות ודוח'}
          </h1>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s === step
                    ? 'w-6 bg-primary'
                    : s < step
                    ? 'w-2 bg-primary/40'
                    : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">שלב {step} מתוך 3</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Step 1: Visit details */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                פרויקט <span className="text-destructive">*</span>
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full h-11 border border-input rounded-xl px-4 text-base bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">בחר פרויקט</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.client.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                שם המהנדס <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={engineerName}
                onChange={(e) => setEngineerName(e.target.value)}
                placeholder="הכנס שם מהנדס"
                className="h-11 w-full border border-input rounded-xl px-4 text-base bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                תאריך ביקור <span className="text-destructive">*</span>
              </label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="h-11 w-full border border-input rounded-xl px-4 text-base bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">סוג ביקור</label>
              <div className="grid grid-cols-2 gap-2">
                {visitTypes.map((vt) => (
                  <button
                    key={vt.value}
                    type="button"
                    onClick={() => setVisitType(vt.value)}
                    className={`py-3 px-3 rounded-xl text-sm font-medium border-2 transition-colors ${
                      visitType === vt.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {vt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">נוכחים בביקור</label>
              <input
                type="text"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                placeholder="שמות הנוכחים"
                className="h-11 w-full border border-input rounded-xl px-4 text-base bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              onClick={handleStep1}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-bold text-base hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <>הבא <ChevronLeft className="h-5 w-5" /></>
              )}
            </button>
          </div>
        )}

        {/* Step 2: Photos */}
        {step === 2 && (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-primary/40 rounded-2xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors active:bg-primary/10"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-10 w-10 mx-auto mb-3 text-primary/60" />
              <p className="text-sm font-semibold">לחץ להוספת תמונות</p>
              <p className="text-xs text-muted-foreground mt-1">
                ניתן לבחור מספר תמונות בו-זמנית • ניתן לצלם ישירות
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {photos.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  {photos.length} תמונות נבחרו
                </p>
                {photos.map((photo, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.preview}
                          alt={`תמונה ${i + 1}`}
                          className="w-full h-48 object-cover"
                        />
                        <button
                          onClick={() => removePhoto(i)}
                          className="absolute top-2 left-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                          {i + 1}
                        </div>
                      </div>
                      <div className="p-3">
                        <input
                          type="text"
                          value={photo.caption}
                          onChange={(e) => updateCaption(i, e.target.value)}
                          placeholder="הוסף תיאור לתמונה (אופציונלי)"
                          className="w-full text-sm border border-input rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1 px-4 py-3 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
                חזרה
              </button>
              <button
                onClick={handleStep2}
                disabled={uploading}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    מעלה...
                  </>
                ) : (
                  <>
                    הבא ({photos.length} תמונות)
                    <ChevronLeft className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Notes + Generate */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">הערות המהנדס</label>
              <textarea
                value={typedNotes}
                onChange={(e) => setTypedNotes(e.target.value)}
                placeholder="הכנס הערות, ממצאים ותצפיות מהביקור..."
                rows={8}
                className="w-full border border-input rounded-xl px-4 py-3 text-base bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-1 px-4 py-3 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
                חזרה
              </button>
              <button
                onClick={handleSave}
                disabled={loading || generating}
                className="flex-1 flex items-center justify-center gap-2 border border-border py-3 rounded-xl font-semibold text-sm hover:bg-muted disabled:opacity-50 transition-colors"
              >
                <Check className="h-4 w-4" />
                שמור טיוטה
              </button>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || generating}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-bold text-base hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  מייצר דוח עם AI...
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5" />
                  צור דוח עכשיו
                </>
              )}
            </button>
            {generating && (
              <p className="text-center text-xs text-muted-foreground">
                מנתח תמונות ויוצר דוח מקצועי... עשוי לקחת עד דקה
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
