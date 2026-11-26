# GearReserve remaining steps

The live demo and defense are **Dec 1–3, 2026**. The final GitHub tag and PDF report are due **Dec 3, 2026**.

## Before tagging

- [ ] Fix the error handler in [server.js](../src/server.js) so it honors 4xx statuses when an error has no code. Use `INVALID_REQUEST` as the fallback code. Verify a missing token returns `401` and malformed JSON, missing login fields, and a missing idempotency key return `400`.
- [ ] Complete the [README](../README.md) with company and product, founder name, stack, features, environment setup, a reproducible way to start the API, worker, and email mock, and demo credentials and commands. Verify the instructions from a clean copy.

## Report and live defense

- [ ] Write the **5–7 page PDF report**. Include the product and intended API clients, published contract and additive `count` field, architecture diagram, data model and locking, email retries and staff follow-up, security self-review, setup, and limitations. Explain the SQLite choice and differences from the proposal. Include **3–5 real AI collaboration examples** and a contribution statement if submitting as a pair.
- [ ] Prepare **2–3 slides** covering the product, architecture, and hardest technical problem.
- [ ] Rehearse the **10–12 minute demo and defense**. Show booking, checkout and return, email delivery, an email outage with the booking still confirmed, ownership denial, and the concurrency demo. Run the existing scripts with runtime OpenAPI validation enabled. Practice explaining the code and making a small live change.

## Submit

- [ ] Commit and push the finished code. Confirm the instructor and TA can access the GitHub repo.
- [ ] Create and push a Git tag named `final` (or publish a GitHub release named `final`). Confirm it points to the commit you want graded.
- [ ] Submit the GitHub repository URL on Moodle and submit the final PDF report.

[Course project brief](documents/SOEN387_CourseProject_2026.pdf)
