const sharetribeIntegrationSdk = require('sharetribe-flex-integration-sdk');
const { getIntegrationSdk, handleError, serialize } = require('../api-util/sdk');

const DEFAULT_PER_PAGE = 6;
const MIN_PER_PAGE = 1;
const MAX_PER_PAGE = 100;

const createImageVariantConfig = (name, width, height) => ({
  [`imageVariant.${name}`]: sharetribeIntegrationSdk.util.objectQueryString({
    w: width,
    h: height,
    fit: 'crop',
  }),
});

const clampPerPage = value => {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_PER_PAGE;
  }

  return Math.max(MIN_PER_PAGE, Math.min(parsed, MAX_PER_PAGE));
};

module.exports = (req, res) => {
  const integrationSdk = getIntegrationSdk();
  const perPage = clampPerPage(req.query?.perPage);

  return integrationSdk.users
    .query({
      pub_userType: 'provider',
      // The landing page currently shows sellers ordered by creation time.
      sort: 'createdAt',
      page: 1,
      perPage,
      include: ['profileImage'],
      'fields.user': [
        'profile.displayName',
        'profile.abbreviatedName',
        'profile.bio',
        'profile.publicData.userType',
        'profile.publicData.slug',
        'profile.publicData.professionalTitle',
        'profile.publicData.rating',
        'profile.publicData.avatarUrl',
        'profile.publicData.expertise',
        'profile.publicData.languages',
        'profile.publicData.productTypes',
        'banned',
        'deleted',
      ],
      'fields.image': [
        'variants.square-xsmall',
        'variants.square-xsmall2x',
        'variants.square-small',
        'variants.square-small2x',
        'variants.seller-search-card',
        'variants.seller-search-card-2x',
        'variants.seller-landing-card',
        'variants.seller-landing-card-2x',
      ],
      ...createImageVariantConfig('seller-search-card', 640, 400),
      ...createImageVariantConfig('seller-search-card-2x', 1280, 800),
      ...createImageVariantConfig('seller-landing-card', 480, 600),
      ...createImageVariantConfig('seller-landing-card-2x', 960, 1200),
    })
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
