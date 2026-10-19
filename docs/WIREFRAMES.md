# TripEase Low-Fidelity Wireframes

These text wireframes describe the main application screens. They are structural sketches, not final visual designs.

## Public - Login

```text
+------------------------------------------------------+
| TripEase                                      Home   |
+------------------------------------------------------+
|                       LOGIN                          |
| Email       [________________________________]       |
| Password    [________________________________]       |
|                 [ Sign in ]                          |
| New to TripEase? Register                            |
+------------------------------------------------------+
```

## Public - Register

```text
+------------------------------------------------------+
| TripEase                                      Home   |
+------------------------------------------------------+
|                     REGISTER                         |
| Name        [________________________________]       |
| Email       [________________________________]       |
| Password    [________________________________]       |
| Confirm     [________________________________]       |
|                 [ Create account ]                   |
+------------------------------------------------------+
```

## Public/customer - Travel package list

```text
+------------------------------------------------------+
| TripEase | Dashboard | Packages | My Bookings | User |
+------------------------------------------------------+
| Packages                                             |
| Search [________________] Category [All v] Status[v]|
| Price range [____] - [____]        [Clear filters]  |
| +----------------+ +----------------+ +------------+|
| | Package image  | | Package image  | | Package    ||
| | Title/location| | Title/location | | Title      ||
| | Price  [View] | | Price  [View]  | | Price      ||
| +----------------+ +----------------+ +------------+|
|                    [Previous] 1 2 3 [Next]           |
+------------------------------------------------------+
```

## Customer - Package details

```text
+------------------------------------------------------+
| TripEase | Dashboard | Packages | My Bookings | User |
+------------------------------------------------------+
| [ Package image ]   Package title                    |
|                     Destination / category           |
|                     Description                      |
|                     Duration / price / availability  |
|                     [Book this package]              |
+------------------------------------------------------+
```

## Customer - Dashboard

```text
+------------------------------------------------------+
| TripEase | Dashboard | Packages | My Bookings | User |
+------------------------------------------------------+
| Welcome, customer                                    |
| [My bookings] [Pending] [Approved] [Completed]       |
| [Browse packages]             [My bookings]          |
+------------------------------------------------------+
```

## Customer - Booking form

```text
+------------------------------------------------------+
| TripEase | Dashboard | Packages | My Bookings | User |
+------------------------------------------------------+
| Book: package title                                  |
| Travel date       [____________]                     |
| Number of guests  [__]                               |
| Special request   [____________________________]     |
| Estimated total   PHP ______                         |
|                    [Submit booking]                 |
+------------------------------------------------------+
```

## Customer - My bookings

```text
+------------------------------------------------------+
| TripEase | Dashboard | Packages | My Bookings | User |
+------------------------------------------------------+
| My bookings                      Status [All v]      |
| Package       Travel date   Guests   Total   Status  |
| Package A     date          2        PHP ... Pending |
|                          [View] [Cancel]             |
| Package B     date          1        PHP ... Approved|
|                    [Previous] 1 2 [Next]             |
+------------------------------------------------------+
```

## Customer - Booking details

```text
+------------------------------------------------------+
| TripEase | Dashboard | Packages | My Bookings | User |
+------------------------------------------------------+
| Booking #id                                          |
| Package / date / guests / total / special request   |
| Status: [Pending]                                    |
|                  [Cancel booking]                   |
+------------------------------------------------------+
```

## Customer - Profile

```text
+------------------------------------------------------+
| TripEase | Dashboard | Packages | My Bookings | User |
+------------------------------------------------------+
| Profile                                              |
| Name        [____________________________]           |
| Email       [____________________________]           |
|                 [Save changes]                       |
+------------------------------------------------------+
```

## Admin - Dashboard

```text
+------------------------------------------------------+
| TripEase | Dashboard | Packages | Bookings | Payments|
+------------------------------------------------------+
| Admin Dashboard                                      |
| [Packages] [Bookings] [Pending] [Approved]           |
| [Completed] [Customers] [Paid revenue]               |
+------------------------------------------------------+
```

## Admin - Manage travel packages

```text
+------------------------------------------------------+
| TripEase | Dashboard | Packages | Bookings | Payments|
+------------------------------------------------------+
| Travel packages                    [Add package]     |
| Search [________] Status [All v] Category [All v]   |
| Title       Destination     Price    Status Actions |
| Package A   Destination     PHP ...  Active [Edit]   |
|                                      [Delete]        |
|                    [Previous] 1 2 [Next]             |
+------------------------------------------------------+
```

## Admin - Manage bookings

```text
+------------------------------------------------------+
| TripEase | Dashboard | Packages | Bookings | Payments|
+------------------------------------------------------+
| Bookings                           Status [All v]    |
| Customer    Package   Date   Guests   Total  Status  |
| Customer A  Package A ...    2        PHP .. Pending |
|                              [View] [Approve] [Reject]|
| Approved booking                         [Complete]  |
|                    [Previous] 1 2 [Next]             |
+------------------------------------------------------+
```

## Admin - Manage payments

```text
+------------------------------------------------------+
| TripEase | Dashboard | Packages | Bookings | Payments|
+------------------------------------------------------+
| Payments                                             |
| Booking   Customer   Amount   Method   Status Actions|
| #id       Name       PHP ...  GCash    Paid   [Edit] |
|                                             [Delete] |
|                    [Previous] 1 2 [Next]             |
+------------------------------------------------------+
```
