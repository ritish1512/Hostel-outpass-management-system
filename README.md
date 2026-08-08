# Campus Outpass System

A modern campus outpass management platform built with Next.js, TypeScript, Prisma, PostgreSQL, and role-based workflow automation.

## What this project delivers

This application is designed to simplify and secure the student outpass request lifecycle on campus. It supports:

- Multi-role authentication and authorization for students, parents, mentors, HODs, wardens, principals, and gatekeepers
- Structured leave request submission and tracking
- Sequential review and approval workflows with tiered escalation
- Detailed audit logs for every decision and action taken
- Department mapping, parent linkage, and academic context for each student

## Key features

- Role-based dashboards for all stakeholders
- Leave request management with type, status, and workflow tier tracking
- Approval, rejection, and completion flows for campus exit permissions
- Secure password hashing with `bcryptjs`
- PostgreSQL-backed persistence via Prisma ORM
- Clean Next.js app routing and UI layout

## Tech stack

- `Next.js` 16 — server-rendered React framework with app directory support
- `TypeScript` — static typing for safer, maintainable code
- `Prisma` — type-safe database access layer
- `PostgreSQL` — relational database for production-ready data integrity
- `next-auth` — secure authentication flows
- `bcryptjs` — password hashing for user security
- `Tailwind CSS` — utility-first styling and consistent layout

## Domain model overview

This project models a real-world campus workflow with the following core entities:

- `User` — student, parent, mentor, HOD, warden, principal, gatekeeper
- `Department` — academic department mapping
- `LeaveRequest` — outpass request with reason, dates, type, status, and workflow tier
- `WorkflowLog` — audit trail for each approval, rejection, and action

The leave lifecycle is governed by strong state management via enums such as `LeaveStatus` and `WorkflowTier`.

## Installation

```bash
cd Outpass
npm install
```

## Local development

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Database setup

1. Configure your PostgreSQL connection in `prisma/.env` or your environment.
2. Run Prisma migrations:

```bash
npx prisma migrate deploy
```

3. Generate the Prisma client:

```bash
npx prisma generate
```

## Project structure

- `src/app` — Next.js app routes and pages
- `src/components` — dashboard and shared UI components
- `src/lib/prisma.ts` — Prisma client initialization
- `src/types` — shared TypeScript role and dashboard types
- `prisma/schema.prisma` — database schema, models, and relations

## Why this project stands out

This system is built as a polished, enterprise-ready campus management tool with a complete approval workflow and audit capability. It demonstrates:

- End-to-end application design from database modeling to frontend user flows
- Multi-user role coordination and secure authorization
- Practical use of modern full-stack tooling in a real-world campus operations context

## Next steps

Potential enhancements for recruiters and product owners:

- Add user registration and invitation flows
- Implement email or in-app notifications for workflow updates
- Add analytics and reporting dashboards for administrators
- Improve UX with mobile-responsive design and accessibility support
