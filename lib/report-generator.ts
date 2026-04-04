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
            text: 'אתה מהנדס פיקוח בניה מנוסה. תאר בעברית מה רואים בתמונה זו. ציין: 1) מה מצולם (שלב הבניה, האלמנט) 2) האם יש ליקויים, בעיות או הערות 3) רמת חומרה אם יש בעיה (גבוה/בינוני/נמוך). היה קצר ומקצועי.',
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

כתוב דוח מקצועי הכולל:
1. סיכום הביקור (פסקה קצרה)
2. ממצאי הביקור (מפורט לפי אזורים/שלבים)
3. ליקויים ודרישות לתיקון (ממוספרים, עם רמת עדיפות)
4. הנחיות לקבלן
5. המלצות והערות נוספות

השתמש בשפה מקצועית ופורמלית. הפרד בין סעיפים בבירור.`

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

  // Report content
  const contentLines = reportContent.split('\n')
  for (const line of contentLines) {
    const trimmed = line.trim()
    if (!trimmed) {
      sections.push(new Paragraph({ text: '' }))
      continue
    }
    const isHeader = /^[0-9]+\./.test(trimmed) || trimmed.endsWith(':')
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: trimmed, bold: isHeader, size: isHeader ? 24 : 22 }),
        ],
        spacing: { after: 80 },
      })
    )
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
        // Map mimeType to docx ImageRun type
        const mimeToType: Record<string, 'jpg' | 'png' | 'gif' | 'bmp'> = {
          'image/jpeg': 'jpg',
          'image/jpg': 'jpg',
          'image/png': 'png',
          'image/gif': 'gif',
          'image/bmp': 'bmp',
          'image/svg+xml': 'png', // fallback for svg
          'image/webp': 'jpg',   // docx doesn't support webp, fallback
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
