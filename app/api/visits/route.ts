import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')

  const visits = await prisma.siteVisit.findMany({
    where: projectId ? { projectId } : undefined,
    orderBy: { visitDate: 'desc' },
    include: {
      project: { select: { name: true, address: true } },
      report: { select: { id: true } },
      _count: { select: { photos: true } },
    },
  })
  return NextResponse.json(visits)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { projectId, engineerName, visitDate, visitType, attendees, typedNotes } = body

  if (!projectId || !engineerName || !visitDate) {
    return NextResponse.json(
      { error: 'פרויקט, שם מהנדס ותאריך הם שדות חובה' },
      { status: 400 }
    )
  }

  const visit = await prisma.siteVisit.create({
    data: {
      projectId,
      engineerName,
      visitDate: new Date(visitDate),
      visitType: visitType || 'regular',
      attendees,
      typedNotes,
      status: 'draft',
    },
    include: {
      project: { select: { name: true } },
    },
  })
  return NextResponse.json(visit)
}
