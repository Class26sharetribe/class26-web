import { types as sdkTypes } from '../../../util/sdkLoader';
import { REVIEW_TYPE_OF_PROVIDER } from '../../../util/types';
import { userDisplayNameAsString } from '../../../util/data';

const { UUID } = sdkTypes;

const demoAuthorJohn = {
  id: new UUID('demo-review-author-john'),
  type: 'user',
  attributes: {
    profile: {
      displayName: 'John Doe',
    },
  },
};

const demoAuthorSarah = {
  id: new UUID('demo-review-author-sarah'),
  type: 'user',
  attributes: {
    profile: {
      displayName: 'Sarah Miller',
    },
  },
};

/**
 * Demo reviews shaped like API reviews (propTypes.review + optional listing).
 * Used when useDemoReviews is true on ProfileReviews.
 */
export const PROFILE_REVIEWS_DEMO = [
  {
    id: new UUID('demo-review-1'),
    attributes: {
      createdAt: new Date('2024-08-12'),
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur ut libero luctus, bibendum turpis sed, aliquet erat. Donec...',
      rating: 5,
      state: 'public',
      type: REVIEW_TYPE_OF_PROVIDER,
    },
    author: demoAuthorJohn,
    listing: {
      id: new UUID('demo-listing-personal-growth'),
      attributes: {
        title: 'Personal Growth 101',
      },
    },
  },
  {
    id: new UUID('demo-review-2'),
    attributes: {
      createdAt: new Date('2024-07-03'),
      content:
        'Excellent session — clear, practical, and motivating. I left with tools I could use the same day.',
      rating: 5,
      state: 'public',
      type: REVIEW_TYPE_OF_PROVIDER,
    },
    author: demoAuthorSarah,
    listing: {
      id: new UUID('demo-listing-mindfulness'),
      attributes: {
        title: 'Mindfulness Basics',
      },
    },
  },
];

const getListingFromReview = review => {
  const listing = review?.listing;
  if (!listing?.id?.uuid) {
    return null;
  }
  const title = listing.attributes?.title;
  if (!title) {
    return null;
  }
  return { id: listing.id.uuid, title };
};

/**
 * @param {Object} listing - current listing entity (e.g. from ListingPage) or minimal { id, attributes: { title } }
 * @returns {{ id: string, title: string } | null}
 */
export const getContextListingForAttribution = listing => {
  if (!listing) {
    return null;
  }
  const id = listing.id?.uuid ?? listing.id;
  const title = listing.attributes?.title ?? listing.title;
  if (!id || !title) {
    return null;
  }
  return { id, title };
};

/**
 * Returns reviews for ProfileReviews: demo set or live API reviews.
 *
 * @param {Array} reviews - Reviews from ProfilePage duck (propTypes.review)
 * @param {Object} options
 * @param {boolean} [options.useDemoReviews=false] - When true, returns PROFILE_REVIEWS_DEMO
 * @returns {Array} reviews to render
 */
export const getProfileReviewsForDisplay = (reviews = [], { useDemoReviews = false } = {}) => {
  if (useDemoReviews) {
    return PROFILE_REVIEWS_DEMO;
  }
  return reviews;
};

/**
 * @param {Object} review
 * @param {Object} [contextListing] - Page listing (ListingPage); overrides review.listing for attribution when set
 * @returns {{ authorName: string, listing: { id: string, title: string } | null }}
 */
export const getProfileReviewDisplayMeta = (review, contextListing) => {
  const authorName = userDisplayNameAsString(review?.author, '');
  const fromContext = getContextListingForAttribution(contextListing);
  const listing = fromContext || getListingFromReview(review);
  return { authorName, listing };
};
