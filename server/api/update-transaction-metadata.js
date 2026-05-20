const { handleError, serialize } = require('../api-util/sdk');
const { updateTransactionMetadata } = require('../services/sharetribe');

/**
 * POST /api/update-transaction-metadata
 *
 * Body: { transactionId: string, metadata: Object }
 *
 * Delegates to the sharetribe service to merge the given metadata fields
 * into the transaction's metadata, then returns the updated transaction.
 */
module.exports = (req, res) => {
  const { transactionId, metadata } = req.body;

  if (!transactionId) {
    return res.status(400).json({ error: 'transactionId is required' });
  }

  if (!metadata || typeof metadata !== 'object') {
    return res.status(400).json({ error: 'metadata must be an object' });
  }

  return updateTransactionMetadata(transactionId, metadata)
    .then(response => {
      res
        .status(200)
        .set('Content-Type', 'application/transit+json')
        .send(serialize(response.data))
        .end();
    })
    .catch(e => {
      handleError(res, e);
    });
};
