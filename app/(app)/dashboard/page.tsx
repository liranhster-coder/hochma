import { prisma } from '@/lib/db'
import Link from 'next/link'
import {
  Building2,
  FileText,
  Users,
  Plus,
  Clock,
  CheckCircle,
  HardHat,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalProjects,
    activeProjectCount,
    totalClients,
    visitsThisMonth,
    totalReports,
    draftVisits,
    recentVisits,
  ] = await Promise.all([
    prisma.constructionProject.count(),
    prisma.constructionProject.count({ where: { status: 'active' } }),
    prisma.constructionClient.count(),
    prisma.siteVisit.count({ where: { visitDate: { gte: startOfMonth } } }),
    prisma.siteReport.count(),
    prisma.siteVisit.count({ where: { status: 'draft' } }),
    prisma.siteVisit.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        project: { select: { name: true } },
        report: { select: { id: true } },
        _count: { select: { photos: true } },
      },
    }),
  ])

  function visitStatusBadge(status: string) {
    if (status === 'draft') return <Badge variant="warning">טיוטה</Badge>
    if (status === 'generated') return <Badge variant="info">דוח נוצר</Badge>
    if (status === 'sent') return <Badge variant="success">נשלח</Badge>
    return <Badge variant="secondary">{status}</Badge>
  }

  return (
    <div className="px-4 py-5 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <HardHat className="h-5 w-5 text-primary" />
          סקירה כללית
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {now.toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-xs text-muted-foreground">פרויקטים פעילים</span>
          </div>
          <div className="text-3xl font-bold">{activeProjectCount}</div>
          <div className="text-xs text-muted-foreground mt-1">מתוך {totalProjects} סה&quot;כ</div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-xs text-muted-foreground">לקוחות</span>
          </div>
          <div className="text-3xl font-bold">{totalClients}</div>
          <div className="text-xs text-muted-foreground mt-1">לקוחות פעילים</div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </div>
            <span className="text-xs text-muted-foreground">ביקורים החודש</span>
          </div>
          <div className="text-3xl font-bold">{visitsThisMonth}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {draftVisits > 0 ? (
              <span className="text-yellow-600">{draftVisits} טיוטות פתוחות</span>
            ) : (
              'הכל מסודר'
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-xs text-muted-foreground">דוחות</span>
          </div>
          <div className="text-3xl font-bold">{totalReports}</div>
          <div className="text-xs text-muted-foreground mt-1">דוחות שנוצרו</div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          פעולות מהירות
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/reports/new"
            className="flex items-center gap-3 p-3 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors active:scale-[0.98]"
          >
            <Plus className="h-5 w-5 shrink-0" />
            <span className="font-semibold text-sm">ביקור חדש</span>
          </Link>
          <Link
            href="/projects/new"
            className="flex items-center gap-3 p-3 bg-card border border-border rounded-2xl hover:border-primary/30 hover:shadow-sm transition-all active:scale-[0.98]"
          >
            <Building2 className="h-5 w-5 shrink-0 text-muted-foreground" />
            <span className="font-semibold text-sm">פרויקט חדש</span>
          </Link>
          <Link
            href="/projects"
            className="flex items-center gap-3 p-3 bg-card border border-border rounded-2xl hover:border-primary/30 hover:shadow-sm transition-all active:scale-[0.98]"
          >
            <Building2 className="h-5 w-5 shrink-0 text-muted-foreground" />
            <span className="font-semibold text-sm">פרויקטים</span>
          </Link>
          <Link
            href="/clients"
            className="flex items-center gap-3 p-3 bg-card border border-border rounded-2xl hover:border-primary/30 hover:shadow-sm transition-all active:scale-[0.98]"
          >
            <Users className="h-5 w-5 shrink-0 text-muted-foreground" />
            <span className="font-semibold text-sm">לקוחות</span>
          </Link>
        </div>
      </div>

      {/* Recent visits */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">ביקורים אחרונים</CardTitle>
            <Link href="/reports" className="text-xs text-primary hover:underline">
              הכל
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentVisits.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">אין ביקורים עדיין</p>
              <Link
                href="/reports/new"
                className="inline-flex items-center gap-2 mt-3 text-sm text-primary hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                צור ביקור ראשון
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentVisits.map((visit) => (
                <Link
                  key={visit.id}
                  href={`/visits/${visit.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border active:scale-[0.99]"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-medium truncate">{visit.project.name}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3 w-3 shrink-0" />
                      {new Date(visit.visitDate).toLocaleDateString('he-IL')}
                      {visit._count.photos > 0 && <span>· {visit._count.photos} תמונות</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 mr-2">
                    {visitStatusBadge(visit.status)}
                    {visit.report && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
