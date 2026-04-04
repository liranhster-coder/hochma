import { prisma } from '@/lib/db'
import { Users, Phone, Mail, Building2, ChevronLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
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
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="block bg-card border border-border rounded-2xl p-4 hover:border-primary/30 hover:shadow-sm transition-all active:scale-[0.99]"
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
                      <span
                        className="flex items-center gap-1 text-sm text-muted-foreground"
                        onClick={(e) => { e.preventDefault(); window.location.href = `tel:${client.phone}` }}
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {client.phone}
                      </span>
                    )}
                    {client.email && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        {client.email}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {client._count.projects} פרויקטים
                  </p>
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
