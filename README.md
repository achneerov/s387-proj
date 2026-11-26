# GearReserve

GearReserve is a campus equipment booking and lending service from GearReserve.

- **Founder** Alexander Chneerov
- **Stack** Node.js, Express, Knex, SQLite, and [OpenAPI](openapi.yaml)

Features include sign-in, equipment booking with double-booking protection, checkout and return, and background confirmation emails with retries.

## Run locally

Use Node.js 26. From the repository root:

```sh
npm ci
test -f .env || cp .env.example .env
npm run db:reset
```

Set `JWT_SECRET` in `.env` to a random value of at least 32 characters before starting the API. `db:reset` deletes existing local bookings and loads demo data.

In three terminals at the repository root, run one command per terminal:

```sh
npm start
npm run mock:email
npm run worker:email
```

Open http://localhost:3000 and sign in with `alice@gearreserve.test` and `demo-password`. Book an item and check the mock inbox at http://localhost:3001/messages. For an outage demo, restart the mock with `EMAIL_MOCK_FAIL=1 npm run mock:email`.

Run `npm run demo:concurrency` and `npm run demo:persistence` to verify booking conflicts and restart behavior.
