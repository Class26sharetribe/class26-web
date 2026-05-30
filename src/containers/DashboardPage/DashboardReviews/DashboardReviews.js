import React from 'react';
import classNames from 'classnames';

import { ReviewRating } from '../../../components';
import { getProfileReviewDisplayMeta } from '../../ProfilePage/ProfileReviews/profileReviewsData';

import css from './DashboardReviews.module.css';

const DashboardReviewCard = props => {
  const { review } = props;
  const { content, rating } = review.attributes;
  const { authorName } = getProfileReviewDisplayMeta(review);

  return (
    <article className={css.card}>
      <header className={css.cardHeader}>
        {authorName ? <p className={css.authorName}>{authorName}</p> : null}
      </header>
      <ReviewRating rating={rating} className={css.rating} reviewStarClassName={css.reviewStar} />
      <p className={css.content}>{content}</p>
    </article>
  );
};

/**
 * Expert dashboard reviews — simplified card layout without listing links or action buttons.
 *
 * @component
 * @param {Object} props
 * @param {Array} [props.reviews] - Live reviews from the duck
 * @param {string} [props.rootClassName]
 * @param {string} [props.className]
 */
const DashboardReviews = props => {
  const { className, rootClassName, reviews = [] } = props;
  const displayReviews = reviews;
  const classes = classNames(rootClassName || css.root, className);

  if (!displayReviews.length) {
    return null;
  }

  return (
    <ul className={classes}>
      {displayReviews.map(review => (
        <li key={`DashboardReview_${review.id.uuid}`} className={css.reviewItem}>
          <DashboardReviewCard review={review} />
        </li>
      ))}
    </ul>
  );
};

export default DashboardReviews;
