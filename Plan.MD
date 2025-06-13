# Fee Management Project Plan

The project aims to implement a complete fee management system for students. Below is a phase-wise plan covering deployment, authentication, record management, transactions, reporting, and deployment steps.

## Phase 1 – Environment and Database *(pending)*
- Configure the PostgreSQL database in Vercel using the `DATABASE_URL` environment variable referenced in `prisma/schema.prisma`.
- Ensure Prisma migrations run during deployment (`npx prisma migrate deploy`).

:::task-stub{title="Add deployment and DB setup instructions"}
- Document in README how to set `DATABASE_URL` on Vercel.
- Explain running `npx prisma migrate deploy` during deployment.
:::

## Phase 2 – Authentication & Admin Tools *(done)*
- Provide an admin-only interface to create new user accounts (username, password, role). Users cannot edit or change passwords.
- Apply NextAuth session role checks (`session.user.role`) when accessing admin routes.

:::task-stub{title="Create admin user management pages"}
- Add a new directory `app/admin/users/` with list & create forms.
- Implement a server action or API route in `app/api/users` to create users with hashed passwords (use `bcryptjs` as in `lib/auth.ts`).
- Restrict access by checking `session.user.role === 'admin'`.
:::

## Phase 3 – Student Record Management *(done)*
- Allow a signed-in user to create student records (name, batch, totalFee). Only admins can edit or delete them.

:::task-stub{title="Implement Student CRUD"}
- Create API routes `app/api/students/` supporting POST (create), PUT/PATCH (edit), DELETE.
- Use `prisma.student` methods with a uniqueness constraint on `name` and `batch`.
- Add pages/forms under `app/students/` for creating and listing students.
- Protect edit and delete actions with role checks for admins.
:::

## Phase 4 – Transactions & Concessions *(pending)*
- Record payments and concessions in the `Transaction` table. Concessions require admin approval.

:::task-stub{title="Add transaction handling"}
- Create API routes `app/api/transactions/` for POSTing new payments or proposed concessions.
- Store new concessions with `type: 'concession'` and `approved: false` by default.
- Build an admin approval page to mark concessions as approved, updating the record.
- Allow payment mode selection (`cash` or `online`).
:::

## Phase 5 – Queries and Reports *(pending)*
- Provide pages to query student balances and transaction history by batch or name.
- Summaries should show totals by payment mode and allow date range filtering.

:::task-stub{title="Create reporting endpoints"}
- Implement endpoints under `app/api/reports/` to:
  - Compute balance (total fee minus approved transactions) for a student or batch.
  - Return transactions filtered by batch/name/date range with mode aggregation.
- Build UI components in `app/reports/` to display these results.
:::

## Phase 6 – Deployment *(pending)*
- Add instructions for Vercel deployment in README. Ensure environment variables and migrations are covered.

:::task-stub{title="Update README for deployment"}
- Document setting `DATABASE_URL` on Vercel.
- Describe running `pnpm build && pnpm start` or `vercel build` with Prisma migrations.
:::

---

This plan outlines how to evolve the repository from the existing Next.js setup into a full-featured fee management system.

