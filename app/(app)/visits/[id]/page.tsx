import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  Download,
  FileText,
  Clock,
  User,
  MapPin,
  Camera,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GenerateReportButton } from './generate-button'
import { VisitActions } from './visit-actions'

const visitTypeLabel: Record<string, string> = {
  regular: 'ביקור שגרתי',
  handover: 'ביקור מסירה',
  concrete_pour: 'ביקור לפני יציקה',
  inspection: 'ביקור בדיקה',
}

export default async function VisitPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const visit = await prisma.siteVisit.findUnique({
    where: { id },
    include: {
      project: { include: { client: true } },
      photos: { orderBy: { orderIndex: 'asc' } },
      report: true,
    },
  })

  if (!visit) notFound()

  const isDraft = visit.status === 'draft'

  function statusBadge() {
    if (visit!.status === 'draft') return <Badge variant="warning">טיוטה</Badge>
    if (visit!.status === 'generated') return <Badge variant="info">דוח נוצר</Badge>
    if (visit!.status === 'sent') return <Badge variant="success">נשלח</Badge>
    return <Badge variant="secondary">{visit!.status}</Badge>
  }

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/reports"
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold truncate">{visit.project.name}</h1>
            <p className="text-xs text-muted-foreground">
              {new Date(visit.visitDate).toLocaleDateString('he-IL')} · {visitTypeLabel[visit.visitType] || visit.visitType}
            </p>
          </div>
          {statusBadge()}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Visit info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">פרטי הביקור</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="flex items-center gap-2.5 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{visit.project.address}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>מהנדס: {visit.engineerName}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{new Date(visit.visitDate).toLocaleDateString('he-IL')}</span>
            </div>
            {visit.attendees && (
              <div className="flex items-start gap-2.5 text-sm">
                <Users className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span>נוכחים: {visit.attendees}</span>
              </div>
            )}
            <div className="flex items-center gap-2 pt-1 border-t border-border">
              <span className="text-xs text-muted-foreground">לקוח:</span>
              <Link
                href={`/clients/${visit.project.client.id}`}
                className="text-sm font-medium hover:underline text-primary"
              >
                {visit.project.client.name}
              </Link>
              {visit.project.client.phone && (
                <a
                  href={`tel:${visit.project.client.phone}`}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors mr-1"
                >
                  {visit.project.client.phone}
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes (read-only for completed visits) */}
        {!isDraft && visit.typedNotes && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">הערות מהביקור</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{visit.typedNotes}</p>
            </CardContent>
          </Card>
        )}

        {/* Photos (read-only for completed visits) */}
        {!isDraft && visit.photos.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="h-4 w-4" />
                תמונות ({visit.photos.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-2">
                {visit.photos.map((photo) => (
                  <div key={photo.id} className="rounded-xl overflow-hidden aspect-square relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/photos/${photo.id}`}
                      alt={photo.caption || `תמונה ${photo.orderIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1.5 line-clamp-2">
                        {photo.caption}
                      </div>
                    )}
                    {photo.aiAnalysis && (
                      <div className="absolute top-1.5 right-1.5 bg-blue-600/80 text-white text-xs px-1.5 py-0.5 rounded-full">
                        AI
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Draft visit: editable notes, photo management, add photos */}
        {isDraft && (
          <VisitActions
            visitId={visit.id}
            status={visit.status}
            typedNotes={visit.typedNotes}
            photos={visit.photos.map((p) => ({
              id: p.id,
              caption: p.caption,
              orderIndex: p.orderIndex,
              aiAnalysis: p.aiAnalysis,
            }))}
          />
        )}

        {/* Report section */}
        {visit.report ? (
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-700 dark:text-green-400">דוח מוכן</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    נוצר: {new Date(visit.report.generatedAt).toLocaleDateString('he-IL')}
                  </p>
                </div>
                <a
                  href={`/api/reports/${visit.report.id}/download`}
                  className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <Download className="h-4 w-4" />
                  הורד Word
                </a>
              </div>

              {visit.report.content && (
                <details className="mt-4">
                  <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                    הצג תוכן הדוח
                  </summary>
                  <div className="mt-3 text-sm whitespace-pre-wrap leading-relaxed border-t border-border pt-3 max-h-96 overflow-y-auto">
                    {visit.report.content}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        ) : (
          <GenerateReportButton visitId={visit.id} />
        )}

        {/* Project link */}
        <div className="text-center pt-2">
          <Link
            href={`/projects/${visit.project.id}`}
            className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline"
          >
            חזרה לפרויקט: {visit.project.name}
          </Link>
        </div>
      </div>
    </div>
  )
}
