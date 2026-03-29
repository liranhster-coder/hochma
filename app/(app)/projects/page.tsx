import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Building2, Plus, ChevronLeft, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const projectTypeLabel: Record<string, string> = {
  residential: 'מגורים',
  commercial: 'מסחרי',
  industrial: 'תעשייתי',
  infrastructure: 'תשתיות',
  renovation: 'שיפוץ',
}

export default async function ProjectsPage() {
  const projects = await prisma.constructionProject.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { name: true } },
      _count: { select: { visits: true } },
    },
  })

  const activeCount = projects.filter((p) => p.status === 'active').length

  return (
    <div className="px-4 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">פרויקטים</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {projects.length} פרויקטים · {activeCount} פעילים
          </p>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          פרויקט חדש
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground font-medium">אין פרויקטים עדיין</p>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              פרויקט ראשון
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block bg-card border border-border rounded-2xl p-4 hover:border-primary/30 hover:shadow-sm transition-all active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={project.status === 'active' ? 'success' : 'secondary'}>
                      {project.status === 'active' ? 'פעיל' : 'הסתיים'}
                    </Badge>
                    {project.projectType && (
                      <span className="text-xs text-muted-foreground">
                        {projectTypeLabel[project.projectType] || project.projectType}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-base truncate">{project.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{project.client.name}</p>
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{project.address}</span>
                  </div>
                  {project._count.visits > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {project._count.visits} ביקורים
                    </p>
                  )}
                </div>
                <ChevronLeft className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
