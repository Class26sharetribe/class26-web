import React from 'react';
import classNames from 'classnames';

import {
  IconArrowUp,
  IconReviewStar,
  ListingCard,
  NamedLink,
  PaginationLinks,
  ResponsiveImage,
} from '../../../components';

import css from './SearchResultsPanel.module.css';

const SEARCH_PROFILE_IMAGE_VARIANTS = [
  'seller-search-card',
  'seller-search-card-2x',
  'square-small',
  'square-small2x',
  'square-xsmall',
  'square-xsmall2x',
];

const isMockSeller = seller => seller?.id?.uuid?.startsWith('mock-seller-');

const getProfile = seller => seller?.attributes?.profile || {};

const getPublicData = seller => getProfile(seller).publicData || {};

const getDisplayName = seller => {
  const profile = getProfile(seller);
  return profile.displayName || [profile.firstName, profile.lastName].filter(Boolean).join(' ');
};

const getInitials = seller => {
  const profile = getProfile(seller);
  const displayName = getDisplayName(seller);
  return (
    profile.abbreviatedName ||
    displayName
      .match(/\b\w/g)
      ?.join('')
      .slice(0, 2) ||
    ''
  );
};

const getProfessionalTitle = seller => {
  const profile = getProfile(seller);
  return getPublicData(seller).professionalTitle || profile.bio || '';
};

const getArrayField = (seller, key) => {
  const value = getPublicData(seller)[key];
  return Array.isArray(value) ? value.filter(Boolean) : [];
};

const getRating = seller => {
  const rating = Number.parseInt(getPublicData(seller).rating, 10);
  return Number.isFinite(rating) ? Math.max(0, Math.min(rating, 5)) : 5;
};

const SellerImage = props => {
  const { seller, displayName } = props;
  const profileImage = seller?.profileImage;
  const avatarUrl = getPublicData(seller).avatarUrl;

  if (profileImage?.id) {
    return (
      <ResponsiveImage
        rootClassName={css.sellerImage}
        alt={displayName}
        image={profileImage}
        variants={SEARCH_PROFILE_IMAGE_VARIANTS}
        sizes="(max-width: 767px) calc(100vw - 48px), 52vw"
      />
    );
  }

  if (avatarUrl) {
    return <img className={css.sellerImage} src={avatarUrl} alt={displayName} loading="lazy" />;
  }

  return <div className={css.imageFallback}>{getInitials(seller)}</div>;
};

const SellerRating = props => {
  const { rating, displayName } = props;
  const stars = Array.from({ length: rating }, (_, index) => index);

  return (
    <div className={css.rating} aria-label={`${displayName} rating ${rating} out of 5`}>
      {stars.map(index => (
        <IconReviewStar key={index} isFilled className={css.ratingStar} />
      ))}
    </div>
  );
};

const PillList = props => {
  const { seller, displayName } = props;
  const expertise = getArrayField(seller, 'expertise');
  const languages = getArrayField(seller, 'languages');
  const productTypes = getArrayField(seller, 'productTypes');
  const pills = [
    ...expertise.map(label => ({ label, type: 'expertise' })),
    ...languages.map(label => ({ label, type: 'language' })),
    ...productTypes.map(label => ({ label, type: 'product' })),
  ];

  return pills.length > 0 ? (
    <ul className={css.pills} aria-label={`${displayName} details`}>
      {pills.map(({ label, type }) => (
        <li key={`${type}-${label}`} className={classNames(css.pill, css[type])}>
          {label}
        </li>
      ))}
    </ul>
  ) : null;
};

const ProfileCta = props => {
  const { seller, displayName } = props;
  const canNavigate = !isMockSeller(seller) && seller?.id?.uuid;
  const content = 'View profile';

  return canNavigate ? (
    <NamedLink
      className={css.profileButton}
      name="ProfilePage"
      params={{ id: seller.id.uuid }}
      ariaLabel={`View ${displayName} profile`}
    >
      {content}
    </NamedLink>
  ) : (
    <span className={css.profileButton}>{content}</span>
  );
};

