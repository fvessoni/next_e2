# KintalVax — next_e2

Next.js app bootstrapped from `next_e1`, currently limited to login, users, tutors, dogs, sanitary items, and public vaccination certificates.

## Vercel

Production: [https://next-e2.vercel.app](https://next-e2.vercel.app)

Set these environment variables in the Vercel project (`production`, `preview`, and `development`):

- `DATABASE_URL` — Neon pooled connection (`next_e2`)
- `DATABASE_URL_UNPOOLED` — Neon direct connection
- `AUTH_SECRET`
- `POSTGRES_URL` / `POSTGRES_URL_NON_POOLING` — same Neon URLs (optional aliases)
- `GOOGLE_WALLET_ISSUER_ID` — issuer ID from the Google Pay & Wallet console
- `GOOGLE_WALLET_CREDENTIALS` — service-account JSON as a single line, or drop `google-wallet.json` in the project root (gitignored)

Public certificate pages live at `/certificado/{dogId}` and do not require login. Until Google grants publishing access, Wallet passes show `[TEST ONLY]` and only test users can save them.

## Requirements

- Node.js 20+
- PostgreSQL (Neon) — `next_e2` uses its own Neon database (`next_e2`) with `users`, `tutors`, `dogs`, and `sanitary_itens`. Configure `.env` with `DATABASE_URL` and `AUTH_SECRET`.

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
| `npm run db:init`         | Create users, tutors, dogs, and sanitary_itens tables |
| `npm run db:seed-user`    | Create demo admin user       |
| `npm run db:set-password` | Create/update admin password |
