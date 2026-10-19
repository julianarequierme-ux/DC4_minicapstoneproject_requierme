# CP3 Checklist – TripEase (React → Axios → Laravel API → MySQL)

Tested on: 19 / 10 / 2026     Tester: Automated repository checks; browser/MySQL tester not run

`PASS (API test)` means the corresponding backend behavior passed automated feature tests using the test database. It does not claim a live React-to-MySQL browser check. `NOT RUN` means that manual verification is still required.

| # | Requirement | How to verify | Result |
|---|-------------|---------------|--------|
| **AUTHENTICATION** |
| 1 | Register | /register creates a customer; row appears in `users` | PASS (API test; live MySQL/UI not checked) |
| 2 | Login | Valid login reaches the dashboard; wrong password shows an error | PASS (API credential tests; dashboard navigation not checked) |
| 3 | Logout | Token removed from Local Storage; protected pages redirect to /login | NOT RUN |
| 4 | Current user | `GET /api/user` returns the logged-in user (Network tab) | PASS (API test; Network tab not checked) |
| 5 | Token persistence | F5 keeps the session | NOT RUN |
| 6 | 401 handling | Delete the token row / edit the token, reload → redirected to /login | NOT RUN |
| **CUSTOMER** |
| 7 | Browse packages | /packages lists data from MySQL | PASS (API feature test; live MySQL/UI not checked) |
| 8 | Search | Request contains `search=`; results match | PASS (API feature test; Network tab not checked) |
| 9 | Filter | Request contains `status=`; results match | PASS (API feature test; Network tab not checked) |
| 10 | Pagination | Request contains `page=2`; different records | PASS (API feature test; Network tab not checked) |
| 11 | View package | /packages/:id shows details | PASS (API show feature test; browser not checked) |
| 12 | Create booking | Booking saved with correct user_id, package id, total | NOT RUN (booking form added; browser/MySQL flow not checked) |
| 13 | View own bookings | Only own bookings listed | NOT RUN (customer booking list added; browser/MySQL flow not checked) |
| 14 | Cancel eligible booking | Pending can be cancelled after confirmation; others cannot | NOT RUN (customer cancellation UI added; browser flow not checked) |
| **ADMIN** |
| 15 | Login | Admin account reaches /admin/dashboard | NOT RUN |
| 16 | Dashboard access | /admin/dashboard opens | NOT RUN |
| 17 | Package CRUD | Create, edit, delete all persist in MySQL | PASS (API feature test database; live MySQL/UI not checked) |
| 18 | View all bookings | All customers' bookings visible | PASS (API feature test) |
| 19 | Change booking status | Pending→Confirmed→Completed; Pending→Cancelled; invalid move rejected | PASS (API feature test) |
| 20 | Payment management | Record and update a payment for a Confirmed booking | NOT RUN (payment API tests pass; browser-to-MySQL flow not checked) |
| **SECURITY** |
| 21 | Customer blocked from admin pages | Customer opening /admin/* is redirected | NOT RUN (browser navigation not checked) |
| 22 | Customer blocked from admin API | Customer token → admin endpoints returns 403 (Postman + `Cp3SecurityTest`) | PASS (`Cp3SecurityTest` and payment API tests) |
| 23 | Admin-only ops protected in Laravel | Admin routes sit behind `auth:sanctum` + RoleMiddleware | PASS (`php artisan route:list --path=api -v`) |
| **DATA** |
| 24 | No fake frontend data | No hard-coded arrays; stopping Laravel shows an error, not data | NOT RUN (server-stop behavior not checked) |
| 25 | Full data path | A change in React is visible in MySQL and after refresh | NOT RUN (live browser/MySQL flow not checked) |

**Failures found and fixes made:**
- The customer booking form, booking list, booking detail/cancel pages, and routes were missing or placeholders. Added the frontend flow and API service methods. Frontend build/lint and backend feature tests pass; manual browser/MySQL verification remains outstanding.

**CP3 overall:** 13 of 25 have supporting automated/API PASS results; 0 FAIL; 12 NOT RUN. This is not a full end-to-end CP3 sign-off.

Automated verification run: `php artisan test` — 51 tests passed, 312 assertions. Frontend lint and production build passed. Manual browser and live MySQL checks remain outstanding.
