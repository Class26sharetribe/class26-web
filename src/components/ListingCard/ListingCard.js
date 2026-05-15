// ⚠️ If you modify the styling of this component and you're using the SectionListings component in your marketplace (featured listings)
// please reflect those changes in the calculateCarouselHeight function in SectionListings.js to avoid layout issues
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import MuxPlayer from '@mux/mux-player-react';

import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import { useConfiguration } from '../../context/configurationContext';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';

import { useIntl, FormattedMessage } from '../../util/reactIntl';
import { getMuxJwtToken } from '../../util/api';
import { requireListingImage } from '../../util/configHelpers';
import { lazyLoadWithDimensions } from '../../util/uiHelpers';
import { createSlug } from '../../util/urlHelpers';

import { updateProfileThunk } from '../../containers/ProfileSettingsPage/ProfileSettingsPage.duck';

import {
  AspectRatioWrapper,
  NamedLink,
  ResponsiveImage,
  ListingCardThumbnail,
  IconClose,
} from '../../components';

import Avatar from '../Avatar/Avatar';

import {
  getListingCardTranslations,
  resolveCourseCardContent,
  handleToggleFavorites,
} from './ListingCard.helpers';

import css from './ListingCard.module.css';
import { formatCourseDuration } from '../../util/courseHelpers';
import {
  LISTING_TYPE_INDIVIDUAL_COACHING,
  LISTING_TYPE_GROUP_COACHING,
  LISTING_TYPE_VIDEO_COURSE,
} from '../../util/types';

const LazyImage = lazyLoadWithDimensions(ResponsiveImage, { loadAfterInitialRendering: 3000 });

/**
 * First Mux video item from `publicData.mediaGallery`, if any.
 *
 * @param {Array<{ type?: string, playbackId?: string }>} [mediaGallery]
 * @returns {{ type: string, playbackId: string } | null}
 */
const getMuxVideoFromMediaGallery = mediaGallery => {
  const item = mediaGallery.find(entry => entry.type === 'video');
  return item?.playbackId;
};

// Default card: must match `landingPage-css` / design (portrait 3:4, text + pills on image)
const CARD_ASPECT_WIDTH = 3;
const CARD_ASPECT_HEIGHT = 4;

export const LISTING_CARD_VARIANT_DEFAULT = 'default';
export const LISTING_CARD_VARIANT_COURSE = 'course';

const BookmarkIcon = () => (
  <svg
    className={css.bookmarkIcon}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M4.5 2.5h7a0.5 0.5 0 0 1 0.5 0.5v10.2a0.5 0.5 0 0 1-0.8 0.4L8 10.2l-3.2 3.4a0.5 0.5 0 0 1-0.8-0.4V3a0.5 0.5 0 0 1 0.5-0.5Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);

const PlayIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M40 0C62.0914 0 80 17.9086 80 40C80 62.0914 62.0914 80 40 80C17.9086 80 0 62.0914 0 40C0 17.9086 17.9086 0 40 0ZM33.75 25.3281C32.0834 24.3966 30 25.5607 30 27.4238V52.5762C30 54.4393 32.0834 55.6034 33.75 54.6719L56.25 42.0957C57.9165 41.1641 57.9165 38.8359 56.25 37.9043L33.75 25.3281Z"
      fill="white"
      fillOpacity="0.3"
    />
  </svg>
);

/**
 * Course / horizontal listing card (Figma layout). Data resolves from
 * `listing.attributes.publicData.courseCard` with demo fallbacks.
 *
 * @param {Object} props
 * @param {Object} props.listing
 * @param {Object} props.config
 * @param {string} props.renderSizes
 * @param {boolean} props.lazyLoadImage
 * @param {Object} props.courseContent
 * @param {string} props.variantPrefix
 * @param {string} props.cardAriaLabel
 * @param {Object} props.translations
 * @returns {JSX.Element}
 */
