# GearReserve endpoints

## Authentication

| Method | Path | Input | Access | Idempotency-Key |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/auth/login` | Body: `{ email, password }` | Public | No |

## Equipment

| Method | Path | Input | Access | Idempotency-Key |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/equipment` | Query: `startsAt?`, `endsAt?`, `limit?`, `cursor?` | Authenticated | No |

## Reservations

| Method | Path | Input | Access | Idempotency-Key |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/equipment/{equipmentId}/reservations` | Body: `{ startsAt, endsAt }` | Authenticated | Required |
| GET | `/api/v1/me/reservations` | Query: `limit?`, `cursor?` | Authenticated; own reservations | No |
| PATCH | `/api/v1/reservations/{reservationId}` | Body: `{ status }`; allowed transitions: `reserved` → `checked_out` or `cancelled`, `checked_out` → `returned` | Owner | Required |
