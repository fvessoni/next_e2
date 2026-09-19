# KintalVax — next_e2

Next.js app bootstrapped from `next_e1`, currently limited to login and user management.

## Requirements

- Node.js 20+
- PostgreSQL (Neon) — `next_e2` uses its own Neon database (`next_e2`) with only the `users` table. Configure `.env` with `DATABASE_URL` and `AUTH_SECRET`.

## Setup

```bash
npm install
npm run db:init
npm run db:seed-user
```

## Development

```powershell
.\dev.ps1 -clean
```

Open [http://localhost:3000](http://localhost:3000).

Default admin (after `db:seed-user`):

- `demo@jurix.local` / `demo123`

Or set any admin:

```bash
npm run db:set-password -- email@example.com yourpassword "Display Name"
```

## Scripts

| Command                   | Description                  |
| ------------------------- | ---------------------------- |
| `npm run dev`             | Dev server (webpack)         |
| `npm run db:init`         | Create the users table       |
| `npm run db:seed-user`    | Create demo admin user       |
| `npm run db:set-password` | Create/update admin password |