const ListingCardCourse = props => {
  const {
    listing,
    config,
    renderSizes,
    lazyLoadImage,
    courseContent,
    variantPrefix,
    cardAriaLabel,
    translations,
    listingTypeLabel,
  } = props;

  const intl = useIntl();
  const dispatch = useDispatch();
  const routeConfiguration = useRouteConfiguration();
  const location = useLocation();
  const history = useHistory();
  const currentUser = useSelector(state => state.user.currentUser);

  const {
    priceLabel,
    badgePrimary,
    badgeSecondary,
    authorDisplayName,
    highlight,
    mediaLabel,
  } = courseContent;

  const { showPrice, priceMessage } = translations;
  const {
    author,
    attributes: { title, description, publicData },
  } = listing;
  const id = listing?.id?.uuid;
  const slug = createSlug(title);
  const savedFavorites = currentUser?.attributes?.profile?.privateData?.favorites || [];
  const isFavorite = savedFavorites.includes(id);
  const firstImage = listing?.images?.[0] || null;
  const variants = firstImage
    ? Object.keys(firstImage?.attributes?.variants).filter(k => k.startsWith(variantPrefix))
    : [];
  const ImageComponent = lazyLoadImage ? LazyImage : ResponsiveImage;

  const categories = config.categoryConfiguration?.categories || [];
  const {
    categoryLevel1: categoryLevel1Value,
    totalSessions,
    listingType,
    courseModules,
    mediaGallery = [],
  } = publicData;

  const playbackId = getMuxVideoFromMediaGallery(mediaGallery);
  const categoryLevel1Label = categoryLevel1Value
    ? categories.find(c => c.id === categoryLevel1Value)?.name || categoryLevel1Value
    : null;
  const authorId = author?.id?.uuid;
  const durationText = !!courseModules ? formatCourseDuration(courseModules) : null;

  const onSaveClick = e => {
    e.preventDefault();
    e.stopPropagation();
    handleToggleFavorites({
      currentUser,
      routes: routeConfiguration,
      location,
      history,
      params: { id },
      onUpdateFavorites: payload => dispatch(updateProfileThunk(payload)),
    })(isFavorite);
  };

  return (
    <article className={css.rootCourse} aria-label={cardAriaLabel}>
      <div className={css.courseLayout}>
        <div className={css.courseLeft}>
          <div className={css.coursePriceRow}>
            {showPrice && priceMessage ? (
              <div className={css.coursePrice} title={translations.priceTooltip}>
                {priceMessage}
              </div>
            ) : (
              <div className={css.coursePrice}>{priceLabel}</div>
            )}
          </div>

          <NamedLink className={css.courseTitleLink} name="ListingPage" params={{ id, slug }}>
            <h3 className={css.courseTitle}>{title}</h3>
          </NamedLink>

          <div className={css.courseMetaRow}>
            {author ? (
              <Avatar
                user={author}
                className={css.courseAvatar}
                rootClassName={css.courseAvatarRoot}
                renderSizes="48px"
                disableProfileLink
              />
            ) : (
              <div className={css.courseAvatarPlaceholder} />
            )}
            <div className={css.courseBadgeColumn}>
              <span className={classNames(css.courseBadge, css.courseBadgeGreen)}>
                {categoryLevel1Label}
              </span>
              <span className={classNames(css.courseBadge, css.courseBadgeNeutral)}>
                {listingTypeLabel}
              </span>
              <p className={css.courseByLine}>
                <FormattedMessage
                  id="ListingCard.courseByAuthor"
                  values={{
                    author:
                      authorId != null ? (
                        <NamedLink
                          name="ProfilePage"
                          params={{ id: authorId }}
                          className={css.courseAuthorNameLink}
                        >
                          {authorDisplayName}
                        </NamedLink>
                      ) : (
                        <span className={css.courseAuthorNamePlain}>{authorDisplayName}</span>
                      ),
                  }}
                />
              </p>
            </div>
          </div>

          <div className={css.courseHighlight}>
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="28" height="28" rx="14" fill="#A2F8CE" />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M19.9457 8.62169L11.5923 16.6834L9.37568 14.315C8.96734 13.93 8.32568 13.9067 7.85901 14.2334C7.40401 14.5717 7.27568 15.1667 7.55568 15.645L10.1807 19.915C10.4373 20.3117 10.8807 20.5567 11.3823 20.5567C11.8607 20.5567 12.3157 20.3117 12.5723 19.915C12.9923 19.3667 21.0073 9.81169 21.0073 9.81169C22.0573 8.73836 20.7857 7.79336 19.9457 8.61002V8.62169Z"
                fill="#00A069"
              />
            </svg>

            <span className={css.courseHighlightText}>
              {listingType === LISTING_TYPE_INDIVIDUAL_COACHING ? (
                <FormattedMessage
                  id="ListingCard.highlightIndividualCoaching"
                  values={{ totalSessions }}
                />
              ) : listingType === LISTING_TYPE_GROUP_COACHING ? (
                <FormattedMessage
                  id="ListingCard.highlightGroupCoaching"
                  values={{ totalSessions }}
                />
              ) : listingType === LISTING_TYPE_VIDEO_COURSE ? (
                <FormattedMessage id="ListingCard.highlightVideoCourse" values={{ durationText }} />
              ) : (
                <FormattedMessage id="ListingCard.highlightDefault" />
              )}
            </span>
          </div>

          <p className={css.courseDescription}>{description}</p>

          <div className={css.courseActions}>
            <button
              type="button"
              className={classNames(css.courseBtnSecondary, { [css.courseBtnSaved]: isFavorite })}
              onClick={onSaveClick}
              aria-pressed={isFavorite}
            >
              {!isFavorite ? <BookmarkIcon /> : <IconClose />}
              <FormattedMessage
                id={isFavorite ? 'ListingCard.savedForLater' : 'ListingCard.saveForLater'}
              />
            </button>
            <NamedLink className={css.courseBtnPrimary} name="ListingPage" params={{ id, slug }}>
              <FormattedMessage id="ListingCard.discoverMore" />
            </NamedLink>
          </div>
        </div>

        <div className={css.courseMedia}>
          {playbackId ? (
            <MuxPlayer
              className={css.courseMuxPlayer}
              playbackId={playbackId}
              streamType="on-demand"
              accentColor="#FFFFFF"
              primaryColor="#ddd"
              secondaryColor="transparent"
              autoPlay
              playsInline
              skipJwt={true}
            />
          ) : (
            <>
              <NamedLink
                name="ListingPage"
                params={{ id, slug }}
                className={css.courseMediaLinkLayer}
                aria-label={cardAriaLabel}
              />
              {firstImage ? (
                <ImageComponent
                  rootClassName={css.courseMediaImage}
                  alt={title}
                  image={firstImage}
                  variants={variants}
                  sizes={renderSizes}
                />
              ) : null}
            </>
          )}
        </div>
      </div>
    </article>
  );
};

