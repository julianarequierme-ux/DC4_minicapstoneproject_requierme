# TripEase

TripEase is a travel-package browsing and booking system built with a React frontend and a Laravel JSON API.

## Developer

Jaycel Aplacador

## Client

A small Philippine travel agency is the intended client. The repository does not identify the agency by name.

## Problem statement

Travelers need a straightforward way to find trips, submit bookings, and follow booking progress. Administrators need one place to manage packages, review bookings, record payments, and see current system totals. TripEase brings these customer and administration workflows together in a database-backed web application.

## System objectives

- Provide customers with searchable travel packages and a clear booking workflow.
- Let customers view and manage only their own bookings.
- Let administrators manage packages, bookings, and payments.
- Protect API operations with bearer-token authentication and role-based access control.
- Persist business data in MySQL and expose it through a Laravel API consumed by React.

## User roles

- **Admin:** manages travel packages, views all bookings, changes booking status, manages payments, and views the admin dashboard.
- **Customer:** browses packages, creates and edits their own pending bookings, views their bookings, and cancels eligible pending bookings.

## Features

- Registration and login with Laravel Sanctum personal access tokens.
- Searchable, filterable, paginated travel packages.
- Booking creation with server-calculated totals and package availability updates.
- Customer-scoped booking lists, details, updates, and cancellation.
- Admin booking status workflow: Pending -> Approved -> Completed, or Pending -> Cancelled.
- One payment per booking; payment method/status management.
- Database-backed admin dashboard counts.
- Responsive React UI with loading and validation feedback.

## Technology stack

- **Backend:** PHP 8.3, Laravel 13.37, Laravel Sanctum 4.3.
- **Database:** MySQL (configured by default in `.env.example`).
- **Frontend:** React 19.3, React Router 7, Axios 1.20, Vite 8.3.
- **Tooling and tests:** Composer, npm, PHPUnit 12, Oxlint.

**Assignment compatibility note:** the supplied setup prompt specifies Laravel 11 or 12. This repository remains on Laravel 13 as approved; PHP 8.3 satisfies the prompt's PHP 8.2+ minimum. Confirm with the instructor that Laravel 13 is acceptable.

## Architecture

The React single-page application in `frontend_TripEase_react/` sends JSON requests through Axios to the Laravel API under `/api`. Laravel routes apply Sanctum authentication and, for administrator operations, the `role:admin` middleware. Form Requests validate input, controllers coordinate database operations, and API Resources format package, booking, and payment responses. MySQL stores application records. The frontend API base URL defaults to `http://localhost:8000/api` and can be overridden with `VITE_API_URL`.

The Laravel backend is at the repository root and the React app is in `frontend_TripEase_react/`; this differs from the example `backend/` and `frontend/` directory names in the original scaffold prompt.

## Database relationships

- A **user** has many **bookings**. Deleting a user cascades to their bookings.
- A **travel package** has many **bookings**. Deleting a package with bookings is restricted.
- A **booking** belongs to one user and one travel package.
- A **booking** has zero or one **payment**. `payments.booking_id` is unique; deleting a booking cascades to its payment.
- Sanctum `personal_access_tokens` has a polymorphic `tokenable` reference. The session table's nullable `user_id` is indexed but is not declared as a foreign key.

See [docs/ERD.mmd](docs/ERD.mmd) for the entity diagram, including Laravel support tables.

The planning proposal and low-fidelity page sketches are in [docs/CP1_PROPOSAL.md](docs/CP1_PROPOSAL.md) and [docs/WIREFRAMES.md](docs/WIREFRAMES.md).

## Installation

Prerequisites: PHP 8.3+, Composer, Node.js/npm, and a running MySQL server.

From the repository root in PowerShell:

```powershell
composer install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
php artisan key:generate
```

