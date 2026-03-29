import { prisma } from '@/lib/db'
import { Users, Phone, Mail, Building2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { NewClientDialog } from './new-client-dialog'

export default async function ClientsPage() {
  const clients = await prisma.constructionClient.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { projects: true } },
    },
  })

  return (
    <div className="px-4 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">לקוחות</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {clients.length} לקוחות
          </p>
        </div>
        <NewClientDialog />
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground font-medium">אין לקוחות עדיין</p>
            <p className="text-sm text-muted-foreground mt-1">הוסף לקוח ראשון</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {clients.map((client) => (
            <div
              key={client.id}
              className="bg-card border border-border rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base">{client.name}</h3>
                  {client.company && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                      <Building2 className="h-3.5 w-3.5" />
                      {client.company}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2">
                    {client.phone && (
                      <a
                        href={`tel:${client.phone}`}
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {client.phone}
                      </a>
                    )}
                    {client.email && (
                      <a
                        href={`mailto:${client.email}`}
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {client.email}
                      </a>
                    )}
                  </div>
                  {client._count.projects > 0 && (
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {client._count.projects} פרויקטים
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
