# GearReserve final project steps

The milestone concurrency and persistence demos already pass. The course brief lists the final demo and defense for **Dec 1–3, 2026** and the code freeze and report for **Dec 3, 2026**.

## 1. Finish the lending and notification workflow

- [ ] Add a migration for loan events and a durable notification outbox. Verify it upgrades a database containing existing reservations.
- [ ] Save each booking, its idempotency response, and its pickup notification in one transaction. Record pickup and return events with their reservation changes.
- [ ] Run a separate HTTP email mock with a `POST /messages` endpoint. Deduplicate deliveries by notification ID and provide a way to simulate delays and failures.
- [ ] Add a worker with a request timeout, up to five attempts with backoff and jitter, and recovery of work claimed before a crash. Use the same notification ID on every attempt.
- [ ] Generate overdue reminders for checked-out gear, with one reminder per loan per reminder period. Make failed deliveries visible for staff follow-up. Verify that delivery failure leaves the booking valid.

## 2. Complete and verify the API

- [ ] Confirm the final database choice. The brief allows SQLite for solo founders. If keeping SQLite, explain how `BEGIN IMMEDIATE` protects the overlap check and write, and document the difference from the proposed PostgreSQL per-item lock.
- [ ] Reconcile the proposal with the final API. Prioritize rescheduling and availability search. Decide how to handle cursor pagination, admin inventory management, and dedicated checkout and return routes. Preserve existing `PATCH` behavior.
- [ ] Fix request error handling so malformed JSON and validation failures return the documented `4xx` response. Document statuses and stable error codes in OpenAPI.
- [ ] Add a live OpenAPI conformance command that checks response schemas. Demonstrate a backward-compatible contract change, such as optional availability filters, with an existing client.
- [ ] Verify the full pickup-to-return flow, cross-account access denial, rejected invalid tokens, late returns blocking the next checkout, and idempotent retries. If adding rescheduling, verify that it cannot race with creation to produce overlapping bookings.
- [ ] Re-run `npm run demo:concurrency` and `npm run demo:persistence`. Verify that pending notifications survive a restart and that provider delays and retries neither block bookings nor duplicate delivery.

## 3. Make startup and operations reproducible

- [ ] Add process liveness and database readiness endpoints.
- [ ] Add structured logs with a correlation ID that follows the request through the outbox and worker. Keep credentials and tokens out of logs.
- [ ] Package and document startup for the API, worker, and email mock. Include environment setup, a data-preserving migration command, and explicit demo seeding.
- [ ] Update the README with the company, product, founders, stack, features, setup, and verification commands. Follow it from a clean checkout.

## 4. Prepare the final submission and defense

- [ ] Write the 5–7 page PDF report. Cover the product and API clients, contract and compatibility change, architecture diagram, data model and locking, integration failure handling, security self-review, limitations, and setup. Include 3–5 genuine AI collaboration examples and a contribution statement if submitting as a pair.
- [ ] Prepare 2–3 slides and update the demo script. Rehearse the 10–12 minute session with a booking, pickup, return, successful notification, provider failure, ownership denial, and the concurrency demo.
- [ ] Practice explaining the transaction, idempotency, ownership check, and worker retries. Rehearse making a small live code change.
- [ ] Confirm the instructor and TA can access the GitHub repository. Create and push the `final` tag at code freeze, then submit the repository URL and PDF report on Moodle.

## References

- [Course project brief](documents/SOEN387_CourseProject_2026.pdf)
- [GearReserve proposal](documents/Project_Proposal_Gearreserve.docx)
- [GearReserve pitch](documents/Project_Pitch_Gearreserve.pptx)
- [Milestone demo](../milestone-demo.md)
