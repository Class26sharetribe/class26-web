import React from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import { Heading, H2 } from '../../components';

import ProfileReviews from '../ProfilePage/ProfileReviews/ProfileReviews';

import css from './ListingPage.module.css';

/**
 * Listing reviews — same card layout as ProfileReviews; desktop shows up to 3 per row.
 *
 * @param {Object} props
 * @param {Array} props.reviews
 * @param {propTypes.error} [props.fetchReviewsError]
 * @param {propTypes.listing} [props.listing] - Current listing (for attribution “on [title]”)
 */
const SectionReviews = props => {
  const { reviews, fetchReviewsError, listing } = props;

  return (
    <section className={css.sectionReviews}>
      {/* <Heading as="h2" rootClassName={css.sectionHeadingWithExtraMargin}>
        <FormattedMessage id="ListingPage.reviewsTitle" values={{ count: reviews.length }} />
      </Heading> */}
      {fetchReviewsError ? (
        <H2 className={css.errorText}>
          <FormattedMessage id="ListingPage.reviewsError" />
        </H2>
      ) : null}
      <ProfileReviews
        reviews={reviews}
        contextListing={listing}
        listingPageLayout
        useDemoReviews={false}
      />
    </section>
  );
};

export default SectionReviews;
