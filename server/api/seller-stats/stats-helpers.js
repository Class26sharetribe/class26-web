const { getIntegrationSdk } = require('../../api-util/sdk');
const { calculateTotalForProvider } = require('../../api-util/lineItemHelpers');
const { getSql } = require('../../db/postgres');

const COMPLETED_TRANSITIONS = new Set([
  'transition/auto-complete',
  'transition/complete',
  'transition/operator-complete',
  'transition/accept-deliverable',
  'transition/auto-accept-deliverable',
  'transition/operator-accept-deliverable',
  'transition/review-1-by-customer',
  'transition/review-1-by-provider',
  'transition/review-2-by-customer',
  'transition/review-2-by-provider',
  'transition/expire-review-period',
  'transition/expire-customer-review-period',
  'transition/expire-provider-review-period',
]);

// Guard on-demand dashboard sync from paging through an unbounded transaction history.
// With perPage: 100, this caps one sync attempt at 2,500 Sharetribe transactions.
const MAX_SYNC_PAGES = 25;

// Avoid hitting Sharetribe transaction queries on every dashboard load.
// Sales stats are eventually consistent and refresh at most once per seller every 5 minutes.
const SYNC_STALE_MS = 5 * 60 * 1000;

const emptyMoney = currency => ({ amount: 0, currency: currency || null });

const idOf = entity => entity?.id?.uuid || entity?.id;

const moneyToPlain = money => {
  if (!money) {
    return emptyMoney(null);
  }
  return {
    amount: Number(money.amount || 0),
    currency: money.currency || null,
  };
};

const providerEarnings = tx => {
  const payoutTotal = tx?.attributes?.payoutTotal;
  if (payoutTotal) {
    return moneyToPlain(payoutTotal);
  }

  const lineItems = tx?.attributes?.lineItems || [];
  if (lineItems.length === 0) {
    return emptyMoney(null);
  }

  return moneyToPlain(calculateTotalForProvider(lineItems));
};

const isCompletedSale = tx => COMPLETED_TRANSITIONS.has(tx?.attributes?.lastTransition);

const upsertListingCatalog = async ({ listingId, sellerId, title = null, state = null }) => {
  const sql = getSql();
  await sql`
    insert into listing_catalog (listing_id, seller_id, title, state, updated_at)
    values (${listingId}, ${sellerId}, ${title}, ${state}, now())
    on conflict (listing_id)
    do update set
      seller_id = excluded.seller_id,
      title = coalesce(excluded.title, listing_catalog.title),
      state = coalesce(excluded.state, listing_catalog.state),
      updated_at = now()
  `;

  await sql`
    insert into listing_stats (listing_id, seller_id, updated_at)
    values (${listingId}, ${sellerId}, now())
    on conflict (listing_id)
    do update set
      seller_id = excluded.seller_id,
      updated_at = now()
  `;
};

const getListingCatalog = async listingId => {
  const sql = getSql();
  const rows = await sql`
    select listing_id, seller_id, title, state
    from listing_catalog
    where listing_id = ${listingId}
    limit 1
  `;
  return rows[0] || null;
};

const ensureListingCatalog = async listingId => {
  const cached = await getListingCatalog(listingId);
  if (cached) {
    return cached;
  }

  const integrationSdk = getIntegrationSdk();
  const response = await integrationSdk.listings.show({
    id: listingId,
    include: ['author'],
    'fields.listing': ['title', 'state'],
    'fields.user': [],
  });
  const listing = response?.data?.data;
  const author = response?.data?.included?.find(entity => entity.type === 'user');
  const sellerId = idOf(author || listing?.author);

  if (!listing || !sellerId) {
    const error = new Error('Listing owner could not be resolved');
    error.status = 404;
    throw error;
  }

  const title = listing.attributes?.title || null;
  const state = listing.attributes?.state || null;
  await upsertListingCatalog({ listingId, sellerId, title, state });
  return { listing_id: listingId, seller_id: sellerId, title, state };
};

const refreshListingStatsFromSales = async sellerId => {
  const sql = getSql();
  await sql`
    update listing_stats
    set
      sales_count = 0,
      earnings_amount = 0,
      earnings_currency = null,
      updated_at = now()
    where seller_id = ${sellerId}
  `;

  await sql`
    update listing_stats stats
    set
      sales_count = coalesce(sales.sales_count, 0),
      earnings_amount = coalesce(sales.earnings_amount, 0),
      earnings_currency = sales.earnings_currency,
      updated_at = now()
    from (
      select
        listing_id,
        count(*)::integer as sales_count,
        sum(earnings_amount)::bigint as earnings_amount,
        min(earnings_currency) as earnings_currency
      from listing_sales
      where seller_id = ${sellerId}
      group by listing_id
    ) sales
    where stats.listing_id = sales.listing_id and stats.seller_id = ${sellerId}
  `;
};

const shouldSyncSales = async sellerId => {
  const sql = getSql();
  const rows = await sql`
    select sales_synced_at
    from seller_stats_syncs
    where seller_id = ${sellerId}
    limit 1
  `;
  const syncedAt = rows[0]?.sales_synced_at;
  return !syncedAt || Date.now() - new Date(syncedAt).getTime() > SYNC_STALE_MS;
};

