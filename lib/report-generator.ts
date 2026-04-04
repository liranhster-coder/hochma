import { getOpenAIClient } from './openai'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  ImageRun,
} from 'docx'

interface ReportData {
  projectName: string
  projectAddress: string
  clientName: string
  engineerName: string
  visitDate: Date
  visitType: string
  attendees: string
  typedNotes: string
  photos: Array<{
    data: Buffer
    caption?: string
    aiAnalysis?: string
    orderIndex: number
    mimeType?: string
  }>
}

/** Strip markdown formatting characters from a string */
function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')          // ## headings
    .replace(/\*\*(.+?)\*\*/g, '$1')      // **bold**
    .replace(/\*(.+?)\*/g, '$1')          // *italic*
    .replace(/_{2}(.+?)_{2}/g, '$1')      // __bold__
    .replace(/_(.+?)_/g, '$1')            // _italic_
    .replace(/^[-*]{3,}\s*$/gm, '')       // --- horizontal rules
    .replace(/`{1,3}(.+?)`{1,3}/g, '$1') // `code`
    .trim()
}

export async function analyzePhoto(
  photoData: Buffer,
  mimeType: string
): Promise<string> {
  const base64 = photoData.toString('base64')
  const openai = getOpenAIClient()
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'אתה מהנדס פיקוח בניה מנוסה. תאר בעברית מה רואים בתמונה זו. ציין: 1) מה מצולם (שלב הבניה, האלמנט) 2) האם יש ליקויים, בעיות או הערות 3) רמת חומרה אם יש בעיה (גבוה/בינוני/נמוך). היה קצר ומקצועי. כתוב טקסט רגיל ללא סימני מארקדאון.',
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64}`,
              detail: 'high',
            },
          },
        ],
      },
    ],
    max_tokens: 300,
  })
  return response.choices[0].message.content || ''
}

export async function generateReportContent(
  data: ReportData,
  photoAnalyses: string[]
): Promise<string> {
  const visitTypeMap: Record<string, string> = {
    regular: 'ביקור שגרתי',
    handover: 'ביקור מסירה',
    concrete_pour: 'ביקור לפני יציקה',
    inspection: 'ביקור בדיקה',
  }

  const prompt = `אתה מהנדס פיקוח בניה בכיר. כתוב דוח ביקור אתר מקצועי ומפורט בעברית.

פרטי הביקור:
- פרויקט: ${data.projectName}
- כתובת: ${data.projectAddress}
- לקוח: ${data.clientName}
- מהנדס מפקח: ${data.engineerName}
- תאריך: ${data.visitDate.toLocaleDateString('he-IL')}
- סוג ביקור: ${visitTypeMap[data.visitType] || data.visitType}
- נוכחים: ${data.attendees || 'לא צוין'}
- הערות המהנדס: ${data.typedNotes || 'ללא הערות נוספות'}

ממצאים מהתמונות (${photoAnalyses.length} תמונות):
${photoAnalyses.map((a, i) => `תמונה ${i + 1}: ${a}`).join('\n')}

כתוב דוח מקצועי הכולל את הסעיפים הבאים בדיוק (כל סעיף מתחיל בכותרת עם נקודותיים):
1. סיכום הביקור:
2. ממצאי הביקור:
3. ליקויים ודרישות לתיקון:
4. הנחיות לקבלן:
5. המלצות והערות נוספות:

