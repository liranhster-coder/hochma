'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Loader2, Pencil, Trash2, X, Save, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Photo {
  id: string
  caption: string | null
  orderIndex: number
  aiAnalysis: string | null
}

interface VisitActionsProps {
  visitId: string
  status: string
  typedNotes: string | null
  photos: Photo[]
}

export function VisitActions({ visitId, status, typedNotes, photos }: VisitActionsProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isDraft = status === 'draft'

  // Notes editing
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState(typedNotes || '')
  const [savingNotes, setSavingNotes] = useState(false)
  const [notesError, setNotesError] = useState('')

  // Photo upload
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [pendingPhotos, setPendingPhotos] = useState<Array<{ file: File; preview: string; caption: string }>>([])

  // Delete visit
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Photo delete
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null)

  async function saveNotes() {
    setSavingNotes(true)
    setNotesError('')
    try {
      const res = await fetch(`/api/visits/${visitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ typedNotes: notes }),
      })
      if (!res.ok) throw new Error('שגיאה בשמירה')
      setEditingNotes(false)
      router.refresh()
    } catch {
      setNotesError('שגיאה בשמירת ההערות')
    } finally {
      setSavingNotes(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const newPhotos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      caption: '',
    }))
    setPendingPhotos((prev) => [...prev, ...newPhotos])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removePending(index: number) {
    setPendingPhotos((prev) => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].preview)
      updated.splice(index, 1)
      return updated
    })
  }

  function updatePendingCaption(index: number, caption: string) {
    setPendingPhotos((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], caption }
      return updated
    })
  }

  async function uploadPhotos() {
    if (!pendingPhotos.length) return
    setUploading(true)
    setUploadError('')
    try {
      const formData = new FormData()
      pendingPhotos.forEach((p, i) => {
        formData.append('photos', p.file)
        if (p.caption) formData.append(`caption_${i}`, p.caption)
      })
      const res = await fetch(`/api/visits/${visitId}/photos`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('שגיאה בהעלאת התמונות')
      pendingPhotos.forEach((p) => URL.revokeObjectURL(p.preview))
      setPendingPhotos([])
      router.refresh()
    } catch {
      setUploadError('שגיאה בהעלאת התמונות')
    } finally {
      setUploading(false)
    }
  }

  async function deletePhoto(photoId: string) {
    setDeletingPhotoId(photoId)
    try {
      await fetch(`/api/photos/${photoId}`, { method: 'DELETE' })
      router.refresh()
    } catch {
      // ignore
    } finally {
      setDeletingPhotoId(null)
    }
  }

  async function deleteVisit() {
    setDeleting(true)
    try {
      await fetch(`/api/visits/${visitId}`, { method: 'DELETE' })
      router.push('/reports')
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Edit notes (only for draft visits) */}
      {isDraft && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">הערות מהביקור</CardTitle>
              {!editingNotes ? (
                <button
                  onClick={() => setEditingNotes(true)}
                  className="flex items-center gap-1 border border-border px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-muted transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  עריכה
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={saveNotes}
                    disabled={savingNotes}
                    className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 transition-colors"
                  >
                    {savingNotes ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    שמור
                  </button>
                  <button
                    onClick={() => { setEditingNotes(false); setNotes(typedNotes || ''); setNotesError('') }}
                    className="flex items-center gap-1 border border-border px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-muted transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                    ביטול
                  </button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="הכנס הערות, ממצאים ותצפיות מהביקור..."
                  rows={6}
                  className="w-full border border-input rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  autoFocus
                />
                {notesError && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl">{notesError}</div>
                )}
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">
                {typedNotes || 'לא הוזנו הערות — לחץ עריכה להוספה'}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Photo management (for draft visits, show delete buttons on existing photos) */}
      {isDraft && photos.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">ניהול תמונות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {photos.map((photo) => (
                <div key={photo.id} className="rounded-xl overflow-hidden aspect-square relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/photos/${photo.id}`}
                    alt={photo.caption || `תמונה ${photo.orderIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1.5 line-clamp-2">
                      {photo.caption}
                    </div>
                  )}
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    disabled={deletingPhotoId === photo.id}
                    className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    {deletingPhotoId === photo.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add more photos (for draft visits) */}
      {isDraft && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="h-4 w-4" />
              הוספת תמונות
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              className="border-2 border-dashed border-primary/40 rounded-2xl p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors active:bg-primary/10"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-8 w-8 mx-auto mb-2 text-primary/60" />
              <p className="text-sm font-semibold">לחץ להוספת תמונות</p>
              <p className="text-xs text-muted-foreground mt-1">ניתן לבחור מספר תמונות בו-זמנית</p>
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

            {pendingPhotos.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{pendingPhotos.length} תמונות ממתינות להעלאה</p>
                {pendingPhotos.map((photo, i) => (
                  <div key={i} className="border border-border rounded-xl overflow-hidden">
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.preview} alt={`תמונה ${i + 1}`} className="w-full h-36 object-cover" />
                      <button
                        onClick={() => removePending(i)}
                        className="absolute top-2 left-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="p-2">
                      <input
                        type="text"
                        value={photo.caption}
                        onChange={(e) => updatePendingCaption(i, e.target.value)}
                        placeholder="תיאור (אופציונלי)"
                        className="w-full text-sm border border-input rounded-lg px-3 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                  </div>
                ))}

                {uploadError && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl">{uploadError}</div>
                )}

                <button
                  onClick={uploadPhotos}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {uploading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />מעלה...</>
                  ) : (
                    <><Plus className="h-4 w-4" />העלה {pendingPhotos.length} תמונות</>
                  )}
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete visit */}
      {isDraft && (
        <div className="pt-2">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center justify-center gap-2 border border-destructive/30 text-destructive py-3 rounded-xl text-sm font-medium hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              מחק ביקור
            </button>
          ) : (
            <div className="border border-destructive/30 rounded-xl p-4 space-y-3">
              <p className="text-sm text-center font-medium">האם למחוק את הביקור לצמיתות?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                >
                  ביטול
                </button>
                <button
                  onClick={deleteVisit}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-2 bg-destructive text-destructive-foreground py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'כן, מחק'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
