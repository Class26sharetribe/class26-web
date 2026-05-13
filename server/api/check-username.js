const { getIntegrationSdk, handleError, serialize } = require('../api-util/sdk');

/**
 * Check if a username (pub_username) is already taken.
 * Queries users via the Integration SDK with pub_username filter.
 * Returns { available: true } if no user has that username, { available: false } otherwise.
 */
module.exports = (req, res) => {
  const { username } = req.query;

  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    return res.status(400).json({ error: 'username query param is required' });
  }

  const integrationSdk = getIntegrationSdk();

  return integrationSdk.users
    .query({
      pub_username: username.trim(),
      page: 1,
      perPage: 1,
      'fields.user': ['profile.publicData.username'],
    })
    .then(response => {
      const total = response?.data?.meta?.totalItems ?? 0;
      const available = total === 0;
      res.status(200).json({ available });
    })
    .catch(e => handleError(res, e));
};