הוראות עיצוב חשובות:
- כתוב טקסט רגיל בלבד — ללא סימני מארקדאון
- אין להשתמש בכוכביות (* או **), חשמונאים (#), מקפים כקווים (---), או כל תו עיצוב אחר
- כותרות סעיפים: רשום את שם הסעיף ואחריו נקודותיים, בשורה נפרדת (לדוגמה: "ממצאי הביקור:")
- פריטים ממוספרים: השתמש במספרים רגילים עם נקודה (1. 2. 3.)
- הפרד בין פסקאות בשורה ריקה אחת
- שפה מקצועית ופורמלית`

  const openai = getOpenAIClient()
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2000,
  })
  return response.choices[0].message.content || ''
}

export async function createWordDocument(
  data: ReportData,
  reportContent: string
): Promise<Buffer> {
  const visitTypeMap: Record<string, string> = {
    regular: 'ביקור שגרתי',
    handover: 'ביקור מסירה',
    concrete_pour: 'ביקור לפני יציקה',
    inspection: 'ביקור בדיקה',
  }

  const sections: Paragraph[] = []

  // Title
  sections.push(
    new Paragraph({
      text: 'דוח ביקור אתר',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  )

  // Project details header
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: 'פרטי הפרויקט', bold: true, size: 28 })],
      spacing: { before: 200, after: 100 },
    })
  )

  const details: [string, string][] = [
    ['פרויקט:', data.projectName],
    ['כתובת:', data.projectAddress],
    ['לקוח:', data.clientName],
    ['מהנדס מפקח:', data.engineerName],
    ['תאריך ביקור:', data.visitDate.toLocaleDateString('he-IL')],
    ['סוג ביקור:', visitTypeMap[data.visitType] || data.visitType],
    ['נוכחים:', data.attendees || '—'],
  ]

  for (const [label, value] of details) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: label + ' ', bold: true }),
          new TextRun({ text: value }),
        ],
        spacing: { after: 80 },
      })
    )
  }

  // Separator
  sections.push(
    new Paragraph({
      text: '─────────────────────────────────',
      spacing: { before: 200, after: 200 },
    })
  )

  // Report content — strip any markdown that leaked through, then render
  const cleanedContent = reportContent
    .split('\n')
    .map((line) => stripMarkdown(line))
    .join('\n')

  const contentLines = cleanedContent.split('\n')
  for (const line of contentLines) {
    const trimmed = line.trim()
    if (!trimmed) {
      sections.push(new Paragraph({ text: '', spacing: { after: 60 } }))
      continue
    }

    // Section headings: "1. כותרת:" or short standalone "כותרת:"
    const isSectionHeading =
      /^[0-9]+\.\s+.+:$/.test(trimmed) ||
      (/^[^0-9].+:$/.test(trimmed) && trimmed.length < 50)

    // Indented numbered items: "1. " at start
    const isNumberedItem = /^[0-9]+\.\s+/.test(trimmed)

    if (isSectionHeading) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: trimmed, bold: true, size: 26, color: '1F3864' }),
          ],
          spacing: { before: 300, after: 100 },
        })
      )
    } else if (isNumberedItem) {
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, size: 22 })],
          spacing: { after: 80 },
          indent: { right: 300 },
        })
      )
    } else {
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, size: 22 })],
          spacing: { after: 80 },
        })
      )
    }
  }

  // Photos section
  if (data.photos.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'תמונות מהביקור', bold: true, size: 28 }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    )

    for (let i = 0; i < data.photos.length; i++) {
      const photo = data.photos[i]
      try {
        const mimeToType: Record<string, 'jpg' | 'png' | 'gif' | 'bmp'> = {
          'image/jpeg': 'jpg',
          'image/jpg': 'jpg',
          'image/png': 'png',
          'image/gif': 'gif',
          'image/bmp': 'bmp',
          'image/svg+xml': 'png',
          'image/webp': 'jpg',
        }
        const imgType = mimeToType[photo.mimeType || 'image/jpeg'] || 'jpg'
        sections.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: photo.data,
                transformation: { width: 400, height: 300 },
                type: imgType,
              }),
            ],
            spacing: { before: 200 },
          })
        )
        if (photo.caption || photo.aiAnalysis) {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({ text: `תמונה ${i + 1}: `, bold: true }),
                new TextRun({
                  text: photo.caption || photo.aiAnalysis || '',
                  italics: true,
                }),
              ],
              spacing: { after: 200 },
            })
          )
        }
      } catch {
        // Skip photo if error
      }
    }
  }

  // Signature
  sections.push(new Paragraph({ text: '', spacing: { before: 400 } }))
  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'מהנדס מפקח: ', bold: true }),
        new TextRun({ text: data.engineerName }),
      ],
      spacing: { after: 100 },
    })
  )
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: 'חתימה: ___________________' })],
      spacing: { after: 100 },
    })
  )
  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'תאריך: ' }),
        new TextRun({ text: new Date().toLocaleDateString('he-IL') }),
      ],
    })
  )

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: sections,
      },
    ],
    styles: {
      default: {
        document: {
          run: { font: 'David', size: 22 },
          paragraph: { alignment: AlignmentType.RIGHT },
        },
      },
    },
  })

  const buffer = await Packer.toBuffer(doc)
  return Buffer.from(buffer)
}
