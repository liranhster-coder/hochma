import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const photo = await prisma.visitPhoto.findUnique({
    where: { id },
    select: { data: true, mimeType: true },
  })

  if (!photo) {
    return NextResponse.json({ error: 'לא נמצא' }, { status: 404 })
  }

  return new NextResponse(photo.data, {
    headers: {
      'Content-Type': photo.mimeType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.visitPhoto.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
