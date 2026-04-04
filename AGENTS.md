# Hochma

Smart construction project management platform for Israeli construction professionals.

## Tech Stack
- Next.js 15 App Router, TypeScript
- Prisma ORM with PostgreSQL (Railway)
- NextAuth v5 (Google OAuth)
- Tailwind CSS, RTL Hebrew-first design
- OpenAI GPT-4 Vision for photo analysis
- docx library for Word report generation

## Key paths
- App pages: app/(app)/
- API routes: app/api/
- DB schema: prisma/schema.prisma
- Report generator: lib/report-generator.ts
- Auth config: lib/auth.ts
- Navigation/shell: components/app-shell.tsx

## Routes
- `/` — Landing page (unauthenticated) or redirect to /dashboard
- `/dashboard` — Authenticated dashboard with stats and recent activity
- `/reports` — All site visits / reports list
- `/reports/new` — Create new site visit (3-step: details → photos → notes/generate)
- `/visits/[id]` — View a specific site visit
- `/projects` — Projects list
- `/projects/new` — Create new project (supports ?clientId= pre-fill)
- `/projects/[id]` — Project detail with contacts and visit history
- `/projects/[id]/edit` — Edit project details
- `/clients` — Clients list
- `/clients/[id]` — Client detail with inline edit/delete and project list

## API Routes
- `GET/POST /api/clients` — List or create clients
- `GET/PATCH/DELETE /api/clients/[id]` — Individual client CRUD
- `GET/POST /api/projects` — List or create projects
- `GET/PATCH/DELETE /api/projects/[id]` — Individual project CRUD
- `GET/POST /api/visits` — List or create visits
- `GET/PATCH/DELETE /api/visits/[id]` — Individual visit operations
- `POST /api/visits/[id]/photos` — Upload photos to a visit
- `POST /api/visits/[id]/generate` — AI report generation (analyze photos + create Word doc)
- `GET /api/reports/[id]/download` — Download Word document
- `GET /api/photos/[id]` — Serve photo by ID

## Git remote
https://github.com/liranhster-coder/hochma.git
Deployed: https://hochma-production.up.railway.app/

## Important
- Hebrew RTL interface (dir="rtl" set in html element in app/layout.tsx)
- All user-facing text must be in Hebrew
- Heebo font (Hebrew+Latin, multiple weights)
- Mobile-first design with bottom nav bar and top header
- Photos stored as Bytes in PostgreSQL (not file storage)
- AI analysis uses GPT-4o Vision
- Reports generated as .docx using the `docx` npm package
