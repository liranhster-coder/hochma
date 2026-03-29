'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Loader2 } from 'lucide-react'

export function GenerateReportButton({ visitId }: { visitId: string }) {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate() {
    setGenerating(true)
    setError('')
    try {
      const res = await fetch(`/api/visits/${visitId}/generate`, { method: 'POST' })
      if (!res.ok) throw new Error('שגיאה ביצירת הדוח')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה')
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl">
          {error}
        </div>
      )}
      <button
        onClick={handleGenerate}
        disabled={generating}
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
            צור דוח AI
          </>
        )}
      </button>
      {generating && (
        <p className="text-center text-xs text-muted-foreground">
          מנתח תמונות ויוצר דוח מקצועי... עשוי לקחת עד דקה
        </p>
      )}
    </div>
  )
}
