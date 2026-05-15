import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../../util/reactIntl';
import { ReviewRating, NamedLink } from '../../../components';
import { createSlug } from '../../../util/urlHelpers';

import { getProfileReviewsForDisplay, getProfileReviewDisplayMeta } from './profileReviewsData';
import css from './ProfileReviews.module.css';

const ProfileReviewCard = props => {
  const { review } = props;
  const { content, rating } = review.attributes;
  const { authorName, listing } = getProfileReviewDisplayMeta(review);

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
 * @param {string} [props.rootClassName]
 * @param {string} [props.className]
 */
const ProfileReviews = props => {
  const { className, rootClassName, reviews = [], useDemoReviews = false } = props;
  const displayReviews = getProfileReviewsForDisplay(reviews, { useDemoReviews });
  const classes = classNames(rootClassName || css.root, className);

  if (!displayReviews.length) {
    return null;
  }

  return (
    <ul className={classes}>
      {displayReviews.map(review => (
        <li key={`ProfileReview_${review.id.uuid}`} className={css.reviewItem}>
          <ProfileReviewCard review={review} />
        </li>
      ))}
    </ul>
  );
};

export default ProfileReviews;
