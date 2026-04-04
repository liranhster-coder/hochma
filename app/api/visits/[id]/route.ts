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
  const { typedNotes, status, engineerName, visitDate, visitType, attendees } = body

  const visit = await prisma.siteVisit.update({
    where: { id },
    data: {
      ...(typedNotes !== undefined && { typedNotes }),
      ...(status !== undefined && { status }),
      ...(engineerName !== undefined && { engineerName }),
      ...(visitDate !== undefined && { visitDate: new Date(visitDate) }),
      ...(visitType !== undefined && { visitType }),
      ...(attendees !== undefined && { attendees }),
    },
  })
  return NextResponse.json(visit)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // Delete report first (no cascade defined in schema for SiteReport)
  await prisma.siteReport.deleteMany({ where: { visitId: id } })
  // Photos cascade from SiteVisit, but delete explicitly to be safe
  await prisma.visitPhoto.deleteMany({ where: { visitId: id } })
  await prisma.siteVisit.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
