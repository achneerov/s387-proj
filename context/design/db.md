# GearReserve database design

## `users`

| Column | Type |
| --- | --- |
| `id` | TEXT (UUID), primary key |
| `email` | TEXT, unique |
| `password_hash` | TEXT |
| `role` | TEXT |

## `equipment`

| Column | Type |
| --- | --- |
| `id` | TEXT (UUID), primary key |
| `name` | TEXT |
| `description` | TEXT |

## `reservations`

| Column | Type |
| --- | --- |
| `id` | TEXT (UUID), primary key |
| `user_id` | TEXT (UUID), foreign key → `users.id` |
| `equipment_id` | TEXT (UUID), foreign key → `equipment.id` |
| `starts_at` | INTEGER |
| `ends_at` | INTEGER |
| `status` | TEXT |

## `idempotency_results`

| Column | Type |
| --- | --- |
| `user_id` | TEXT (UUID), foreign key → `users.id`, part of composite primary key |
| `idempotency_key` | TEXT (UUID), part of composite primary key |
| `request_hash` | TEXT |
| `response_status` | INTEGER |
| `response_body` | TEXT |
