import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { analyzePhoto, generateReportContent, createWordDocument } from '@/lib/report-generator'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const visit = await prisma.siteVisit.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { orderIndex: 'asc' } },
      project: { include: { client: true } },
    },
  })

  if (!visit) return NextResponse.json({ error: 'לא נמצא' }, { status: 404 })

  // Analyze photos in batches of 5
  const analyses: string[] = []
  for (let i = 0; i < visit.photos.length; i += 5) {
    const batch = visit.photos.slice(i, i + 5)
    const batchAnalyses = await Promise.all(
      batch.map((p) =>
        analyzePhoto(Buffer.from(p.data), p.mimeType).catch(
          () => 'לא ניתן לנתח תמונה זו'
        )
      )
    )
    analyses.push(...batchAnalyses)
    for (let j = 0; j < batch.length; j++) {
      await prisma.visitPhoto.update({
        where: { id: batch[j].id },
        data: { aiAnalysis: batchAnalyses[j] },
      })
    }
  }

  const reportData = {
    projectName: visit.project.name,
    projectAddress: visit.project.address,
    clientName: visit.project.client.name,
    engineerName: visit.engineerName,
    visitDate: visit.visitDate,
    visitType: visit.visitType,
    attendees: visit.attendees || '',
    typedNotes: visit.typedNotes || '',
    photos: visit.photos.map((p, i) => ({
      data: Buffer.from(p.data),
      caption: p.caption || undefined,
      aiAnalysis: analyses[i],
      orderIndex: p.orderIndex,
      mimeType: p.mimeType,
    })),
  }

  const content = await generateReportContent(reportData, analyses)
  const wordBuffer = await createWordDocument(reportData, content)
  const wordData = new Uint8Array(wordBuffer)

  const report = await prisma.siteReport.upsert({
    where: { visitId: id },
    update: { content, wordFileData: wordData, generatedAt: new Date() },
    create: { visitId: id, content, wordFileData: wordData },
  })

  await prisma.siteVisit.update({
    where: { id },
    data: { status: 'generated' },
  })

  // Update visit count on first generation
  const reportCount = await prisma.siteReport.count({ where: { visitId: id } })
  if (reportCount === 1) {
    await prisma.constructionProject.update({
      where: { id: visit.projectId },
      data: { visitCount: { increment: 1 } },
    })
  }

  return NextResponse.json({ ok: true, reportId: report.id })
}
