const { mediaServices } = require('../services');

/**
 * Returns a time-limited signed URL for reading a file from R2.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSecuredUrl = async (req, res) => {
  const { key } = req.query;

  if (!key || typeof key !== 'string') {
    return res.status(400).json({ success: false, error: 'File key is required' });
  }

  // Prevent path traversal
  if (key.includes('..') || key.startsWith('/')) {
    return res.status(400).json({ success: false, error: 'Invalid key format' });
  }

  try {
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
