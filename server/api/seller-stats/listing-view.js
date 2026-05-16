const crypto = require('crypto');

const { getSql } = require('../../db/postgres');
const { ensureListingCatalog } = require('./stats-helpers');
const log = require('../../log');

const VISITOR_COOKIE = 'class26_stats_visitor';
const VISITOR_COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_VIEWS_PER_IP_LISTING = 20;
const MAX_VIEWS_PER_IP = 200;
const USING_SSL = process.env.REACT_APP_SHARETRIBE_USING_SSL === 'true';

const rateLimitBuckets = new Map();

const validValue = value => typeof value === 'string' && value.trim().length > 0;

const getSigningSecret = () =>
  process.env.STATS_VISITOR_SECRET || process.env.SHARETRIBE_SDK_CLIENT_SECRET;

const signVisitorId = visitorId => {
  return crypto.createHmac('sha256', getSigningSecret()).update(visitorId).digest('base64url');
};

const serializeVisitorCookie = visitorId => {
  return `${visitorId}.${signVisitorId(visitorId)}`;
};

const parseVisitorCookie = cookieValue => {
  if (!validValue(cookieValue) || !getSigningSecret()) {
    return null;
  }

  const separatorIndex = cookieValue.indexOf('.');
  if (separatorIndex === -1) {
    return null;
  }

  const visitorId = cookieValue.slice(0, separatorIndex);
  const signature = cookieValue.slice(separatorIndex + 1);
  const expectedSignature = signVisitorId(visitorId);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return null;
  }

  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer) ? visitorId : null;
};

const getVisitorId = (req, res) => {
  const existingVisitorId = parseVisitorCookie(req.cookies?.[VISITOR_COOKIE]);
  if (existingVisitorId) {
    return existingVisitorId;
  }

  const visitorId = crypto.randomUUID();
  res.cookie(VISITOR_COOKIE, serializeVisitorCookie(visitorId), {
    httpOnly: true,
    sameSite: 'lax',
    secure: USING_SSL,
    maxAge: VISITOR_COOKIE_MAX_AGE,
  });
  return visitorId;
};

const incrementRateLimitBucket = key => {
  const now = Date.now();
  const existing = rateLimitBuckets.get(key);
  const bucket =
    existing && existing.resetAt > now
      ? existing
      : { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  bucket.count += 1;
  rateLimitBuckets.set(key, bucket);
  return bucket.count;
};

const isRateLimited = ({ ip, listingId }) => {
  const listingCount = incrementRateLimitBucket(`listing:${ip}:${listingId}`);
  const ipCount = incrementRateLimitBucket(`ip:${ip}`);
  return listingCount > MAX_VIEWS_PER_IP_LISTING || ipCount > MAX_VIEWS_PER_IP;
};

module.exports = async (req, res) => {
  const { listingId } = req.body || {};

  if (!validValue(listingId)) {
    return res.status(400).json({ error: 'listingId is required' });
  }

  if (!getSigningSecret()) {
    log.error(
      new Error('Stats visitor signing secret is not configured'),
      'listing-view-signing-failed',
      { listingId }
    );
    return res.status(200).json({ counted: false, unique: false, statsSynced: false });
  }

  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  if (isRateLimited({ ip, listingId })) {
    return res.status(200).json({ counted: false, unique: false, throttled: true });
  }

  const visitorId = getVisitorId(req, res);

  try {
    const sql = getSql();
    const catalog = await ensureListingCatalog(listingId);
    const sellerId = catalog.seller_id || catalog.sellerId;

    const uniqueRows = await sql`
      insert into listing_view_uniques (listing_id, visitor_key)
      values (${listingId}, ${visitorId})
      on conflict do nothing
      returning listing_id
    `;
    const isUnique = uniqueRows.length > 0;

    await sql`
      update listing_stats
      set
        view_count = view_count + 1,
        unique_view_count = unique_view_count + ${isUnique ? 1 : 0},
        updated_at = now()
      where listing_id = ${listingId} and seller_id = ${sellerId}
    `;

    res.status(200).json({ counted: true, unique: isUnique });
  } catch (e) {
    log.error(e, 'listing-view-counter-update-failed', { listingId });
    res.status(200).json({ counted: false, unique: false, statsSynced: false });
  }
};
