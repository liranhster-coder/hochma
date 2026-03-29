import { prisma } from '@/lib/db'
import Link from 'next/link'
import { FileText, Plus, Download, Clock, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

function visitStatusBadge(status: string) {
  if (status === 'draft') return <Badge variant="warning">טיוטה</Badge>
  if (status === 'generated') return <Badge variant="info">דוח נוצר</Badge>
  if (status === 'sent') return <Badge variant="success">נשלח</Badge>
  return <Badge variant="secondary">{status}</Badge>
}

export default async function ReportsPage() {
  const visits = await prisma.siteVisit.findMany({
    orderBy: { visitDate: 'desc' },
    include: {
      project: { select: { name: true, address: true, client: { select: { name: true } } } },
      report: { select: { id: true, generatedAt: true } },
      _count: { select: { photos: true } },
    },
  })

  const stats = {
    total: visits.length,
    draft: visits.filter((v) => v.status === 'draft').length,
    generated: visits.filter((v) => v.status === 'generated' || v.status === 'sent').length,
  }

  return (
    <div className="px-4 py-5 space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">דוחות ביקור</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {stats.total} ביקורים · {stats.generated} דוחות
          </p>
        </div>
        <Link
          href="/reports/new"
          className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          ביקור חדש
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <div className="text-xs text-muted-foreground mt-0.5">סה&quot;כ ביקורים</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
          <div className="text-xs text-muted-foreground mt-0.5">טיוטות</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.generated}</div>
          <div className="text-xs text-muted-foreground mt-0.5">דוחות</div>
        </div>
      </div>

      {/* Visits list */}
      {visits.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground font-medium">אין ביקורים עדיין</p>
            <p className="text-sm text-muted-foreground mt-1">צור ביקור חדש כדי להתחיל</p>
            <Link
              href="/reports/new"
              className="inline-flex items-center gap-2 mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              ביקור ראשון
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {visits.map((visit) => (
            <Link
              key={visit.id}
              href={`/visits/${visit.id}`}
              className="block bg-card border border-border rounded-2xl p-4 hover:border-primary/30 hover:shadow-sm transition-all active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {visitStatusBadge(visit.status)}
                    {visit.report && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        דוח מוכן
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-base truncate">{visit.project.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{visit.project.client.name}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(visit.visitDate).toLocaleDateString('he-IL')}
                    </span>
                    <span>{visit.engineerName}</span>
                    {visit._count.photos > 0 && (
                      <span>{visit._count.photos} תמונות</span>
                    )}
                  </div>
                </div>

                {visit.report && (
                  <a
                    href={`/api/reports/${visit.report.id}/download`}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Word
                  </a>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