/**
 * ListingCardImage
 * @component
 */
const ListingCardImage = props => {
  const {
    listing,
    setActivePropsMaybe,
    title,
    renderSizes,
    aspectWidth,
    aspectHeight,
    variantPrefix,
    aspectRatioClassName,
    lazyLoadImage,
    children,
  } = props;

  const firstImage = listing?.images?.[0] || listing.author.profileImage || null;
  const variants = firstImage
    ? Object.keys(firstImage?.attributes?.variants).filter(k => k.startsWith(variantPrefix))
    : [];

  const aspectRatioClass = aspectRatioClassName || css.aspectRatioWrapper;
  const ImageComponent = lazyLoadImage ? LazyImage : ResponsiveImage;

  return (
    <AspectRatioWrapper
      className={aspectRatioClass}
      width={aspectWidth}
      height={aspectHeight}
      {...setActivePropsMaybe}
    >
      <ImageComponent
        rootClassName={css.rootForImage}
        alt={title}
        image={firstImage}
        variants={variants}
        sizes={renderSizes}
      />
      <div className={css.overlayScrim} />
      {children}
    </AspectRatioWrapper>
  );
};

/**
 * ListingCard
 *
 * @param {string} [props.cardVariant] `default` (image + text below) or `course` (horizontal Figma layout)
 * @returns {JSX.Element}
 */
