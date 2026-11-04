# GearReserve database design

## `users`

| Column | Type | Meaning and constraints |
| --- | --- | --- |
| `id` | TEXT (UUID), primary key | Application-generated account UUID; fixed UUID for seeded accounts |
| `email` | TEXT, unique | Trimmed, lowercase login address; normalize on both creation and login |
| `password_hash` | TEXT | Salted password hash, including the password library's algorithm parameters |
| `role` | TEXT | `borrower` or `admin` |

## `equipment`

| Column | Type | Meaning and constraints |
| --- | --- | --- |
| `id` | TEXT (UUID), primary key | Application-generated equipment UUID; fixed UUID for seeded items |
| `code` | TEXT, unique | Readable equipment label, for example `cam-01` |
| `name` | TEXT | Display name |
| `description` | TEXT | Short description; may be an empty string |
| `is_active` | INTEGER | `0` or `1`; inactive items cannot receive new bookings or checkouts |
| `created_at` | INTEGER | Creation time |
| `updated_at` | INTEGER | Last inventory update |

## `reservations`

| Column | Type | Meaning and constraints |
| --- | --- | --- |
| `id` | TEXT (UUID), primary key | Application-generated reservation UUID |
| `user_id` | TEXT (UUID), foreign key → `users.id` | Owner, derived from the authenticated caller |
| `equipment_id` | TEXT (UUID), foreign key → `equipment.id` | Reserved physical item |
| `starts_at` | INTEGER | Requested pickup time |
| `ends_at` | INTEGER | Due time; must be greater than `starts_at` |
| `status` | TEXT | `reserved`, `checked_out`, `returned`, or `cancelled` |
| `checked_out_at` | INTEGER, nullable | Actual pickup time |
| `returned_at` | INTEGER, nullable | Actual return time |
| `cancelled_at` | INTEGER, nullable | Cancellation time |
| `created_at` | INTEGER | Original booking time |
| `updated_at` | INTEGER | Last reservation change |

## `idempotency_results`

| Column | Type | Meaning and constraints |
| --- | --- | --- |
| `id` | TEXT (UUID), primary key | Application-generated idempotency-result UUID |
| `user_id` | TEXT (UUID), foreign key → `users.id` | Caller who owns this key |
| `operation` | TEXT | Stable action name, for example `create_reservation` |
| `target_id` | TEXT (UUID) | Equipment UUID for creation; reservation UUID for other actions |
| `idempotency_key` | TEXT | Client-supplied key, optionally a UUID; separate from the record ID, with a documented length limit |
| `request_hash` | TEXT | Hash of normalized, validated action input |
| `reservation_id` | TEXT (UUID), foreign key → `reservations.id` | Reservation affected by the successful action |
| `response_status` | INTEGER | Original HTTP success status |
| `response_body` | TEXT | Serialized JSON response |
| `created_at` | INTEGER | Commit time |

## Migrations and resetting demo data

| Seed | Purpose |
| --- | --- |
| `admin@gearreserve.test` | Administrator for inventory maintenance |
| `alice@gearreserve.test` | First borrower and reservation owner |
| `bob@gearreserve.test` | Second borrower for contention and ownership tests |
| `cam-01` — Camera | Fixed UUID and readable code; shared target for the concurrency demo |
| `mic-01` — Microphone | Fixed UUID and readable code; second independently reservable item |
| `proj-01` — Projector | Fixed UUID and readable code; third independently reservable item |