const MobileProfileArrow = props => {
  const { seller, displayName } = props;
  const canNavigate = !isMockSeller(seller) && seller?.id?.uuid;
  const content = <IconArrowUp className={css.arrowIcon} />;

  return canNavigate ? (
    <NamedLink
      className={css.mobileProfileLink}
      name="ProfilePage"
      params={{ id: seller.id.uuid }}
      ariaLabel={`View ${displayName} profile`}
    >
      {content}
    </NamedLink>
  ) : (
    <span className={css.mobileProfileLink}>{content}</span>
  );
};

const SellerCard = props => {
  const { seller } = props;
  const displayName = getDisplayName(seller);
  const professionalTitle = getProfessionalTitle(seller);
  const rating = getRating(seller);

  return (
    <article className={css.sellerCard} aria-label={displayName}>
      <div className={css.imageWrapper}>
        <SellerImage seller={seller} displayName={displayName} />
        <SellerRating rating={rating} displayName={displayName} />
      </div>
      <div className={css.cardContent}>
        <div className={css.mobileTitleRow}>
          <h2 className={css.sellerName}>{displayName}</h2>
          <MobileProfileArrow seller={seller} displayName={displayName} />
        </div>
        {professionalTitle ? <p className={css.sellerTitle}>{professionalTitle}</p> : null}
        <PillList seller={seller} displayName={displayName} />
        <div className={css.desktopCta}>
          <ProfileCta seller={seller} displayName={displayName} />
        </div>
      </div>
    </article>
  );
};

/**
 * SearchResultsPanel component
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.rootClassName] - Custom class that extends the default class for the root element
 * @param {Array<Object>} props.sellers - The seller users
 * @returns {JSX.Element}
 */
const SearchResultsPanel = props => {
  const {
    className,
    rootClassName,
    sellers,
    listings = [],
    pagination,
    search,
    setActiveListing,
    isMapVariant = true,
    listingTypeParam,
    intl,
  } = props;
  const classes = classNames(rootClassName || css.root, className);
  const hasSellerResults = Array.isArray(sellers);

  if (!hasSellerResults) {
    const paginationLinks =
      pagination && pagination.totalPages > 1 ? (
        <PaginationLinks
          className={css.pagination}
          pageName={listingTypeParam ? 'SearchPageWithListingType' : 'SearchPageForCourses'}
          pagePathParams={listingTypeParam ? { listingType: listingTypeParam } : {}}
          pageSearchParams={search}
          pagination={pagination}
          aria-label={intl.formatMessage({ id: 'SearchResultsPanel.screenreader.pagination' })}
        />
      ) : null;

    const cardRenderSizes = isMapVariant => {
      if (isMapVariant) {
        const panelMediumWidth = 50;
        const panelLargeWidth = 62.5;
        return [
          '(max-width: 767px) 100vw',
          `(max-width: 1023px) ${panelMediumWidth}vw`,
          `(max-width: 1920px) ${panelLargeWidth / 2}vw`,
          `${panelLargeWidth / 3}vw`,
        ].join(', ');
      } else {
        const panelMediumWidth = 50;
        const panelLargeWidth = 62.5;
        return [
          '(max-width: 549px) 100vw',
          '(max-width: 767px) 50vw',
          `(max-width: 1439px) 26vw`,
          `(max-width: 1920px) 18vw`,
          `14vw`,
        ].join(', ');
      }
    };

    return (
      <div className={classes}>
        <ul className={isMapVariant ? css.listingCardsMapVariant : css.listingCards}>
          {listings.map(l => (
            <li key={l.id.uuid} className={css.resultItem}>
              <ListingCard
                className={css.listingCard}
                listing={l}
                renderSizes={cardRenderSizes(isMapVariant)}
                setActiveListing={setActiveListing}
                cardVariant="course"
              />
            </li>
          ))}
          {props.children}
        </ul>
        {paginationLinks}
      </div>
    );
  }

  return (
    <div className={classes}>
      <ul className={css.sellerCards}>
        {sellers.map(seller => (
          <li key={seller.id.uuid} className={css.resultItem}>
            <SellerCard seller={seller} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchResultsPanel;
