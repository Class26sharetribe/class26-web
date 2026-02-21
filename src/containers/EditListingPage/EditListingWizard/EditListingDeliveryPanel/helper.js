import { getMuxAsset } from '../../../../util/api';

/**
 * Wait for a MUX asset to be ready by polling.
 * @param {string} uploadId - The MUX upload ID
 * @returns {Promise<Object>} The asset data with playback_id and asset_id
 */
export const waitForAssetReady = async uploadId => {
  const maxAttempts = 30;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const assetData = await getMuxAsset({ uploadId });

    if (assetData.state === 'completed') {
      return assetData;
    }

    // Wait 2 seconds before next attempt
    await new Promise(resolve => setTimeout(resolve, 2000));
    attempts++;
  }

  throw new Error('Video processing timeout');
};
