# TripEase Mini Capstone Proposal

## Project title

**TripEase - Online Travel Booking System**

## Client

A small Philippine travel agency is the intended client. The repository does not specify the agency's legal or business name.

## Problem statement

Travelers need a convenient way to discover trips, compare available packages, make bookings, and follow their booking status. A small agency also needs a consistent way to maintain package availability, review customer bookings, manage payments, and see current booking totals. TripEase provides these workflows through a role-protected web application backed by a database and API.

## Objectives

- Give customers searchable, filterable travel-package listings and package details.
- Allow customers to create and manage their own eligible bookings.
- Let administrators manage packages, bookings, and payments.
- Enforce authentication, role authorization, ownership, and server-side validation.
- Show database-derived booking and dashboard information.

## User roles

| Role | Capabilities |
|---|---|
| Admin | Create, update, and delete packages; review all bookings; approve or reject pending bookings; complete approved bookings; manage payments; view aggregate dashboard statistics. |
| Customer | Register and sign in; browse/search/filter packages; create bookings; view and edit their own pending bookings; cancel their own pending bookings; view personal booking counts. |

## Main entities and relationships

| Entity | Purpose |
|---|---|
| `users` | Authenticated admins and customers. |
| `travel_packages` | Destinations, categories, prices, descriptions, availability, and active state. |
| `bookings` | Customer/package reservations, dates, guest counts, calculated totals, requests, and status. |
| `payments` | Payment method, amount, status, and paid date for a booking. |

- A user has many bookings; each booking belongs to one user.
- A travel package has many bookings; each booking belongs to one travel package.
- A booking has zero or one payment; each payment belongs to one booking.

The live schema and support tables are shown in [ERD.mmd](./ERD.mmd).

## Features and Mini Capstone requirements mapping

| Mini Capstone requirement | TripEase implementation |
|---|---|
| Authentication | Laravel Sanctum registration, login, logout, current-user endpoint, and bearer tokens. |
| Role-based access | Admin middleware for administrative API operations; customer ownership checks on bookings. |
| Travel package CRUD | Admin package create/update/delete API and UI; customer package list and details. |
| Booking CRUD/workflow | Customer booking create/read/update/cancel; admin listing, approval/rejection, completion, and permitted deletion. |
| Payment management | Admin payment list/create/read/update/delete with booking and payment validation. |
| Search and filtering | API-backed package search/category/status/price filters and booking search/status/date filters. |
| Pagination | Laravel pagination metadata displayed in React lists. |
| Dashboard | Database-generated package, booking-status, and customer totals for admins; own booking counts for customers. |
| Validation | Client form checks and Laravel validation responses, including HTTP 422 field errors. |
| User feedback | Loading indicators, success/error messages, empty states, and delete/cancel confirmation. |
| Responsive interface | Travel-themed React layout with a mobile navigation menu and responsive lists. |

## Scope and distinct focus

TripEase is scoped to a small agency's package, booking, and payment workflows. It calculates booking totals on the server, tracks package availability as bookings are created/cancelled, and exposes customer-scoped booking counts alongside the administrator's aggregate dashboard. The project does not include a live payment-gateway integration or external booking-provider integration.

## Day 1-2 checklist

- [x] Define the client type, problem, objectives, roles, entities, relationships, and core scope.
- [x] Map application features to the Mini Capstone requirements.
- [x] Create the migration-based ERD in Mermaid and export it as [ERD.png](./ERD.png).
- [x] Create the requested page wireframes in [WIREFRAMES.md](./WIREFRAMES.md).
- [x] Maintain the GitHub repository and documentation structure.
- [ ] Confirm the named client/agency with the instructor; the repository does not identify it.