const syncSellerSales = async ({ sellerId, sdk }) => {
  const sql = getSql();
  const shouldSync = await shouldSyncSales(sellerId);
  if (!shouldSync) {
    return;
  }

  const lockRows = await sql`select pg_try_advisory_xact_lock(hashtext(${`seller-stats:${sellerId}`})) as locked`;
  if (!lockRows[0]?.locked) {
    return;
  }

  let page = 1;
  let totalPages = 1;

  while (page <= totalPages && page <= MAX_SYNC_PAGES) {
    const response = await sdk.transactions.query({
      only: 'sale',
      include: ['listing'],
      'fields.transaction': ['lastTransition', 'lastTransitionedAt', 'payoutTotal', 'lineItems'],
      'fields.listing': ['title', 'state'],
      page,
      perPage: 100,
    });

    const txs = response?.data?.data || [];
    const included = response?.data?.included || [];
    const listingsById = included.reduce((acc, entity) => {
      if (entity.type === 'listing') {
        acc[idOf(entity)] = entity;
      }
      return acc;
    }, {});

    for (const tx of txs) {
      const listingId = idOf(tx.relationships?.listing?.data) || idOf(tx.listing);
      const listing = listingId ? listingsById[listingId] : null;
      if (!listingId) {
        continue;
      }

      await upsertListingCatalog({
        listingId,
        sellerId,
        title: listing?.attributes?.title || null,
        state: listing?.attributes?.state || null,
      });

      if (!isCompletedSale(tx)) {
        await sql`
          delete from listing_sales
          where transaction_id = ${idOf(tx)} and seller_id = ${sellerId}
        `;
        continue;
      }

      const earnings = providerEarnings(tx);
      const soldAt = tx.attributes?.lastTransitionedAt || new Date().toISOString();
      await sql`
        insert into listing_sales (
          transaction_id,
          listing_id,
          seller_id,
          earnings_amount,
          earnings_currency,
          sold_at,
          updated_at
        )
        values (
          ${idOf(tx)},
          ${listingId},
          ${sellerId},
          ${earnings.amount},
          ${earnings.currency},
          ${soldAt},
          now()
        )
        on conflict (transaction_id)
        do update set
          listing_id = excluded.listing_id,
          seller_id = excluded.seller_id,
          earnings_amount = excluded.earnings_amount,
          earnings_currency = excluded.earnings_currency,
          sold_at = excluded.sold_at,
          updated_at = now()
      `;
    }

    totalPages = response?.data?.meta?.totalPages || page;
    page += 1;
  }

  await refreshListingStatsFromSales(sellerId);
  await sql`
    insert into seller_stats_syncs (seller_id, sales_synced_at, updated_at)
    values (${sellerId}, now(), now())
    on conflict (seller_id)
    do update set sales_synced_at = now(), updated_at = now()
  `;
};

const getSellerStats = async ({ sellerId, listingIds = [] }) => {
  const sql = getSql();
  const filteredListingIds = listingIds.filter(Boolean);
  const listings = filteredListingIds.length
    ? await sql`
        select
          catalog.listing_id,
          catalog.title,
          catalog.state,
          stats.view_count,
          stats.unique_view_count,
          stats.bookmark_count,
          stats.sales_count,
          stats.earnings_amount,
          stats.earnings_currency
        from listing_catalog catalog
        left join listing_stats stats on stats.listing_id = catalog.listing_id
        where catalog.seller_id = ${sellerId}
          and catalog.listing_id = any(${sql.array(filteredListingIds)})
      `
    : await sql`
        select
          catalog.listing_id,
          catalog.title,
          catalog.state,
          stats.view_count,
          stats.unique_view_count,
          stats.bookmark_count,
          stats.sales_count,
          stats.earnings_amount,
          stats.earnings_currency
        from listing_catalog catalog
        left join listing_stats stats on stats.listing_id = catalog.listing_id
        where catalog.seller_id = ${sellerId}
      `;

  const allStats = await sql`
    select
      coalesce(sum(view_count), 0)::bigint as total_views,
      coalesce(sum(unique_view_count), 0)::bigint as total_unique_views,
      coalesce(sum(bookmark_count), 0)::bigint as total_bookmarks,
      coalesce(sum(sales_count), 0)::bigint as listings_sold,
      coalesce(sum(earnings_amount), 0)::bigint as total_earnings,
      min(earnings_currency) as earnings_currency
    from listing_stats
    where seller_id = ${sellerId}
  `;

  const statsByListingId = listings.reduce((acc, row) => {
    acc[row.listing_id] = {
      views: Number(row.view_count || 0),
      uniqueViews: Number(row.unique_view_count || 0),
      bookmarks: Number(row.bookmark_count || 0),
      sales: Number(row.sales_count || 0),
      earnings: {
        amount: Number(row.earnings_amount || 0),
        currency: row.earnings_currency || allStats[0]?.earnings_currency || null,
      },
    };
    return acc;
  }, {});

  const totals = allStats[0] || {};
  return {
    range: 'allTime',
    totals: {
      listingsSold: Number(totals.listings_sold || 0),
      totalEarnings: {
        amount: Number(totals.total_earnings || 0),
        currency: totals.earnings_currency || null,
      },
      totalViews: Number(totals.total_views || 0),
      totalUniqueViews: Number(totals.total_unique_views || 0),
      totalBookmarks: Number(totals.total_bookmarks || 0),
    },
    statsByListingId,
  };
};

module.exports = {
  ensureListingCatalog,
  getSellerStats,
  syncSellerSales,
};
