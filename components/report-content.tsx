'use client'

interface ReportContentProps {
  content: string
  className?: string
}

/** Strip residual markdown symbols from a line */
function cleanLine(line: string): string {
  return line
    .replace(/^#{1,6}\s+/, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_{2}(.+?)_{2}/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/^[-*]{3,}\s*$/, '')
    .replace(/`{1,3}(.+?)`{1,3}/g, '$1')
}

/** Render AI-generated report content with proper Hebrew styling */
export function ReportContent({ content, className = '' }: ReportContentProps) {
  const lines = content.split('\n')

  const elements: React.ReactNode[] = []
  let key = 0

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const trimmed = cleanLine(raw).trim()

    if (!trimmed) {
      // blank line → small spacer
      elements.push(<div key={key++} className="h-2" />)
      continue
    }

    // Section heading: "1. כותרת:" or short "כותרת:"
    const isSectionHeading =
      /^[0-9]+\.\s+.+:$/.test(trimmed) ||
      (/^[^0-9].+:$/.test(trimmed) && trimmed.length < 60)

    if (isSectionHeading) {
      elements.push(
        <p
          key={key++}
          className="font-bold text-sm text-primary mt-4 mb-1 border-b border-primary/20 pb-1"
        >
          {trimmed}
        </p>
      )
      continue
    }

    // Numbered item: "1. ..."
    if (/^[0-9]+\.\s+/.test(trimmed)) {
      elements.push(
        <p key={key++} className="text-sm leading-relaxed pr-4">
          {trimmed}
        </p>
      )
      continue
    }

    // Regular paragraph
    elements.push(
      <p key={key++} className="text-sm leading-relaxed">
        {trimmed}
      </p>
    )
  }

  return <div className={`space-y-0.5 ${className}`}>{elements}</div>
}
