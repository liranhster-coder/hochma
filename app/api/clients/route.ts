import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const clients = await prisma.constructionClient.findMany({
    orderBy: { createdAt: 'desc' },
    include: { projects: { select: { id: true } } },
  })
  return NextResponse.json(clients)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, phone, company, notes } = body

  if (!name) {
    return NextResponse.json({ error: 'שם הלקוח הוא שדה חובה' }, { status: 400 })
  }

  const client = await prisma.constructionClient.create({
    data: { name, email, phone, company, notes },
  })
  return NextResponse.json(client)
}
