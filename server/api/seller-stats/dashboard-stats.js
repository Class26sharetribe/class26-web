const { getTrustedSdk } = require('../../api-util/sdk');
const { getSellerStats, syncSellerSales } = require('./stats-helpers');
const log = require('../../log');

const parseListingIds = query => {
  const raw = query.listingIds;
  if (!raw) {
    return [];
  }
  if (Array.isArray(raw)) {
    return raw.flatMap(value => String(value).split(',')).filter(Boolean);
  }
  return String(raw).split(',').filter(Boolean);
};

module.exports = async (req, res) => {
  const sellerId = req.tokenUserId;

  try {
    const sdk = await getTrustedSdk(req);
    await syncSellerSales({ sellerId, sdk });
    const stats = await getSellerStats({ sellerId, listingIds: parseListingIds(req.query) });
    res.status(200).json(stats);
  } catch (e) {
    log.error(e, 'seller-dashboard-stats-failed', { sellerId });
    res.status(503).json({
      error: 'Seller stats are unavailable',
      statsUnavailable: true,
    });
  }
};
