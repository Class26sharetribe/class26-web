const { getTrustedSdk, handleError } = require('../../api-util/sdk');
const { getSql } = require('../../db/postgres');
const { ensureListingCatalog } = require('./stats-helpers');
const log = require('../../log');

const updateUserFavorites = async ({ sdk, listingId, shouldFavorite }) => {
  const currentUserResponse = await sdk.currentUser.show();
  const currentUser = currentUserResponse?.data?.data;
  const privateData = currentUser?.attributes?.profile?.privateData || {};
  const favorites = Array.isArray(privateData.favorites) ? privateData.favorites : [];
  const nextFavorites = shouldFavorite
    ? Array.from(new Set([...favorites, listingId]))
    : favorites.filter(id => id !== listingId);

  return sdk.currentUser.updateProfile(
    {
      privateData: {
        ...privateData,
        favorites: nextFavorites,
      },
    },
    {
      expand: true,
      include: ['profileImage'],
      'fields.image': ['variants.square-small', 'variants.square-small2x'],
    }
  );
};

const updateBookmarkCounter = async ({ listingId, userId, shouldFavorite }) => {
  const sql = getSql();
  const catalog = await ensureListingCatalog(listingId);
  const sellerId = catalog.seller_id || catalog.sellerId;

  if (shouldFavorite) {
    const inserted = await sql`
      insert into listing_favorites (listing_id, user_id)
      values (${listingId}, ${userId})
      on conflict do nothing
      returning listing_id
    `;
    if (inserted.length > 0) {
      await sql`
        update listing_stats
        set bookmark_count = bookmark_count + 1, updated_at = now()
        where listing_id = ${listingId} and seller_id = ${sellerId}
      `;
    }
    return;
  }

  const deleted = await sql`
    delete from listing_favorites
    where listing_id = ${listingId} and user_id = ${userId}
    returning listing_id
  `;
  if (deleted.length > 0) {
    await sql`
      update listing_stats
      set bookmark_count = greatest(bookmark_count - 1, 0), updated_at = now()
      where listing_id = ${listingId} and seller_id = ${sellerId}
    `;
  }
};

const favoriteHandler = shouldFavorite => async (req, res) => {
  const { listingId } = req.params;
  const userId = req.tokenUserId;

  if (!listingId) {
    return res.status(400).json({ error: 'listingId is required' });
  }

  try {
    const sdk = await getTrustedSdk(req);
    await updateUserFavorites({ sdk, listingId, shouldFavorite });

    try {
      await updateBookmarkCounter({ listingId, userId, shouldFavorite });
      res.status(200).json({ success: true, statsSynced: true });
    } catch (statsError) {
      log.error(statsError, 'favorite-bookmark-counter-update-failed', {
        listingId,
        userId,
        shouldFavorite,
      });
      res.status(200).json({ success: true, statsSynced: false });
    }
  } catch (e) {
    handleError(res, e);
  }
};

module.exports = {
  favoriteListing: favoriteHandler(true),
  unfavoriteListing: favoriteHandler(false),
};
