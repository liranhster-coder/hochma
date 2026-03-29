import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const report = await prisma.siteReport.findUnique({ where: { id } })

  if (!report?.wordFileData) {
    return NextResponse.json({ error: 'לא נמצא' }, { status: 404 })
  }

  return new NextResponse(report.wordFileData, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="report-${id}.docx"`,
    },
  })
}