export const ListingCard = props => {
  const config = useConfiguration();
  const intl = props.intl || useIntl();

  const {
    className,
    rootClassName,
    aspectRatioClassName,
    darkMode,
    listing,
    renderSizes,
    setActiveListing,
    showAuthorInfo = true,
    lazyLoadImage = true,
    cardVariant = LISTING_CARD_VARIANT_DEFAULT,
    useAuthorImage,
  } = props;

  const translations = getListingCardTranslations(listing, config, intl);
  const {
    titlePlain,
    titleFormatted,
    cardAriaLabel,
    showPrice,
    priceTooltip,
    priceMessage,
    authorName,
  } = translations;

  const classes = classNames(
    cardVariant === LISTING_CARD_VARIANT_COURSE ? css.rootCourseWrapper : rootClassName || css.root,
    className
  );

  const id = listing?.id?.uuid;
  const { title = '', publicData } = listing?.attributes || {};
  const slug = createSlug(title);

  const { listingType, cardStyle } = publicData || {};
  const validListingTypes = config.listing.listingTypes || [];
  const foundListingTypeConfig = validListingTypes.find(conf => conf.listingType === listingType);
  const showListingImage = requireListingImage(foundListingTypeConfig);

  const {
    aspectWidth = 1,
    aspectHeight = 1,
    variantPrefix = 'listing-card',
  } = config.layout.listingImage;

  const cardAspectWidth = CARD_ASPECT_WIDTH;
  const cardAspectHeight = CARD_ASPECT_HEIGHT;

  const listingTypeLabel = foundListingTypeConfig?.label || null;

  const setActivePropsMaybe = setActiveListing
    ? {
        onMouseEnter: () => setActiveListing(listing?.id),
        onMouseLeave: () => setActiveListing(null),
      }
    : null;

  const courseContent = resolveCourseCardContent(listing, config, intl, showPrice);

  if (cardVariant === LISTING_CARD_VARIANT_COURSE) {
    return (
      <div className={classes}>
        <ListingCardCourse
          listing={listing}
          config={config}
          renderSizes={renderSizes}
          lazyLoadImage={lazyLoadImage}
          courseContent={courseContent}
          variantPrefix={variantPrefix}
          cardAriaLabel={cardAriaLabel}
          translations={translations}
          listingTypeLabel={listingTypeLabel}
        />
      </div>
    );
  }

  return (
    <NamedLink className={classes} name="ProfilePage" params={{ id }} ariaLabel={cardAriaLabel}>
      {showListingImage ? (
        <ListingCardImage
          renderSizes={renderSizes}
          title={titlePlain}
          listing={listing}
          setActivePropsMaybe={setActivePropsMaybe}
          aspectWidth={cardAspectWidth}
          aspectHeight={cardAspectHeight}
          variantPrefix={useAuthorImage ? 'seller-landing' : variantPrefix}
          aspectRatioClassName={aspectRatioClassName}
          lazyLoadImage={lazyLoadImage}
        >
          <div className={css.info}>
            <div className={css.mainInfo}>
              <div className={classNames(css.title, { [css.lightText]: darkMode })}>
                {titleFormatted}
              </div>
              {showAuthorInfo ? (
                <div className={classNames(css.authorInfo, { [css.lightText]: darkMode })}>
                  {authorName}
                </div>
              ) : null}
            </div>
            {/* {pills.length > 0 ? (
              <div className={css.pills}>
                  <div className={css.pill} key={String(p)}>
                    {String(p)}
                  </div>
                ))}
              </div>
            ) : null} */}
          </div>
        </ListingCardImage>
      ) : (
        <ListingCardThumbnail
          style={cardStyle}
          listingTitle={title}
          className={aspectRatioClassName}
          width={cardAspectWidth}
          height={cardAspectHeight}
          setActivePropsMaybe={setActivePropsMaybe}
        />
      )}
    </NamedLink>
  );
};

export default ListingCard;
