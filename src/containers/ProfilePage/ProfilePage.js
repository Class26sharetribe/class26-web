import React, { useEffect, useState } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames';

import { useConfiguration } from '../../context/configurationContext';
import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { REVIEW_TYPE_OF_PROVIDER, REVIEW_TYPE_OF_CUSTOMER, propTypes } from '../../util/types';
import {
  NO_ACCESS_PAGE_USER_PENDING_APPROVAL,
  NO_ACCESS_PAGE_VIEW_LISTINGS,
  PROFILE_PAGE_PENDING_APPROVAL_VARIANT,
} from '../../util/urlHelpers';
import {
  isErrorNoViewingPermission,
  isErrorUserPendingApproval,
  isForbiddenError,
  isNotFoundError,
} from '../../util/errors';
import {
  getDetailCustomFieldValue,
  getFieldValue,
  pickCustomFieldProps,
} from '../../util/fieldHelpers';
import {
  getCurrentUserTypeRoles,
  hasPermissionToViewData,
  isUserAuthorized,
} from '../../util/userHelpers';
import { richText } from '../../util/richText';

import { isScrollingDisabled } from '../../ducks/ui.duck';
import { getMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import {
  Heading,
  H4,
  Page,
  AvatarLarge,
  NamedLink,
  ListingCard,
  ButtonTabNavHorizontal,
  NamedRedirect,
  CustomExtendedDataSection,
  LayoutSingleColumn,
} from '../../components';

import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';
import NotFoundPage from '../../containers/NotFoundPage/NotFoundPage';
import {
  linkedinFieldIcon as LinkedinFieldIcon,
  instagramFieldIcon as InstagramFieldIcon,
  xFieldIcon as XFieldIcon,
  youtubeFieldIcon as YoutubeFieldIcon,
  websiteFieldIcon as WebsiteFieldIcon,
} from '../PageBuilder/Primitives/Link/Icons';

import ProfileReviews from './ProfileReviews/ProfileReviews';
import { getProfileReviewsForDisplay } from './ProfileReviews/profileReviewsData';
import {
  asStringList,
  buildSocialUrl,
  findCategoryName,
  resolveEnumLabels,
} from './ProfilePage.helper';
import css from './ProfilePage.module.css';

const MAX_MOBILE_SCREEN_WIDTH = 768;
/** Set to false when live profile reviews should replace demo cards. */
const USE_DEMO_PROFILE_REVIEWS = false;
const MIN_LENGTH_FOR_LONG_WORDS = 20;

const PERSONAL_AREA_PROFILE_TAB = 'profile';
const PERSONAL_AREA_ACCOUNT_SETTINGS_TAB = 'account-settings';

const ProfileSocialLinksRow = props => {
  const { socialLinks, intl, rootClassName } = props;
  const entries = [
    { key: 'linkedin', Icon: LinkedinFieldIcon },
    { key: 'instagram', Icon: InstagramFieldIcon },
    { key: 'twitter', Icon: XFieldIcon },
    { key: 'youtube', Icon: YoutubeFieldIcon },
    { key: 'website', Icon: WebsiteFieldIcon },
  ];

  return (
    <div className={rootClassName}>
      {entries.map(({ key, Icon }) => {
        const href = buildSocialUrl(key, socialLinks?.[key]);
        if (!href) {
          return null;
        }
        const label = intl.formatMessage({ id: `ProfilePage.socialLink.${key}` });
        return (
          <a
            key={key}
            className={css.profileSocialLink}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
          >
            <span className={css.profileSocialIconWrap} aria-hidden="true">
              <Icon />
            </span>
          </a>
        );
      })}
    </div>
  );
};

/**
 * Profile hero: customer layout (photo left) vs provider layout (content left, photo right).
 * Bio and social URLs align with ProfileSettingsForm / publicData.
 *
 * @component
 */
export const AsideContent = props => {
  const {
    user,
    displayName,
    showLinkToProfileSettingsPage,
    userTypeRoles,
    bio,
    publicData,
    userFieldConfig,
    categoryConfiguration,
    intl,
    showProfileLiveStatus,
  } = props;

  const isProviderLayout = userTypeRoles?.provider === true;
  const { languages: languageIds = [], socialLinks = {}, primaryExpertise } = publicData || {};
  const hasBio = !!bio;
  const bioWithLinks = richText(bio, {
    linkify: true,
    longWordMinLength: MIN_LENGTH_FOR_LONG_WORDS,
    longWordClass: css.longWord,
  });

  const categories = categoryConfiguration?.categories || [];
  const expertiseLabel = findCategoryName(categories, primaryExpertise);
  const expertise = expertiseLabel ? [expertiseLabel] : [];
  const languages = resolveEnumLabels(userFieldConfig, 'languages', asStringList(languageIds));
  const hasBadges = expertise.length > 0 || languages.length > 0;

  const nameMaybe =
    displayName != null && String(displayName).trim() !== '' ? (
      <h1 className={css.profileHeroName}>{displayName}</h1>
    ) : null;

  const bioMaybe = hasBio ? <div className={css.profileHeroBio}>{bioWithLinks}</div> : null;

  const socialRow = (
    <ProfileSocialLinksRow
      socialLinks={socialLinks}
      intl={intl}
      rootClassName={css.profileSocialRow}
    />
  );

  if (isProviderLayout) {
    return (
      <div className={classNames(css.profileHero, css.profileHeroProvider)}>
        <div className={css.profileHeroProviderMain}>
          <div className={css.profileHeroProviderTitleRow}>{nameMaybe}</div>
          {hasBadges ? (
            <ul className={css.profileBadgeList}>
              {expertise.map(label => (
                <li
                  key={`e-${label}`}
                  className={classNames(css.profileBadge, css.profileBadgeExpertise)}
                >
                  {label}
                </li>
              ))}
              {languages.map(label => (
                <li
                  key={`l-${label}`}
                  className={classNames(css.profileBadge, css.profileBadgeLanguage)}
                >
                  {label}
                </li>
              ))}
            </ul>
          ) : null}
          {bioMaybe}
          {socialRow}
        </div>
        <div className={css.profileHeroProviderPhoto}>
          <AvatarLarge className={css.profileHeroAvatarProvider} user={user} disableProfileLink />
        </div>
      </div>
    );
  }

  return (
    <div className={classNames(css.profileHero, css.profileHeroCustomer)}>
      <div className={css.profileHeroCustomerPhoto}>
        <AvatarLarge className={css.profileHeroAvatarCustomer} user={user} disableProfileLink />
      </div>
      <div className={css.profileHeroCustomerMain}>
        <div className={css.profileHeroCustomerTitleRow}>{nameMaybe}</div>
        {showProfileLiveStatus ? (
          <p className={css.profileHeroStatus}>
            <span className={css.profileHeroStatusDot} aria-hidden="true" />
            <FormattedMessage
              id="ProfilePage.profileLiveStatus"
              values={{
                settingsLink: (
                  <NamedLink
                    className={css.profileHeroStatusLink}
                    name="PersonalAreaPage"
                    params={{ tab: PERSONAL_AREA_ACCOUNT_SETTINGS_TAB }}
                  >
                    <FormattedMessage id="ProfilePage.profileLiveStatusSettingsLink" />
                  </NamedLink>
                ),
              }}
            />
          </p>
        ) : null}
        {bioMaybe}
        {socialRow}
      </div>
    </div>
  );
};

export const ReviewsErrorMaybe = props => {
  const { queryReviewsError } = props;
  return queryReviewsError ? (
    <p className={css.error}>
      <FormattedMessage id="ProfilePage.loadingReviewsFailed" />
    </p>
  ) : null;
};

export const MobileReviews = props => {
  const { reviews, queryReviewsError, useDemoReviews = false } = props;
  const reviewsOfProvider = reviews.filter(r => r.attributes.type === REVIEW_TYPE_OF_PROVIDER);
  const reviewsOfCustomer = reviews.filter(r => r.attributes.type === REVIEW_TYPE_OF_CUSTOMER);
  const providerReviewsForDisplay = getProfileReviewsForDisplay(reviewsOfProvider, {
    useDemoReviews,
  });
  const customerReviewsForDisplay = getProfileReviewsForDisplay(reviewsOfCustomer, {
    useDemoReviews,
  });

  return (
    <div className={css.mobileReviews}>
      <H4 as="h2" className={css.mobileReviewsTitle}>
        <FormattedMessage
          id="ProfilePage.reviewsFromMyCustomersTitle"
          values={{ count: providerReviewsForDisplay.length }}
        />
      </H4>
      <ReviewsErrorMaybe queryReviewsError={queryReviewsError} />
      <ProfileReviews reviews={reviewsOfProvider} useDemoReviews={useDemoReviews} />
      <H4 as="h2" className={css.mobileReviewsTitle}>
        <FormattedMessage
          id="ProfilePage.reviewsAsACustomerTitle"
          values={{ count: customerReviewsForDisplay.length }}
        />
      </H4>
      <ReviewsErrorMaybe queryReviewsError={queryReviewsError} />
      <ProfileReviews reviews={reviewsOfCustomer} useDemoReviews={useDemoReviews} />
    </div>
  );
};

export const DesktopReviews = props => {
  const { reviews, queryReviewsError, userTypeRoles, intl, useDemoReviews = false } = props;
  const { customer: isCustomerUserType, provider: isProviderUserType } = userTypeRoles;

  const initialReviewState = !isProviderUserType
    ? REVIEW_TYPE_OF_CUSTOMER
    : REVIEW_TYPE_OF_PROVIDER;
  const [showReviewsType, setShowReviewsType] = useState(initialReviewState);

  const reviewsOfProvider = reviews.filter(r => r.attributes.type === REVIEW_TYPE_OF_PROVIDER);
  const reviewsOfCustomer = reviews.filter(r => r.attributes.type === REVIEW_TYPE_OF_CUSTOMER);
  const providerReviewsForDisplay = getProfileReviewsForDisplay(reviewsOfProvider, {
    useDemoReviews,
  });
  const customerReviewsForDisplay = getProfileReviewsForDisplay(reviewsOfCustomer, {
    useDemoReviews,
  });
  const isReviewTypeProviderSelected = showReviewsType === REVIEW_TYPE_OF_PROVIDER;
  const isReviewTypeCustomerSelected = showReviewsType === REVIEW_TYPE_OF_CUSTOMER;
  const providerReviewsMaybe = isProviderUserType
    ? [
        {
          text: (
            <Heading as="h3" rootClassName={css.desktopReviewsTitle}>
              <FormattedMessage
                id="ProfilePage.reviewsFromMyCustomersTitle"
                values={{ count: providerReviewsForDisplay.length }}
              />
            </Heading>
          ),
          selected: isReviewTypeProviderSelected,
          onClick: () => setShowReviewsType(REVIEW_TYPE_OF_PROVIDER),
        },
      ]
    : [];

  const customerReviewsMaybe = isCustomerUserType
    ? [
        {
          text: (
            <Heading as="h3" rootClassName={css.desktopReviewsTitle}>
              <FormattedMessage
                id="ProfilePage.reviewsAsACustomerTitle"
                values={{ count: customerReviewsForDisplay.length }}
              />
            </Heading>
          ),
          selected: isReviewTypeCustomerSelected,
          onClick: () => setShowReviewsType(REVIEW_TYPE_OF_CUSTOMER),
        },
      ]
    : [];
  const desktopReviewTabs = [...providerReviewsMaybe, ...customerReviewsMaybe];

  return (
    <div className={css.desktopReviews}>
      <div className={css.desktopReviewsWrapper}>
        <ButtonTabNavHorizontal
          className={css.desktopReviewsTabNav}
          tabs={desktopReviewTabs}
          ariaLabel={intl.formatMessage({ id: 'ProfilePage.screenreader.reviewsNav' })}
        />

        <ReviewsErrorMaybe queryReviewsError={queryReviewsError} />

        {isReviewTypeProviderSelected ? (
          <ProfileReviews reviews={reviewsOfProvider} useDemoReviews={useDemoReviews} />
        ) : (
          <ProfileReviews reviews={reviewsOfCustomer} useDemoReviews={useDemoReviews} />
        )}
      </div>
    </div>
  );
};

export const CustomUserFields = props => {
  const { publicData, metadata, userFieldConfig, intl, omitFieldKeys = [] } = props;

  const shouldPickUserField = fieldConfig =>
    ['public', 'metadata'].includes(fieldConfig?.scope) &&
    fieldConfig?.showConfig?.displayInProfile !== false;
  const propsForCustomFields =
    pickCustomFieldProps(
      { publicData, metadata },
      userFieldConfig,
      'userType',
      shouldPickUserField
    ) || [];

  const pickUserFields = (filteredConfigs, config) => {
    const { key, schemaType, enumOptions, userTypeConfig = {}, showConfig = {} } = config;
    const { limitToUserTypeIds, userTypeIds } = userTypeConfig;
    const userType = publicData.userType;
    const isTargetUserType = !limitToUserTypeIds || userTypeIds.includes(userType);

    const { label, displayInProfile } = showConfig;
    if (omitFieldKeys.includes(key)) {
      return filteredConfigs;
    }
    const publicDataValue = getFieldValue(publicData, key);
    const metadataValue = getFieldValue(metadata, key);
    const value = publicDataValue !== null ? publicDataValue : metadataValue;

    if (displayInProfile && isTargetUserType && value !== null) {
      const detailValue = getDetailCustomFieldValue(
        enumOptions,
        value,
        schemaType,
        key,
        label,
        intl,
        'ProfilePage'
      );

      return detailValue ? filteredConfigs.concat(detailValue) : filteredConfigs;
    }
    return filteredConfigs;
  };
  const sectionDetailsProps = {
    ...props,
    fieldConfigs: userFieldConfig,
    heading: 'ProfilePage.detailsTitle',
    rootClassName: css.userFieldSection,
  };

  return (
    <CustomExtendedDataSection
      sectionDetailsProps={sectionDetailsProps}
      propsForCustomFields={propsForCustomFields}
      idPrefix="profilePage"
      pickExtendedDataFields={pickUserFields}
      rootClassName={css.userFieldSection}
    />
  );
};

export const MainContent = props => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    userShowError,
    bio,
    displayName,
    listings,
    queryListingsError,
    reviews = [],
    queryReviewsError,
    publicData,
    metadata,
    userFieldConfig,
    intl,
    hideReviews,
    userTypeRoles,
  } = props;

  const isProviderProfile = userTypeRoles?.provider === true;
  const customFieldOmitKeys = isProviderProfile ? ['expertise', 'languages'] : [];

  const hasListings = listings.length > 0;
  const hasMatchMedia = typeof window !== 'undefined' && window?.matchMedia;
  const isMobileLayout =
    mounted && hasMatchMedia
      ? window.matchMedia(`(max-width: ${MAX_MOBILE_SCREEN_WIDTH}px)`)?.matches
      : true;

  const hasBio = !!bio;

  const listingsContainerClasses = classNames(css.listingsContainer, {
    [css.withBioMissingAbove]: !hasBio,
  });

  if (userShowError || queryListingsError) {
    return (
      <p className={css.error}>
        <FormattedMessage id="ProfilePage.loadingDataFailed" />
      </p>
    );
  }
  return (
    <div>
      {/* {displayName ? (
        <CustomUserFields
          publicData={publicData}
          metadata={metadata}
          userFieldConfig={userFieldConfig}
          intl={intl}
          omitFieldKeys={customFieldOmitKeys}
        />
      ) : null} */}

      {hideReviews || !isProviderProfile ? null : isMobileLayout ? (
        <MobileReviews
          reviews={reviews}
          queryReviewsError={queryReviewsError}
          useDemoReviews={USE_DEMO_PROFILE_REVIEWS}
        />
      ) : (
        <DesktopReviews
          reviews={reviews}
          queryReviewsError={queryReviewsError}
          userTypeRoles={userTypeRoles}
          intl={intl}
          useDemoReviews={USE_DEMO_PROFILE_REVIEWS}
        />
      )}

      {hasListings ? (
        <div className={listingsContainerClasses}>
          <H4 as="h2" className={css.listingsTitle}>
            My Classes
          </H4>
          <ul className={css.listings}>
            {listings.map(l => (
              <li className={css.listing} key={l.id.uuid}>
                <ListingCard listing={l} showAuthorInfo={false} cardVariant="course" />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

/**
 * ProfilePageComponent
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.scrollingDisabled - Whether the scrolling is disabled
 * @param {propTypes.currentUser} props.currentUser - The current user
 * @param {boolean} props.useCurrentUser - Whether to use the current user
 * @param {propTypes.user|propTypes.currentUser} props.user - The user
 * @param {propTypes.error} props.userShowError - The user show error
 * @param {propTypes.error} props.queryListingsError - The query listings error
 * @param {Array<propTypes.listing|propTypes.ownListing>} props.listings - The listings
 * @param {Array<propTypes.review>} props.reviews - The reviews
 * @param {propTypes.error} props.queryReviewsError - The query reviews error
 * @returns {JSX.Element} ProfilePageComponent
 */
export const ProfilePageComponent = props => {
  const config = useConfiguration();
  const intl = useIntl();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    scrollingDisabled,
    params: pathParams,
    currentUser,
    useCurrentUser,
    userShowError,
    user,
    ...rest
  } = props;
  const isVariant = pathParams.variant?.length > 0;
  const isPreview = isVariant && pathParams.variant === PROFILE_PAGE_PENDING_APPROVAL_VARIANT;

  // Stripe's onboarding needs a business URL for each seller, but the profile page can be
  // too empty for the provider at the time they are creating their first listing.
  // To remedy the situation, we redirect Stripe's crawler to the landing page of the marketplace.
  // TODO: When there's more content on the profile page, we should consider by-passing this redirection.
  const searchParams = rest?.location?.search;
  const isStorefront = searchParams
    ? new URLSearchParams(searchParams)?.get('mode') === 'storefront'
    : false;
  if (isStorefront) {
    return <NamedRedirect name="LandingPage" />;
  }

  const isCurrentUser = currentUser?.id && currentUser?.id?.uuid === pathParams.id;
  const profileUser = useCurrentUser ? currentUser : user;
  const { bio, displayName, publicData, metadata } = profileUser?.attributes?.profile || {};
  const { userFields } = config.user;
  const isPrivateMarketplace = config.accessControl.marketplace.private === true;
  const isUnauthorizedUser = currentUser && !isUserAuthorized(currentUser);
  const isUnauthorizedOnPrivateMarketplace = isPrivateMarketplace && isUnauthorizedUser;
  const hasUserPendingApprovalError = isErrorUserPendingApproval(userShowError);
  const hasNoViewingRightsUser = currentUser && !hasPermissionToViewData(currentUser);
  const hasNoViewingRightsOnPrivateMarketplace = isPrivateMarketplace && hasNoViewingRightsUser;

  const userTypeRoles = getCurrentUserTypeRoles(config, profileUser);

  const isDataLoaded = isPreview
    ? currentUser != null || userShowError != null
    : hasNoViewingRightsOnPrivateMarketplace
    ? currentUser != null || userShowError != null
    : user != null || userShowError != null;

  const schemaTitleVars = { name: displayName, marketplaceName: config.marketplaceName };
  const schemaTitle = intl.formatMessage({ id: 'ProfilePage.schemaTitle' }, schemaTitleVars);

  if (!isDataLoaded) {
    return null;
  } else if (!isPreview && isNotFoundError(userShowError)) {
    return <NotFoundPage staticContext={props.staticContext} />;
  } else if (!isPreview && (isUnauthorizedOnPrivateMarketplace || hasUserPendingApprovalError)) {
    return (
      <NamedRedirect
        name="NoAccessPage"
        params={{ missingAccessRight: NO_ACCESS_PAGE_USER_PENDING_APPROVAL }}
      />
    );
  } else if (
    (!isPreview && hasNoViewingRightsOnPrivateMarketplace && !isCurrentUser) ||
    isErrorNoViewingPermission(userShowError)
  ) {
    // Someone without viewing rights on a private marketplace is trying to
    // view a profile page that is not their own – redirect to NoAccessPage
    return (
      <NamedRedirect
        name="NoAccessPage"
        params={{ missingAccessRight: NO_ACCESS_PAGE_VIEW_LISTINGS }}
      />
    );
  } else if (!isPreview && isForbiddenError(userShowError)) {
    // This can happen if private marketplace mode is active, but it's not reflected through asset yet.
    return (
      <NamedRedirect
        name="SignupPage"
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  } else if (isPreview && mounted && !isCurrentUser) {
    // Someone is manipulating the URL, redirect to current user's profile page.
    return isCurrentUser === false ? (
      <NamedRedirect name="ProfilePage" params={{ id: currentUser?.id?.uuid }} />
    ) : null;
  } else if ((isPreview || isPrivateMarketplace) && !mounted) {
    // This preview of the profile page is not rendered on server-side
    // and the first pass on client-side should render the same UI.
    return null;
  }
  // This is rendering normal profile page (not preview for pending-approval)
  const showProfileLiveStatus =
    mounted && isCurrentUser && isUserAuthorized(currentUser) && userTypeRoles?.provider !== true;

  return (
    <Page
      scrollingDisabled={scrollingDisabled}
      title={schemaTitle}
      schema={{
        '@context': 'http://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
          '@type': 'Person',
          name: profileUser?.attributes?.profile?.displayName,
        },
        name: schemaTitle,
      }}
      className={css.profilePage}
    >
      <LayoutSingleColumn topbar={<TopbarContainer />} footer={<FooterContainer />}>
        <AsideContent
          user={profileUser}
          showLinkToProfileSettingsPage={mounted && isCurrentUser}
          userFieldConfig={userFields}
          categoryConfiguration={config.categoryConfiguration}
          displayName={displayName}
          userTypeRoles={userTypeRoles}
          bio={bio}
          publicData={publicData}
          intl={intl}
          showProfileLiveStatus={showProfileLiveStatus}
        />
        <MainContent
          bio={bio}
          displayName={displayName}
          userShowError={userShowError}
          publicData={publicData}
          metadata={metadata}
          userFieldConfig={userFields}
          hideReviews={hasNoViewingRightsOnPrivateMarketplace}
          intl={intl}
          userTypeRoles={userTypeRoles}
          {...rest}
        />
      </LayoutSingleColumn>
    </Page>
  );
};

const mapStateToProps = state => {
  const { currentUser } = state.user;
  const {
    userId,
    userShowError,
    queryListingsError,
    userListingRefs,
    reviews = [],
    queryReviewsError,
  } = state.ProfilePage;
  const userMatches = getMarketplaceEntities(state, [{ type: 'user', id: userId }]);
  const user = userMatches.length === 1 ? userMatches[0] : null;

  // Show currentUser's data if it's not approved yet
  const isCurrentUser = userId?.uuid === currentUser?.id?.uuid;
  const useCurrentUser =
    isCurrentUser && !(isUserAuthorized(currentUser) && hasPermissionToViewData(currentUser));

  return {
    scrollingDisabled: isScrollingDisabled(state),
    currentUser,
    useCurrentUser,
    user,
    userShowError,
    queryListingsError,
    listings: getMarketplaceEntities(state, userListingRefs),
    reviews,
    queryReviewsError,
  };
};

const ProfilePage = compose(connect(mapStateToProps))(ProfilePageComponent);

export default ProfilePage;
