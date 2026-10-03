# School ERP — Phase 1

This starter implements the Fee Structure screen from the supplied reference image and a working REST API.

## Stack
- React + Vite
- Node.js + Express
- SQLite + better-sqlite3

## Requirements
- Node.js 20+ recommended
- npm

## Run

```bash
npm install
npm run dev
```

Open:
- Frontend: http://localhost:5173
- API: http://localhost:4000/api/health

## What works

1. Add Fee Type
2. List fee structures by academic year
3. Assign all fee structures to active students of a class
4. Prevent duplicate student-fee assignment
5. Copy a fee structure from one academic year to another
6. Seed classes and two sample students
7. Responsive UI based on the supplied screenshot

## Phase 2

Next modules should be:
- Login + role/permission system
- Student admission
- Student profile
- Fee collection + receipt
- Pending fee report
- Dashboard
- Attendance
- Exams/marks/results
- Staff/payroll
- Income/expenses
- Audit logs
- Backup and deployment

## Production note

This is a development starter, not a production-ready school ERP. Before production, add secure authentication, authorization middleware, validation, audit logging, backups, HTTPS, rate limiting, CSRF protection where applicable, and a production database such as PostgreSQL/MySQL.
