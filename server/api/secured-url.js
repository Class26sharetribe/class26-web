const { mediaServices, sharetribeServices } = require('../services');
const { denormalisedResponseEntities } = require('../api-util/data');

/**
 * Returns a time-limited signed URL for reading a file from R2.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSecuredUrl = async (req, res) => {
  const { key, txId, listingId } = req.query;

  if (!key || typeof key !== 'string') {
    return res.status(400).json({ success: false, error: 'File key is required' });
  }

  if (!txId && !listingId) {
    return res.status(400).json({ success: false, error: 'Either txId or listingId is required' });
  }

  // Prevent path traversal
  if (key.includes('..') || key.startsWith('/')) {
    return res.status(400).json({ success: false, error: 'Invalid key format' });
  }

  try {
    if (txId) {
      const txRes = await sharetribeServices.getTransaction(txId, {
        include: ['customer', 'provider', 'listing', 'booking'],
      });
      const tx = denormalisedResponseEntities(txRes)[0];

      if (tx.customer.id.uuid !== req.tokenUserId) {
        const err = new Error('Forbidden');
        err.status = 403;
        throw err;
      }
    } else if (listingId) {
      const listingRes = await sharetribeServices.getListings({
        ids: listingId,
        include: ['author'],
      });
      const listing = denormalisedResponseEntities(listingRes)[0];

      if (listing.author.id.uuid !== req.tokenUserId) {
        const err = new Error('You do not have permission to access this file');
        err.status = 403;
        throw err;
      }
    }

    const result = await mediaServices.generateSecuredUrl(key);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error generating secured URL:', error);
    return res
      .status(error.status || 500)
      .json({ success: false, error: 'Failed to generate secured URL' });
  }
};

module.exports = getSecuredUrl;
