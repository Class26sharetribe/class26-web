create table if not exists listing_catalog (
  listing_id text primary key,
  seller_id text not null,
  title text,
  state text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists listing_stats (
  listing_id text primary key references listing_catalog(listing_id) on delete cascade,
  seller_id text not null,
  view_count integer not null default 0 check (view_count >= 0),
  unique_view_count integer not null default 0 check (unique_view_count >= 0),
  bookmark_count integer not null default 0 check (bookmark_count >= 0),
  sales_count integer not null default 0 check (sales_count >= 0),
  earnings_amount bigint not null default 0,
  earnings_currency text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists listing_view_uniques (
  listing_id text not null references listing_catalog(listing_id) on delete cascade,
  visitor_key text not null,
  first_viewed_at timestamptz not null default now(),
  primary key (listing_id, visitor_key)
);

create table if not exists listing_favorites (
  listing_id text not null references listing_catalog(listing_id) on delete cascade,
  user_id text not null,
  created_at timestamptz not null default now(),
  primary key (listing_id, user_id)
);

create table if not exists listing_sales (
  transaction_id text primary key,
  listing_id text not null references listing_catalog(listing_id) on delete cascade,
  seller_id text not null,
  earnings_amount bigint not null default 0,
  earnings_currency text,
  sold_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists seller_stats_syncs (
  seller_id text primary key,
  sales_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listing_catalog_seller_id_idx on listing_catalog(seller_id);
create index if not exists listing_stats_seller_id_idx on listing_stats(seller_id);
create index if not exists listing_sales_seller_id_idx on listing_sales(seller_id);
create index if not exists listing_sales_listing_id_idx on listing_sales(listing_id);
