import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const formData = await req.formData()
  const files = formData.getAll('photos') as File[]

  if (!files.length) {
    return NextResponse.json({ error: 'לא נבחרו קבצים' }, { status: 400 })
  }

  const existingCount = await prisma.visitPhoto.count({ where: { visitId: id } })

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const buffer = Buffer.from(await file.arrayBuffer())
    const caption = (formData.get(`caption_${i}`) as string) || null
    await prisma.visitPhoto.create({
      data: {
        visitId: id,
        filename: file.name,
        mimeType: file.type || 'image/jpeg',
        data: buffer,
        caption,
        orderIndex: existingCount + i,
      },
    })
  }

  return NextResponse.json({ ok: true, uploaded: files.length })
}
