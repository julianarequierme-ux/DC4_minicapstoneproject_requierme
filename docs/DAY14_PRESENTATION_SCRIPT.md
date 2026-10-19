# TripEase Day 14 Presentation Script

**Target duration:** 17-20 minutes
**Use with:** [presentation.pdf](./presentation.pdf) and the live application. Replace bracketed notes with the presenter's actual name or prepared demo URL.

## 1. Opening - 2 minutes

“Good [morning/afternoon]. My name is Jaycel Aplacador, and I am presenting TripEase, an online travel booking system for a small Philippine travel agency.

Travelers need a convenient way to find trips, make reservations, and understand what happens to a booking after submission. The agency also needs to keep package availability, customer bookings, payments, and current totals organized.

TripEase brings those customer and administrator tasks into one web application. I will first explain the solution and architecture, then demonstrate a customer booking and the administrator workflow, and finish with the handover materials and known limitations.”

## 2. Solution overview - 3 minutes

“TripEase has two roles. Customers can browse and search packages, create bookings, see their own booking history, edit or cancel eligible pending bookings, and view their personal booking totals. Administrators can manage packages, review all bookings, approve or reject pending bookings, complete approved bookings, manage payments, and see aggregate dashboard totals.

The React application communicates through Axios with a Laravel JSON API. Laravel validates requests, authenticates protected requests using Sanctum bearer tokens, and enforces roles and booking ownership. MySQL stores the business records.

The ERD shows the main relationships: each user can have many bookings, each travel package can appear in many bookings, and each booking can have one optional payment. Booking totals are calculated on the server, and package availability is adjusted when bookings are created or cancelled.

The project also includes API and UI validation, pagination, loading and error feedback, and confirmation before destructive actions.”

## 3. Live product walkthrough - 8-10 minutes

### Customer flow - about 4-5 minutes

1. Open the login page and sign in with the seeded customer account listed in the README.
2. Browse travel packages. Search by destination or title, select a category/status filter, and move between pages.
3. Open a package and show its price, availability, and booking action.
4. Create a booking with a travel date, guest count, and optional special request. Point out the server-calculated total and submit/loading feedback.
5. Open My Bookings and show the new **Pending** booking and its details.

### Admin flow - about 4-5 minutes

1. Sign out and sign in with the seeded admin account listed in the README.
2. Open the dashboard and explain that the totals come from API/database queries.
3. Open bookings, locate the customer's Pending booking, view its details, and approve it. Show the **Approved** badge.
4. Mark the approved booking **Completed** if the demo data and time permit.
5. Open package management and demonstrate search, status/category filtering, pagination, and the create/edit form validation.
6. Show the delete confirmation dialog; cancel the dialog so demo data is preserved.
7. If time permits, show payment management and the requirement that a booking must be Approved before it can be used for a payment.

Do not display credentials on screen or leave the application signed in after the demonstration.

## 4. Handover - 2-3 minutes

“The repository contains the installation and environment instructions in the README, the migration-derived ERD in Mermaid and PNG formats, the Postman collection, the test report, the CP1 proposal and wireframes, and the presentation materials.

To install, configure a local database in `.env`, generate the application key, run migrations and seeders, install the frontend dependencies, and start the Laravel and Vite development servers. The README lists the exact commands and local demo-account emails.

The API protects admin operations with role middleware and limits customer booking access to the owning customer. The project tests these rules. Demo passwords are for local demonstrations only; production use requires a secure configured seed password.”

## 5. Closing - 2 minutes

“TripEase delivers the package browsing and administration workflow, customer bookings, booking status transitions, payment management, authentication and role authorization, a database-backed dashboard, and the supporting documentation.

The automated backend suite passes, and production builds complete. Full manual verification of every authenticated browser workflow, real MySQL deployment, the final screenshot set, and a recorded demo video remain outstanding. I will not present those as completed.

Possible Phase 2 work, subject to client approval, could include payment-gateway integration, booking notifications, and expanded reporting. Thank you. I am ready for your questions.”

## Handover checklist

- [x] README, ERD source and PNG, API collection, test report, proposal, wireframes, and presentation materials are in `docs/` or the repository root.
- [x] `.env`, `vendor`, and `node_modules` are excluded from Git tracking.
- [ ] Add genuine desktop/mobile application screenshots under `docs/screenshots/`.
- [ ] Record and link the 5-8 minute demo video in the README.
- [ ] Confirm the intended client/agency name with the instructor.
- [ ] Confirm whether the instructor requires Laravel 11/12 specifically; the current project uses Laravel 13.
- [ ] Perform the final live browser-to-database demo and hand over environment setup securely.
