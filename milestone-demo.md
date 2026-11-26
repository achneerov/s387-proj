# Milestone demo

1. Show `gear-reserve/openapi.yaml` and the routes → services → database structure.
2. From `gear-reserve/`: `npm run db:reset`, then `npm start`.
3. Open `http://localhost:3000`; log in as Alice (`alice@gearreserve.test` / `demo-password`).
4. Get equipment, reserve an item for a future window, then get my reservations.
5. Cancel the reservation using PATCH.
6. In another terminal: `npm run demo:concurrency` — one success, 19 conflicts, one saved booking.
7. Run `npm run demo:persistence` — booking and retry result survive an API restart.
8. Explain: `BEGIN IMMEDIATE` keeps the overlap check and insert in one write transaction.
