import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const projects = await prisma.constructionProject.findMany({
    orderBy: { createdAt: 'desc' },
    include: { client: true },
  })
  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
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

  const project = await prisma.constructionProject.create({
    data: {
      name,
      address,
      clientId,
      projectType: projectType || 'residential',
      status: status || 'active',
      startDate: startDate ? new Date(startDate) : null,
      architect,
      architectPhone,
      contractor,
      contractorPhone,
      developer,
      developerPhone,
      structuralEngineer,
      structuralPhone,
      notes,
    },
    include: { client: true },
  })
  return NextResponse.json(project)
}
