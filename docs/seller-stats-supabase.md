# Seller Stats Supabase Setup

This project uses Supabase Postgres for seller dashboard stats.

Sharetribe remains the source of truth for users, listings, transactions, and the buyer's saved
favorites list. Supabase stores dashboard-oriented aggregates and idempotency records for:

- listing views
- unique listing views
- bookmark counts
- synced listing sales
- synced seller earnings

## 1. Create a Supabase Project

Create a separate Supabase project for each environment:

- local/dev
- staging
- production

## 2. Run the Database Migration

Open the Supabase SQL Editor and run:

```txt
migrations/001_create_seller_stats.sql
```

This creates the tables required by the seller stats API:

- `listing_catalog`
- `listing_stats`
- `listing_view_uniques`
- `listing_favorites`
- `listing_sales`
- `seller_stats_syncs`

## 3. Configure the Backend Environment

Set this environment variable for the backend/server process:

```bash
SUPABASE_DATABASE_URL="postgresql://..."
```

Do not prefix this variable with `REACT_APP_`. The database URL must never be exposed to browser
code.

After changing the value, restart the backend/dev server.

## 4. Choose the Connection String

Use the Supabase Session pooler URI. It supports both IPv4 and IPv6 and avoids local/deployment
network issues with IPv6-only direct database hosts.

In Supabase, go to:

```txt
Project -> Connect -> Direct
Connection Method -> Session pooler
Type -> URI
```

Copy the URI, replace `[YOUR-PASSWORD]` with the database password, and use that value for
`SUPABASE_DATABASE_URL`. Do not use the Direct connection URI for this app.

If the password contains special URL characters, URL-encode them. Common examples:

```txt
@ -> %40
# -> %23
/ -> %2F
? -> %3F
: -> %3A
% -> %25
```

## 5. RLS Decision

RLS is currently left disabled for these stats tables.

The browser does not connect to Supabase directly. The request path is:

```txt
Browser -> Express API -> Supabase Postgres
```

Authorization is handled in the Express API using the current Sharetribe user session.

Do not add Supabase client-side access to these tables unless the RLS model is redesigned first.

## 6. App Behavior

The app exposes these local API endpoints:

```txt
GET    /api/seller-dashboard/stats
POST   /api/listing-view
POST   /api/favorites/:listingId
DELETE /api/favorites/:listingId
```

The dashboard reads stats from Supabase. Listing pages send view events. Favorite/unfavorite actions
still update Sharetribe user `privateData.favorites`, then update Supabase bookmark counters.

Stats failures are intentionally non-blocking for user-facing save/view actions. If Supabase is
unavailable, favorite saves can still succeed, but dashboard stats will be incomplete until the
database connection is fixed.

## 7. Troubleshooting

`getaddrinfo ENOTFOUND db.<project-ref>.supabase.co`

The Direct connection URI is being used. Replace `SUPABASE_DATABASE_URL` with the Session pooler URI
and restart the backend.

`password authentication failed`

Check that `[YOUR-PASSWORD]` was replaced and special characters were URL-encoded.

`relation "listing_stats" does not exist`

Run `migrations/001_create_seller_stats.sql` in the Supabase SQL Editor.

Dashboard stats show zero

Confirm `SUPABASE_DATABASE_URL` is set on the backend, the backend was restarted, and completed
seller sales or view/favorite events have been synced into Supabase.
