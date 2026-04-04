import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const project = await prisma.constructionProject.findUnique({
    where: { id },
    include: { client: true },
  })
  if (!project) return NextResponse.json({ error: 'לא נמצא' }, { status: 404 })
  return NextResponse.json(project)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const {
    name,
    address,
    clientId,
    projectType,
    status,
    startDate,
    architect,
    architectPhone,
    contractor,
    contractorPhone,
    developer,
    developerPhone,
    structuralEngineer,
    structuralPhone,
    notes,
  } = body

  if (!name || !address || !clientId) {
    return NextResponse.json(
      { error: 'שם, כתובת ולקוח הם שדות חובה' },
      { status: 400 }
    )
  }

  const project = await prisma.constructionProject.update({
    where: { id },
    data: {
      name,
      address,
      clientId,
      projectType: projectType || 'residential',
      status: status || 'active',
      startDate: startDate ? new Date(startDate) : null,
      architect: architect || null,
      architectPhone: architectPhone || null,
      contractor: contractor || null,
      contractorPhone: contractorPhone || null,
      developer: developer || null,
      developerPhone: developerPhone || null,
      structuralEngineer: structuralEngineer || null,
      structuralPhone: structuralPhone || null,
      notes: notes || null,
    },
    include: { client: true },
  })
  return NextResponse.json(project)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const count = await prisma.siteVisit.count({ where: { projectId: id } })
  if (count > 0) {
    return NextResponse.json(
      { error: 'לא ניתן למחוק פרויקט עם ביקורים קיימים' },
      { status: 400 }
    )
  }
  await prisma.constructionProject.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