Edit `.env` with the local database settings (see [Environment variables](#environment-variables)), then run the backend and frontend setup below.

## Backend setup

Create the database named in `DB_DATABASE` in MySQL, or change the database settings in `.env` to match an existing local database.

```powershell
php artisan migrate
php artisan db:seed
php artisan serve --host=127.0.0.1 --port=8000
```

The development seeder creates demo accounts, travel packages, bookings, and associated payments. See [Demo accounts](#demo-accounts).

## Frontend setup

In a second PowerShell terminal:

```powershell
Set-Location frontend_TripEase_react
npm install
```

The frontend defaults to `http://localhost:8000/api`. To override it, create `frontend_TripEase_react/.env.local` with:

```dotenv
VITE_API_URL=http://localhost:8000/api
```

Start the frontend:

```powershell
npm run dev
```

For a production frontend build and lint check:

```powershell
npm run build
npm run lint
```

## Environment variables

The backend template is [.env.example](.env.example). It contains placeholders, not deployment credentials.

| Variable | Purpose |
|---|---|
| `APP_NAME`, `APP_ENV`, `APP_KEY`, `APP_DEBUG`, `APP_URL` | Laravel application identity, environment, encryption key, debugging, and URL. Generate the local key with `php artisan key:generate`. |
| `FRONTEND_URL` | Local frontend origin (`http://localhost:5173` in the template). |
| `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | Database connection. The template selects MySQL; set values for your local server. |
| `TRIPEASE_DEMO_SEED_PASSWORD` | Optional shared password for demo accounts. When blank, local/testing seeding uses `password`; production seeding requires this value to be set. |
| `VITE_API_URL` | Optional frontend API origin including `/api`; defaults in code to `http://localhost:8000/api`. Set it in the frontend's `.env.local`. |

Do not commit `.env`, real passwords, or production credentials. `.gitignore` excludes `.env`, `node_modules`, and `vendor`.

## Migration commands

Apply pending migrations:

```powershell
php artisan migrate
```

Check migration status:

```powershell
php artisan migrate:status
```

Rebuild and seed the database (this deletes existing tables/data):

```powershell
php artisan migrate:fresh --seed
```

## Seeder commands

Seed the standard demo users, packages, bookings, and their payments:

```powershell
php artisan db:seed
```

Run only the user seeder:

```powershell
php artisan db:seed --class=UserSeeder
```

For production, set `TRIPEASE_DEMO_SEED_PASSWORD` securely before running `UserSeeder`; do not use the development fallback password.

## Demo accounts

`UserSeeder` creates these accounts. In local/testing environments, each account uses `password` unless `TRIPEASE_DEMO_SEED_PASSWORD` is set. In production, the seeder requires that variable and uses its configured value.

| Role | Email |
|---|---|
| Admin | `admin@tripease.test` |
| Customer | `customer@tripease.test` |
| Customer | `jose.reyes@tripease.test` |
| Customer | `ana.delacruz@tripease.test` |
| Customer | `miguel.garcia@tripease.test` |
| Customer | `leah.mendoza@tripease.test` |

These are local demonstration accounts only. Change the shared password through `TRIPEASE_DEMO_SEED_PASSWORD` for local seed runs when needed; never deploy the development fallback credentials.

## API documentation

All routes below are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`. Laravel API resource update routes accept both `PUT` and `PATCH`.

| Method | URL | Authentication / role | Description |
|---|---|---|---|
| `GET` | `/api/ping` | Public | API health check. |
| `POST` | `/api/register` | Public | Register a customer and return a bearer token. |
| `POST` | `/api/login` | Public; throttled to 10 attempts/minute | Authenticate and return a bearer token. |
| `POST` | `/api/logout` | Sanctum | Revoke the current access token. |
| `GET` | `/api/user` | Sanctum | Return the authenticated user. |
| `GET` | `/api/packages` | Sanctum | List packages; supports search, category, destination, status, price, duration, and pagination filters. |
| `GET` | `/api/packages/{package}` | Sanctum | Return one package. |
| `POST` | `/api/packages` | Sanctum + Admin | Create a package. |
| `PUT`, `PATCH` | `/api/packages/{package}` | Sanctum + Admin | Update a package. |
| `DELETE` | `/api/packages/{package}` | Sanctum + Admin | Delete a package when no booking prevents deletion. |
| `GET` | `/api/bookings` | Sanctum | List bookings (customers see their own; admins see all); supports status, search, date, and pagination filters. |
| `POST` | `/api/bookings` | Sanctum | Create a booking; customer ownership is assigned by the API. Admins may provide `user_id`. |
| `GET` | `/api/bookings/{booking}` | Sanctum | Show an accessible booking (customer-owned or any booking for admin). |
| `PUT`, `PATCH` | `/api/bookings/{booking}` | Sanctum | Edit an accessible pending booking. |
| `DELETE` | `/api/bookings/{booking}` | Sanctum + Admin | Delete a booking. |
| `PATCH` | `/api/bookings/{booking}/cancel` | Sanctum; owning customer | Cancel an eligible pending booking. |
| `PATCH` | `/api/bookings/{booking}/status` | Sanctum + Admin | Change booking status according to the workflow. |
| `GET` | `/api/dashboard` | Sanctum; admin or customer | Return live booking counts scoped to the customer; admins also receive package and customer totals. |
| `GET` | `/api/payments` | Sanctum + Admin | List payments. |
| `POST` | `/api/payments` | Sanctum + Admin | Record a payment for an approved booking. |
| `GET` | `/api/payments/{payment}` | Sanctum + Admin | Show a payment. |
| `PUT`, `PATCH` | `/api/payments/{payment}` | Sanctum + Admin | Update a payment. |
| `DELETE` | `/api/payments/{payment}` | Sanctum + Admin | Delete a payment. |
| `GET` | `/api/admin/ping` | Sanctum + Admin | Administrator role check. |
| `GET` | `/api/customer/ping` | Sanctum + Customer | Customer role check. |

The complete importable Postman v2.1 collection is [docs/postman_collection.json](docs/postman_collection.json). It uses `{{base_url}}` and a bearer `{{token}}` variable; role-specific folders also use the tokens captured by their login requests.

## Testing instructions

Backend tests use PHPUnit and the in-memory SQLite configuration in `phpunit.xml`:

```powershell
php artisan test
```

Frontend checks:

```powershell
Set-Location frontend_TripEase_react
npm run lint
npm run build
```

Manual API smoke tests can be run by importing `docs/postman_collection.json` into Postman, setting the collection base URL, and running requests with the appropriate seeded Admin or Customer token.

## Presentation and handover

- [CP1 proposal](docs/CP1_PROPOSAL.md) and [wireframes](docs/WIREFRAMES.md)
- [Testing report](docs/TESTING.md) and [CP3 checklist](docs/CP3_CHECKLIST.md)
- [Eight-slide presentation PDF](docs/presentation.pdf) and [Day 14 script](docs/DAY14_PRESENTATION_SCRIPT.md)
- [Screenshots folder](docs/screenshots/) is ready for genuine desktop/mobile captures; those screenshots have not been added yet.
- **Demo video:** not recorded yet. Add the published 5-8 minute video URL here when available.

## References

- [Laravel documentation](https://laravel.com/docs)
- [Laravel Sanctum documentation](https://laravel.com/docs/sanctum)
- [React documentation](https://react.dev/learn)
- [Axios documentation](https://axios-http.com/docs/intro)
- [MySQL documentation](https://dev.mysql.com/doc/)
- [Postman collection format v2.1](https://schema.postman.com/json/collection/v2.1.0/collection.json)
- [Mermaid ER diagrams](https://mermaid.js.org/syntax/entityRelationshipDiagram.html)
