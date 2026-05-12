import React, { useRef } from 'react';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../util/reactIntl';

import { ErrorMessage, IconSpinner, NamedLink, ResponsiveImage } from '../../components';

import css from './SectionSellerCarousel.module.css';

const PROFILE_IMAGE_VARIANTS = [
  'seller-landing-card',
  'seller-landing-card-2x',
  'square-xsmall',
  'square-xsmall2x',
  'square-small',
  'square-small2x',
];

const isMockSeller = seller => seller?.id?.uuid?.startsWith('mock-seller-');

const getProfile = seller => seller?.attributes?.profile || {};

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

const getPills = seller => {
  const publicData = getProfile(seller).publicData || {};
  const expertise = Array.isArray(publicData.expertise) ? publicData.expertise : [];
  const languages = Array.isArray(publicData.languages) ? publicData.languages : [];
  const primaryExpertise = expertise.length > 0 ? [expertise[expertise.length - 1]] : [];

  return [...primaryExpertise, ...languages].filter(Boolean).slice(0, 3);
};

const SellerImage = props => {
  const { seller, displayName } = props;
  const publicData = getProfile(seller).publicData || {};
  const profileImage = seller?.profileImage;
  const avatarUrl = publicData.avatarUrl;

  if (profileImage?.id) {
    return (
      <ResponsiveImage
        rootClassName={css.cardImage}
        alt={displayName}
        image={profileImage}
        variants={PROFILE_IMAGE_VARIANTS}
        sizes="(max-width: 767px) 82vw, 31vw"
      />
    );
  }

  if (avatarUrl) {
    return <img className={css.cardImage} src={avatarUrl} alt={displayName} loading="lazy" />;
  }

  return <div className={css.imageFallback}>{getInitials(seller)}</div>;
};

const SellerCardContent = props => {
  const { seller } = props;
  const profile = getProfile(seller);
  const publicData = profile.publicData || {};
  const displayName = getDisplayName(seller);
  const professionalTitle = publicData.professionalTitle || profile.bio;
  const pills = getPills(seller);

  return (
    <>
      <SellerImage seller={seller} displayName={displayName} />
      <div className={css.cardShade} />
      <div className={css.cardContent}>
        <h3 className={css.cardTitle}>{displayName}</h3>
        {professionalTitle ? <p className={css.cardSubtitle}>{professionalTitle}</p> : null}
        {pills.length > 0 ? (
          <ul className={css.pills} aria-label={`${displayName} details`}>
            {pills.map(pill => (
              <li key={pill} className={css.pill}>
                {pill}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </>
  );
};

const SellerCard = props => {
  const { seller } = props;
  const displayName = getDisplayName(seller);
  const cardClasses = classNames(css.card, { [css.mockCard]: isMockSeller(seller) });

  if (!isMockSeller(seller) && seller?.id?.uuid) {
    return (
      <NamedLink
        className={cardClasses}
        name="ProfilePage"
        params={{ id: seller.id.uuid }}
        ariaLabel={displayName}
      >
        <SellerCardContent seller={seller} />
      </NamedLink>
    );
  }

  return (
    <article className={cardClasses} aria-label={displayName}>
      <SellerCardContent seller={seller} />
    </article>
  );
};

const SectionSellerCarousel = props => {
  const { sellers = [], inProgress, error } = props;
  const intl = useIntl();
  const sliderRef = useRef(null);

  const hasSellers = sellers.length > 0;
  const showCenteredStatus = !hasSellers && (inProgress || error);

  const onSlide = direction => {
    const slider = sliderRef.current;
    const firstItem = slider?.firstElementChild;
    if (!slider || !firstItem) {
      return;
    }

    const itemWidth = firstItem.getBoundingClientRect().width;
    slider.scrollLeft += direction * itemWidth;
  };

  return (
    <section id="landing-sellers" className={css.root}>
      <header className={css.header}>
        <h2 className={css.title}>
          <FormattedMessage id="SectionSellerCarousel.title" />
        </h2>
        <p className={css.description}>
          <FormattedMessage id="SectionSellerCarousel.description" />
        </p>
      </header>

      <div className={css.carouselOuter}>
        {showCenteredStatus ? (
          <div className={css.centeredStatus}>
            {inProgress ? (
              <>
                <IconSpinner />
                <span className={css.loadingText}>
                  <FormattedMessage id="SectionSellerCarousel.loading" />
                </span>
              </>
            ) : (
              <>
                <p className={css.errorTitle}>
                  <FormattedMessage id="SectionSellerCarousel.error" />
                </p>
                <ErrorMessage error={error} />
              </>
            )}
          </div>
        ) : (
          <>
            <div
              className={classNames(css.carouselArrows, {
                [css.notEnoughSellers]: sellers.length <= 3,
              })}
            >
              <button
                className={classNames(css.carouselArrow, css.carouselArrowPrev)}
                type="button"
                onClick={() => onSlide(-1)}
                aria-label={intl.formatMessage({ id: 'SectionSellerCarousel.previous' })}
              >
                ‹
              </button>
              <button
                className={classNames(css.carouselArrow, css.carouselArrowNext)}
                type="button"
                onClick={() => onSlide(1)}
                aria-label={intl.formatMessage({ id: 'SectionSellerCarousel.next' })}
              >
                ›
              </button>
            </div>
            {hasSellers ? (
              <ul className={css.carousel} ref={sliderRef} role="list">
                {sellers.map(seller => (
                  <li key={seller.id.uuid} className={css.listItem}>
                    <SellerCard seller={seller} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className={css.emptyMessage}>
                <FormattedMessage id="SectionSellerCarousel.noSellers" />
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default SectionSellerCarousel;
