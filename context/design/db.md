# GearReserve database design

## `users`

| Column | Type | Meaning and constraints |
| --- | --- | --- |
| `id` | TEXT (UUID), primary key | Application-generated account UUID; fixed UUID for seeded accounts |
| `email` | TEXT, unique | Trimmed, lowercase login address; normalize on both creation and login |
| `password_hash` | TEXT | Salted password hash, including the password library's algorithm parameters |
| `role` | TEXT | `borrower` or `admin` |
| `is_active` | INTEGER | `0` or `1`; defaults to `1`. Inactive users cannot log in or use protected operations |

## `equipment`

| Column | Type | Meaning and constraints |
| --- | --- | --- |
| `id` | TEXT (UUID), primary key | Application-generated equipment UUID; fixed UUID for seeded items |
| `name` | TEXT | Display name |
| `description` | TEXT | Short description; may be an empty string |
| `is_active` | INTEGER | `0` or `1`; inactive items cannot receive new bookings or checkouts |

## `reservations`

| Column | Type | Meaning and constraints |
| --- | --- | --- |
| `id` | TEXT (UUID), primary key | Application-generated reservation UUID |
| `user_id` | TEXT (UUID), foreign key → `users.id` | Owner, derived from the authenticated caller |
| `equipment_id` | TEXT (UUID), foreign key → `equipment.id` | Reserved physical item |
| `starts_at` | INTEGER | Requested pickup time |
| `ends_at` | INTEGER | Due time; must be greater than `starts_at` |
| `status` | TEXT | `reserved`, `checked_out`, `returned`, or `cancelled` |

## `idempotency_results`

| Column | Type | Meaning and constraints |
| --- | --- | --- |
| `user_id` | TEXT (UUID), foreign key → `users.id`, part of composite primary key | Caller who owns this key |
| `idempotency_key` | TEXT, part of composite primary key | Client-supplied key, optionally a UUID; unique per user across all actions |
| `request_hash` | TEXT | Fingerprint of the HTTP method, target, and normalized, validated input; different requests using the same key return `409` |
| `response_status` | INTEGER | Original HTTP success status |
| `response_body` | TEXT | Serialized JSON response |
