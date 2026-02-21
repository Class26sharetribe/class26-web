const sharetribeSdk = require('sharetribe-flex-sdk');
const { transactionLineItems } = require('../api-util/lineItems');
const { isIntentionToMakeOffer } = require('../api-util/negotiation');
const {
  getSdk,
  getTrustedSdk,
  handleError,
  serialize,
  fetchCommission,
  getIntegrationSdk,
} = require('../api-util/sdk');

const { Money } = sharetribeSdk.types;

const listingPromise = (sdk, id) =>
  sdk.listings.show({
    id,
  });

const listingPrivatePromise = (sdk, id) =>
  sdk.listings.show({
    id: id?.uuid,
  });

const getFullOrderData = (orderData, bodyParams, currency) => {
  const { offerInSubunits } = orderData || {};
  const transitionName = bodyParams.transition;

  return isIntentionToMakeOffer(offerInSubunits, transitionName)
    ? {
        ...orderData,
        ...bodyParams.params,
        currency,
        offer: new Money(offerInSubunits, currency),
      }
    : { ...orderData, ...bodyParams.params };
};

const getMetadata = (orderData, transition) => {
  const { actor, offerInSubunits } = orderData || {};
  // NOTE: for now, the actor is always "provider".
  const hasActor = ['provider', 'customer'].includes(actor);
  const by = hasActor ? actor : null;

  return isIntentionToMakeOffer(offerInSubunits, transition)
    ? {
        metadata: {
          offers: [
            {
              offerInSubunits,
              by,
              transition,
            },
          ],
        },
      }
    : {};
};

module.exports = (req, res) => {
  const { isSpeculative, orderData, bodyParams, queryParams } = req.body || {};
  const transitionName = bodyParams.transition;
  const sdk = getSdk(req, res);
  const iSdk = getIntegrationSdk();
  let lineItems = null;
  let metadataMaybe = {};
  let assetsMaybe = null;

  Promise.all([
    listingPromise(sdk, bodyParams?.params?.listingId),
    fetchCommission(sdk),
    listingPrivatePromise(iSdk, bodyParams?.params?.listingId),
  ])
    .then(([showListingResponse, fetchAssetsResponse, showListingPrivateResponse]) => {
      const listing = showListingResponse.data.data;
      const { digitalAssets } = showListingPrivateResponse.data.data.attributes.privateData || {};
      const commissionAsset = fetchAssetsResponse.data.data[0];

      if (!!digitalAssets) {
        assetsMaybe = digitalAssets;
      }

      const currency = listing.attributes.price?.currency || orderData.currency;
      const { providerCommission, customerCommission } =
        commissionAsset?.type === 'jsonAsset' ? commissionAsset.attributes.data : {};

      lineItems = transactionLineItems(
        listing,
        getFullOrderData(orderData, bodyParams, currency),
        providerCommission,
        customerCommission
      );
      metadataMaybe = getMetadata(orderData, transitionName);

      return getTrustedSdk(req);
    })
    .then(async trustedSdk => {
      const { params } = bodyParams;

      // Add lineItems to the body params
      const body = {
        ...bodyParams,
        params: {
          ...params,
          lineItems,
          ...metadataMaybe,
        },
      };

      if (!isSpeculative && !!assetsMaybe) {
        const securedAssets = [];
        for (const asset of assetsMaybe) {
          const { url, playback_id } = asset.file;
          securedAssets.push({
            ...(url && { url }),
            ...(playback_id && { playback_id }),
            name: asset.name,
            type: asset.type,
          });
        }

        params.protectedData.digitalAssets = securedAssets;
      }

      if (isSpeculative) {
        return trustedSdk.transactions.initiateSpeculative(body, queryParams);
      }
      return trustedSdk.transactions.initiate(body, queryParams);
    })
    .then(apiResponse => {
      const { status, statusText, data } = apiResponse;
      res
        .status(status)
        .set('Content-Type', 'application/transit+json')
        .send(
          serialize({
            status,
            statusText,
            data,
          })
        )
        .end();
    })
    .catch(e => {
      handleError(res, e);
    });
};
