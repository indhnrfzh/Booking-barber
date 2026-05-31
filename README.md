<div align="center">

# 💈 Booking Barber

**A modern, full-stack barber appointment booking system**  
Built to eliminate manual scheduling chaos — for barbershop owners and their customers.

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.21-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://prisma.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

<br/>

[Quick Start](#-quick-start) · [Features](#-features) · [Tech Stack](#-tech-stack) · [API Reference](#-api-reference) · [Deployment](#-deployment)

</div>

---

## Overview

Booking Barber gives barbershop owners a streamlined platform to manage appointments, services, and operating schedules — while giving customers a fast, mobile-ready booking experience.

| Without Booking Barber | With Booking Barber |
|---|---|
| Manual appointment tracking in spreadsheets | Automated booking system with real-time slots |
| Risk of double bookings | Conflict-free scheduling enforced at the API level |
| No confirmation workflow | Automated email confirmations on every booking |
| No customer history | Complete booking records with status tracking |
| Single-language only | Built-in English & Indonesian (i18n via `next-intl`) |

---

## Features

### For Customers
- Browse services with photos, descriptions, and pricing
- Select available time slots in real-time
- Receive an instant email confirmation with a booking code (`REF-XXXX`)
- Track booking status: `PENDING → CONFIRMED → COMPLETED`
- Full mobile-responsive UI

### For Admins
- Secure dashboard protected by JWT authentication
- View, filter, approve, confirm, or cancel bookings
- Manage services (create, edit, toggle active status)
- Configure operating hours per day of the week
- Overview of daily/weekly activity

### For Developers
- 100% TypeScript — frontend to backend
- REST API with typed request/response payloads
- Database migrations with full version history
- Seed script for instant demo data
- Pre-configured ESLint, Tailwind CSS 4, and Prisma

---

## Tech Stack

### Frontend

| Library | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org) | React framework with App Router, SSR, and built-in API routes |
| [React 19](https://react.dev) | UI library with latest hooks and concurrent features |
| [Tailwind CSS 4](https://tailwindcss.com) | Utility-first CSS with JIT compilation |
| [Framer Motion](https://www.framer.com/motion/) | Declarative, smooth animations |
| [React Hook Form](https://react-hook-form.com) | Performant forms with minimal re-renders |

### Backend & Data

| Library | Purpose |
|---|---|
| [Prisma 5](https://www.prisma.io) | Type-safe ORM with migration support |
| [PostgreSQL 14+](https://www.postgresql.org) | ACID-compliant relational database |
| [next-intl](https://next-intl-docs.vercel.app/) | SSR-compatible internationalization |
| [Resend](https://resend.com) | Transactional email delivery |
| [jose](https://github.com/panva/jose) | Spec-compliant JWT implementation |

### Security & Validation

| Library | Purpose |
|---|---|
| [Zod](https://zod.dev) | Runtime schema validation with TypeScript inference |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Password hashing (salt + GPU-resistant) |
| [date-fns](https://date-fns.org) | Lightweight, functional date utilities |

---

## Requirements

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **PostgreSQL 14+** — [postgresql.org](https://www.postgresql.org/download/)
- **npm**, **pnpm**, or **yarn**
- **Git**

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/ilham1421/booking_barber.git
cd booking_barber
```

### 2. Install dependencies

```bash
npm install
# or: pnpm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/booking_barber"

# JWT (generate with: openssl rand -base64 32)
JWT_SECRET="your-secret-key-minimum-32-characters"

# Email
RESEND_API_KEY="re_your_api_key"
```

### 4. Set up the database

```bash
npx prisma migrate dev --name init

# Optional: populate with demo data
npm run seed
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the app is live.

> **Try it:** Browse services → create a booking → visit the admin dashboard (credentials in `prisma/seed.ts`).

---

## Project Structure

```
booking_barber/
├── app/
│   ├── [locale]/               # Locale-scoped pages (EN / ID)
│   │   ├── page.tsx            # Homepage
│   │   ├── booking/            # Booking flow
│   │   ├── layanan/            # Services listing
│   │   └── galeri/             # Photo gallery
│   └── api/
│       ├── admin/login/        # POST — authenticate admin
│       ├── admin/logout/       # POST — invalidate session
│       ├── bookings/           # GET / POST bookings
│       ├── bookings/[id]/      # GET / PATCH / DELETE booking
│       ├── services/           # GET / POST services
│       └── schedule/slots/     # GET — available time slots
│
├── components/
│   ├── home/                   # Homepage section components
│   ├── layout/                 # Navbar, Footer
│   └── ui/                     # Reusable: Button, Input, Badge, etc.
│
├── lib/
│   ├── auth.ts                 # JWT sign / verify
│   ├── booking.ts              # Booking business logic
│   ├── email.ts                # Email templates
│   ├── prisma.ts               # PrismaClient singleton
│   └── utils.ts                # Shared helpers
│
├── prisma/
│   ├── schema.prisma           # Data models
│   ├── seed.ts                 # Demo data
│   └── migrations/             # Schema version history
│
└── messages/
    ├── en.json                 # English strings
    └── id.json                 # Indonesian strings
```

---

## Database Schema

```
Admin
  id · username (unique) · passwordHash · createdAt

Service
  id · nameId · nameEn · descId · descEn
  price (IDR) · duration (min) · imageUrl · isActive · order

Booking
  id · bookingCode (REF-XXXX) · customerName · customerEmail · customerPhone
  serviceId (→ Service) · bookingDate · timeSlot
  status: PENDING | CONFIRMED | CANCELLED | COMPLETED
  notes · createdAt

Schedule
  dayOfWeek (0–6) · openTime (HH:MM) · closeTime · isOpen
```

---

## API Reference

### Authentication

```
POST  /api/admin/login       Validate credentials → return JWT
POST  /api/admin/logout      Invalidate session
```

### Bookings

```
GET    /api/bookings                List with pagination
POST   /api/bookings                Create a new booking
GET    /api/bookings/[id]           Get booking details
PATCH  /api/bookings/[id]           Update booking status
DELETE /api/bookings/[id]           Cancel a booking
```

### Services

```
GET    /api/services                List active services
POST   /api/services                Create a service (admin)
PATCH  /api/services/[id]           Update service details
DELETE /api/services/[id]           Remove a service
```

### Schedule

```
GET    /api/schedule/slots?date=YYYY-MM-DD&serviceId=[id]
                                    Return available time slots
```

---

## Available Scripts

```bash
npm run dev       # Start development server with hot reload
npm run build     # Compile production build
npm start         # Serve the production build
npm run seed      # Populate the database with demo data
npm run lint      # Run ESLint across the codebase
npx tsc --noEmit  # Run TypeScript typecheck
npm run test      # Run unit and component tests
npm run test:integration # Run integration tests (real DB test schema)
npm run test:ci   # Run full local CI pipeline sequence
```

## CI Pipeline

This project ships with staged CI in [.github/workflows/ci.yml](.github/workflows/ci.yml):

1. `quality` — lint + typecheck
2. `unit_component` — Vitest unit/component tests
3. `integration` — real DB integration tests (Postgres service)

To simulate CI locally, use:

```bash
npm run test:ci
```

## Quality Gates & Stabilization

- No-green-no-progress rule: each stage must pass before moving to next stage.
- Integration tests use dedicated test schema (`booking_barber_test`) to avoid polluting development data.
- Prisma advisory lock timeout (`P1002`) is handled by retry logic in `scripts/test-db/reset.cjs`.
- If a flaky failure appears, rerun the same command first; if reproducible, fix root cause then rerun until green.

---

## Deployment

### Vercel (recommended)

1. Push this repository to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Add the environment variables from `.env.local` in the Vercel dashboard.
4. Click **Deploy**.

```bash
# Or deploy directly from the CLI:
npx vercel
```

### Other Platforms (Railway · Render · Fly.io)

1. Connect your GitHub repository.
2. Set `DATABASE_URL`, `JWT_SECRET`, and `RESEND_API_KEY` as environment variables.
3. The platform will auto-detect Next.js and build accordingly.

---

## Troubleshooting

<details>
<summary><strong>Port 3000 is already in use</strong></summary>

```bash
# Windows
netstat -ano | findstr :3000

# macOS / Linux
lsof -i :3000 && kill -9 <PID>
```

Or start on a different port: `npm run dev -- -p 3001`
</details>

<details>
<summary><strong>Database connection failed</strong></summary>

- Verify `DATABASE_URL` in `.env.local` is correct.
- Confirm PostgreSQL is running locally (`pg_isready`).
- Ensure the database user has the necessary permissions.
</details>

<details>
<summary><strong>Migrations failing</strong></summary>

```bash
npx prisma migrate reset
npm run seed
```
</details>

<details>
<summary><strong>Styles not applying</strong></summary>

```bash
rm -rf .next
npm run dev
```
</details>

---

## Contributing

Contributions are welcome. To get started:

```bash
# 1. Fork the repository and clone your fork
git clone https://github.com/<your-username>/booking_barber.git

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Commit your changes
git commit -m "feat: describe your change"

# 4. Push and open a pull request
git push origin feature/your-feature-name
```

Please follow the existing code style, keep commits atomic, and update relevant documentation.

---

## Roadmap

- [ ] WhatsApp / SMS notifications
- [ ] Stripe payment integration
- [ ] Advanced analytics dashboard
- [ ] Recurring bookings support
- [ ] React Native mobile app

---

<div align="center">

Made with care by [ilham1421](https://github.com/ilham1421)

[⭐ Star this repo](https://github.com/ilham1421/booking_barber) · [🐛 Report a bug](https://github.com/ilham1421/booking_barber/issues) · [💬 Discussions](https://github.com/ilham1421/booking_barber/discussions)

</div>
