import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const visit = await prisma.siteVisit.findUnique({
    where: { id },
    include: {
      project: { include: { client: true } },
      photos: { orderBy: { orderIndex: 'asc' } },
      report: true,
    },
  })
  if (!visit) return NextResponse.json({ error: 'לא נמצא' }, { status: 404 })
  return NextResponse.json(visit)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { typedNotes, status } = body

  const visit = await prisma.siteVisit.update({
    where: { id },
    data: {
      ...(typedNotes !== undefined && { typedNotes }),
      ...(status !== undefined && { status }),
    },
  })
  return NextResponse.json(visit)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.siteVisit.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
