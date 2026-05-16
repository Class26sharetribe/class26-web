import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../../util/reactIntl';
import { ReviewRating, NamedLink } from '../../../components';
import { createSlug } from '../../../util/urlHelpers';

import { getProfileReviewsForDisplay, getProfileReviewDisplayMeta } from './profileReviewsData';
import css from './ProfileReviews.module.css';

const updateScrollProgress = (slider, setScrollProgress) => {
  if (!slider) return;
  const { scrollLeft, scrollWidth, clientWidth } = slider;
  if (scrollWidth <= clientWidth) {
    setScrollProgress({ left: 0, width: 100 });
    return;
  }
  const widthPercent = (clientWidth / scrollWidth) * 100;
  const leftPercent = (scrollLeft / scrollWidth) * 100;
  setScrollProgress({ left: leftPercent, width: widthPercent });
};

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

  const displayReviews = [...getProfileReviewsForDisplay(reviews, { useDemoReviews }),...getProfileReviewsForDisplay(reviews, { useDemoReviews })];
  const classes = classNames(
    rootClassName || css.root,
    className,
    listingPageLayout && css.rootListingPage,
    css.reviewsScroller
  );

  const sliderRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState({ left: 0, width: 0 });

  const onReviewsScroll = e => {
    updateScrollProgress(e.currentTarget, setScrollProgress);
  };

  const setSliderNode = useCallback(node => {
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }
    sliderRef.current = node;
    if (node) {
      updateScrollProgress(node, setScrollProgress);
      const ro = new ResizeObserver(() => {
        updateScrollProgress(sliderRef.current, setScrollProgress);
      });
      ro.observe(node);
      resizeObserverRef.current = ro;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      updateScrollProgress(sliderRef.current, setScrollProgress);
    });
    return () => cancelAnimationFrame(frameId);
  }, [displayReviews.length]);

  if (!displayReviews.length) {
    return null;
  }

  const showScrollProgress =
    displayReviews.length > 1 && scrollProgress.width > 0 && scrollProgress.width < 100;

  return (
    <div className={css.reviewsSliderWrap}>
      <ul className={classes} ref={setSliderNode} onScroll={onReviewsScroll}>
        {displayReviews.map(review => (
          <li key={`ProfileReview_${review.id.uuid}`} className={css.reviewItem}>
            <ProfileReviewCard review={review} contextListing={contextListing} />
          </li>
        ))}
      </ul>
      {showScrollProgress ? (
        <div className={css.scrollProgressTrack} aria-hidden="true">
          <div
            className={css.scrollProgressActive}
            style={{
              left: `${scrollProgress.left}%`,
              width: `${scrollProgress.width}%`,
            }}
          />
        </div>
      ) : null}
    </div>
  );
};

export default ProfileReviews;
