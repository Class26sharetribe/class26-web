import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../../util/reactIntl';
import { ReviewRating, NamedLink } from '../../../components';
import { createSlug } from '../../../util/urlHelpers';

import { getProfileReviewsForDisplay, getProfileReviewDisplayMeta } from './profileReviewsData';
import css from './ProfileReviews.module.css';

const ProfileReviewCard = props => {
  const { review, contextListing } = props;
  const { content, rating } = review.attributes;
  const { authorName, listing } = getProfileReviewDisplayMeta(review, contextListing);

  const listingLinkMaybe =
    listing?.id && listing?.title ? (
      <NamedLink
        className={css.listingLink}
        name="ListingPage"
        params={{ id: listing.id, slug: createSlug(listing.title) }}
      >
        {listing.title}
      </NamedLink>
    ) : null;

  return (
    <article className={css.card}>
      <ReviewRating
        rating={rating}
        className={css.rating}
        reviewStarClassName={css.reviewStar}
      />
      <p className={css.content}>{content}</p>
      {authorName ? (
        <p className={css.attribution}>
          {listingLinkMaybe ? (
            <FormattedMessage
              id="ProfilePage.reviewAttributionWithListing"
              values={{
                authorName,
                listingLink: listingLinkMaybe,
              }}
            />
          ) : (
            authorName
          )}
        </p>
      ) : null}
    </article>
  );
};

/**
 * Provider profile reviews — card layout with optional demo data.
 *
 * @component
 * @param {Object} props
 * @param {Array} [props.reviews] - Live reviews from ProfilePage (propTypes.review)
 * @param {boolean} [props.useDemoReviews=false] - When true, renders PROFILE_REVIEWS_DEMO
 * @param {Object} [props.contextListing] - Current listing (ListingPage); used for “on [title]” attribution
 * @param {boolean} [props.listingPageLayout=false] - Up to 3 cards per row on large viewports
 * @param {string} [props.rootClassName]
 * @param {string} [props.className]
 */
const ProfileReviews = props => {
  const {
    className,
    rootClassName,
    reviews = [],
    useDemoReviews = false,
    contextListing,
    listingPageLayout = false,
  } = props;
  const displayReviews = getProfileReviewsForDisplay(reviews, { useDemoReviews });
  const classes = classNames(
    rootClassName || css.root,
    className,
    listingPageLayout && css.rootListingPage
  );

  if (!displayReviews.length) {
    return null;
  }

  return (
    <ul className={classes}>
      {displayReviews.map(review => (
        <li key={`ProfileReview_${review.id.uuid}`} className={css.reviewItem}>
          <ProfileReviewCard review={review} contextListing={contextListing} />
        </li>
      ))}
    </ul>
  );
};

export default ProfileReviews;
