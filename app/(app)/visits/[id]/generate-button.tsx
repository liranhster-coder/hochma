'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Loader2 } from 'lucide-react'

const LOADING_STEPS = [
  'מנתח תמונות עם AI...',
  'מעבד ממצאים...',
  'כותב דוח מקצועי...',
  'מכין קובץ Word...',
]

export function GenerateReportButton({ visitId, regenerate = false }: { visitId: string; regenerate?: boolean }) {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!generating) return
    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, LOADING_STEPS.length - 1))
    }, 8000)
    return () => clearInterval(interval)
  }, [generating])

  async function handleGenerate() {
    setGenerating(true)
    setStepIndex(0)
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
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl flex items-start gap-2">
          <span className="text-destructive shrink-0 mt-0.5">⚠</span>
          <span>{error} — נסה שוב</span>
        </div>
      )}
      <button
        onClick={handleGenerate}
        disabled={generating}
        className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base disabled:opacity-60 transition-colors ${
          regenerate
            ? 'bg-muted text-muted-foreground hover:bg-muted/80 text-sm py-2.5 font-medium'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
      >
        {generating ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            מייצר דוח...
          </>
        ) : regenerate ? (
          <>
            <FileText className="h-4 w-4" />
            צור דוח מחדש
          </>
        ) : (
          <>
            <FileText className="h-5 w-5" />
            צור דוח AI
          </>
        )}
      </button>
      {generating && (
        <div className="flex flex-col items-center gap-1 pt-1">
          <p className="text-center text-xs text-muted-foreground">
            {LOADING_STEPS[stepIndex]}
          </p>
          <div className="flex gap-1 mt-1">
            {LOADING_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 w-6 rounded-full transition-colors duration-500 ${
                  i <= stepIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
