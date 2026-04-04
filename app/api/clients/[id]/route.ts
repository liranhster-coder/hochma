import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const client = await prisma.constructionClient.findUnique({
    where: { id },
    include: {
      projects: {
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { visits: true } } },
      },
    },
  })
  if (!client) return NextResponse.json({ error: 'לא נמצא' }, { status: 404 })
  return NextResponse.json(client)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { name, email, phone, company, notes } = body

  if (!name) {
    return NextResponse.json({ error: 'שם הלקוח הוא שדה חובה' }, { status: 400 })
  }

  const client = await prisma.constructionClient.update({
    where: { id },
    data: { name, email: email || null, phone: phone || null, company: company || null, notes: notes || null },
  })
  return NextResponse.json(client)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const count = await prisma.constructionProject.count({ where: { clientId: id } })
  if (count > 0) {
    return NextResponse.json(
      { error: 'לא ניתן למחוק לקוח עם פרויקטים קיימים' },
      { status: 400 }
    )
  }
  await prisma.constructionClient.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
