import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, MapPin, User, Phone, Plus, FileText, Clock, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const project = await prisma.constructionProject.findUnique({
    where: { id },
    include: {
      client: true,
      visits: {
        orderBy: { visitDate: 'desc' },
        include: {
          report: { select: { id: true } },
          _count: { select: { photos: true } },
        },
      },
    },
  })

  if (!project) notFound()

  const contacts = [
    { label: 'אדריכל', name: project.architect, phone: project.architectPhone },
    { label: 'קבלן', name: project.contractor, phone: project.contractorPhone },
    { label: 'יזם', name: project.developer, phone: project.developerPhone },
    { label: 'מהנדס קונסטרוקציה', name: project.structuralEngineer, phone: project.structuralPhone },
  ].filter((c) => c.name)

  return (
    <div className="pb-4">
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold truncate">{project.name}</h1>
            <p className="text-xs text-muted-foreground">{project.client.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={project.status === 'active' ? 'success' : 'secondary'}>
              {project.status === 'active' ? 'פעיל' : 'הסתיים'}
            </Badge>
            <Link
              href={`/projects/${project.id}/edit`}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors"
            >
              <Pencil className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Project info */}
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-start gap-2.5 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <span>{project.address}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <Link href={`/clients`} className="hover:underline">
                {project.client.name}
              </Link>
            </div>
            {project.startDate && (
              <div className="flex items-center gap-2.5 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>תחילת עבודה: {new Date(project.startDate).toLocaleDateString('he-IL')}</span>
              </div>
            )}
            {project.notes && (
              <p className="text-sm text-muted-foreground border-t border-border pt-3 mt-3">
                {project.notes}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Contacts */}
        {contacts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">אנשי קשר</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contacts.map((contact) => (
                <div key={contact.label} className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">{contact.label}</div>
                    <div className="text-sm font-medium">{contact.name}</div>
                  </div>
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {contact.phone}
                    </a>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Visits */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">ביקורים ({project.visits.length})</h2>
            <Link
              href={`/reports/new?projectId=${project.id}`}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              ביקור חדש
            </Link>
          </div>

          {project.visits.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">אין ביקורים לפרויקט זה</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {project.visits.map((visit) => (
                <Link
                  key={visit.id}
                  href={`/visits/${visit.id}`}
                  className="block bg-card border border-border rounded-xl p-3 hover:border-primary/30 transition-all active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium">
                        {new Date(visit.visitDate).toLocaleDateString('he-IL')}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {visit.engineerName} · {visit._count.photos} תמונות
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {visit.status === 'generated' || visit.status === 'sent' ? (
                        <Badge variant="success" className="text-xs">דוח מוכן</Badge>
                      ) : (
                        <Badge variant="warning" className="text-xs">טיוטה</Badge>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
