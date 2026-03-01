# Employee Timesheet App

A responsive web app for employees to record daily hours across a Sunday–Saturday work week. Supports four roles: Employee, Foreman, Accounting, and Administrator.

## Quick Start (Docker)

```bash
cp .env.example .env
# Edit .env with your settings (especially AUTH_SECRET)

docker compose up --build
```

App runs at http://localhost:3000. Default admin login:
- Email: `admin@example.com`
- Password: `changeme123`

## Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL 14+

### Setup

```bash
npm install

cp .env.example .env
# Edit DATABASE_URL and other settings in .env

# Run migrations and create initial admin user
npx prisma migrate dev
npx tsx prisma/seed.ts

npm run dev
```

### Generate Prisma client after schema changes
```bash
npx prisma generate
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | required |
| `AUTH_SECRET` | NextAuth.js secret (min 32 chars) | required |
| `NEXTAUTH_URL` | App URL for callbacks | `http://localhost:3000` |
| `SEED_ADMIN_EMAIL` | First admin email | required for seed |
| `SEED_ADMIN_PASSWORD` | First admin password | required for seed |
| `TZ` | Server timezone | `America/New_York` |

## User Roles

| Role | Can Do |
|------|--------|
| **EMPLOYEE** | Enter own hours for current open week |
| **FOREMAN** | Edit any employee's hours on open weeks |
| **ACCOUNTING** | View/edit all hours any week (open or closed); close/open weeks; edit pay rates |
| **ADMINISTRATOR** | Everything + manage users (create, edit, deactivate) |

## Business Rules

- **Per diem** is auto-applied server-side: any day with `regularHours + driveHours > 0` gets a per diem mark
- **Max hours**: `regularHours + driveHours ≤ 24` per day
- **Employees** can only edit the current calendar week (Sunday–Saturday)
- **Closing** a week prevents Employee and Foreman edits; Accounting and Admin can still edit
- Users are **soft-deleted** (isActive=false) to preserve timesheet history
