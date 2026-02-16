const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { getR2Client } = require('../../api-util/mediaSdk');
const mediaConfig = require('../../config/media');

// Configuration
const CONFIG = {
  BUCKET_NAME: mediaConfig.r2.bucketName,
  URL_EXPIRATION: mediaConfig.r2.deliveryUrlExpiration,
};

/**
 * Generate a secured URL for retrieving a file from R2
 * @param {string} fileKey - The key/path of the file in R2 bucket
 * @returns {Promise<Object>} Object containing the signed URL
 * @throws {Error} If file key is invalid or URL generation fails
 */
const generateSecuredUrl = async fileKey => {
  // Validate input
  if (!fileKey || typeof fileKey !== 'string') {
    const error = new Error('File key is required');
    error.status = 400;
    throw error;
  }

  try {
    // Get R2 client
    const R2 = getR2Client();

    // Create GetObject command
    const command = new GetObjectCommand({
      Bucket: CONFIG.BUCKET_NAME,
      Key: fileKey,
    });

    // Generate signed URL
    const signedUrl = await getSignedUrl(R2, command, {
      expiresIn: CONFIG.URL_EXPIRATION,
    });

    return { url: signedUrl };
  } catch (error) {
    console.error('Error generating secured URL:', error);
    const err = new Error('Failed to generate secured URL');
    err.status = 500;
    throw err;
  }
};

module.exports = {
  generateSecuredUrl,
};
