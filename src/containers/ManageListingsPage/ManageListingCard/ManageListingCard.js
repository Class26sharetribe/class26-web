import React from 'react';
import classNames from 'classnames';

import { useConfiguration } from '../../../context/configurationContext';
import { useIntl, FormattedMessage } from '../../../util/reactIntl';
import {
  LISTING_STATE_CLOSED,
  LISTING_STATE_DRAFT,
  LISTING_STATE_PENDING_APPROVAL,
  LISTING_STATE_PUBLISHED,
  propTypes,
} from '../../../util/types';
import { ensureOwnListing } from '../../../util/data';
import {
  LISTING_PAGE_DRAFT_VARIANT,
  LISTING_PAGE_PENDING_APPROVAL_VARIANT,
  LISTING_PAGE_PARAM_TYPE_DRAFT,
  LISTING_PAGE_PARAM_TYPE_EDIT,
  createSlug,
} from '../../../util/urlHelpers';

import {
  AspectRatioWrapper,
  IconSpinner,
  InlineTextButton,
  ListingCardThumbnail,
  NamedLink,
  ResponsiveImage,
} from '../../../components';

import css from './ManageListingCard.module.css';

const MAX_LENGTH_FOR_WORDS_IN_TITLE = 7;

/**
 * Splits a title to break long words into spans.
 */
export const formatTitle = (title, maxLength) => {
  const nonWhiteSpaceSequence = /([^\s]+)/gi;
  return title.split(nonWhiteSpaceSequence).map((word, index) => {
    return word.length > maxLength ? (
      <span key={index} style={{ wordBreak: 'break-all' }}>
        {word}
      </span>
    ) : (
      word
    );
  });
};

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const BookmarkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CoinsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12.4387 19.1601C11.4361 19.5412 10.0849 19.7779 8.58832 19.7779C5.50245 19.7779 3.00112 18.7834 3 17.5556V4.22225C3.00224 2.99557 5.50357 2 8.58832 2C11.6731 2 14.1766 2.99445 14.1755 4.22225M3 4.22225C3 5.45004 5.50133 6.44449 8.58832 6.44449C11.6753 6.44449 14.1766 5.45004 14.1766 4.22225L14.1766 12.8445M3.00112 8.66672C3.00112 9.89451 5.50245 10.889 8.58944 10.889C11.6764 10.889 14.1778 9.89451 14.1778 8.66672M12.5057 14.6946C11.4976 15.0891 10.115 15.3335 8.58832 15.3335C5.50245 15.3335 3.00112 14.3391 3.00112 13.1113M20.5272 13.4646C22.4909 15.4169 22.4909 18.5836 20.5272 20.5358C18.5635 22.4881 15.3781 22.4881 13.4144 20.5358C11.4507 18.5836 11.4507 15.4169 13.4144 13.4646C15.3781 11.5124 18.5635 11.5124 20.5272 13.4646Z" stroke="#006647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  
);

const ViewListingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7 17L17 7M17 17V7H7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.43741 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Manage listing card — horizontal layout with image, stats, and state-aware actions.
 *
 * @param {Object} props
 * @param {propTypes.ownListing} props.listing
 * @param {string} [props.renderSizes]
 * @param {function} props.onCloseListing
 * @param {function} props.onOpenListing
 * @param {function} props.onDiscardDraft
 * @param {Object} [props.actionsInProgressListingId]
 * @param {boolean} props.hasClosingError
 * @param {boolean} props.hasOpeningError
 * @param {boolean} props.hasDiscardingError
 * @param {Object} [props.stats]
 * @param {boolean} [props.statsUnavailable]
 * @returns {JSX.Element}
 */
export const ManageListingCard = props => {
  const config = useConfiguration();
  const intl = useIntl();
  const {
    className,
    rootClassName,
    listing,
    renderSizes,
    onCloseListing,
    onOpenListing,
    onDiscardDraft,
    actionsInProgressListingId,
    hasClosingError,
    hasOpeningError,
    hasDiscardingError,
    stats = {},
    statsUnavailable = false,
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const currentListing = ensureOwnListing(listing);
  const id = currentListing.id.uuid;
  const { title = '', state, publicData } = currentListing.attributes;
  const slug = createSlug(title);
  const isDraft = state === LISTING_STATE_DRAFT;
  const isPending = state === LISTING_STATE_PENDING_APPROVAL;
  const isClosed = state === LISTING_STATE_CLOSED;
  const isPublished = state === LISTING_STATE_PUBLISHED;

  const thisListingInProgress =
    actionsInProgressListingId && actionsInProgressListingId.uuid === id;

  // Image
  const firstImage = currentListing.images?.[0];
  const {
    aspectWidth = 1,
    aspectHeight = 1,
    variantPrefix = 'listing-card',
  } = config.layout.listingImage;
  const variants = firstImage
    ? [`${variantPrefix}`, `${variantPrefix}-2x`].filter(v => firstImage.attributes?.variants?.[v])
    : [];

  // Listing type badge — resolved label from config
  const validListingTypes = config.listing.listingTypes || [];
  const foundListingTypeConfig = validListingTypes.find(
    conf => conf.listingType === publicData?.listingType
  );
  const categoryBadge = foundListingTypeConfig?.label || publicData?.listingType || null;

  // Link types
  const editListingLinkType = isDraft
    ? LISTING_PAGE_PARAM_TYPE_DRAFT
    : LISTING_PAGE_PARAM_TYPE_EDIT;
  const viewListingLinkProps =
    isDraft || isPending
      ? {
          name: 'ListingPageVariant',
          params: {
            id,
            slug,
            variant: isDraft ? LISTING_PAGE_DRAFT_VARIANT : LISTING_PAGE_PENDING_APPROVAL_VARIANT,
          },
        }
      : { name: 'ListingPage', params: { id, slug } };

  // State-based primary action
  const primaryAction = thisListingInProgress ? (
    <span className={css.spinner}>
      <IconSpinner />
    </span>
  ) : isPublished ? (
    <InlineTextButton
      rootClassName={css.stateActionButton}
      onClick={() => onCloseListing(currentListing.id)}
    >
      <FormattedMessage id="ManageListingCard.closeListing" />
    </InlineTextButton>
  ) : isClosed ? (
    <InlineTextButton
      rootClassName={css.stateActionButton}
      onClick={() => onOpenListing(currentListing.id)}
    >
      <FormattedMessage id="ManageListingCard.openListing" />
    </InlineTextButton>
  ) : isDraft ? (
    <InlineTextButton
      rootClassName={css.stateActionButton}
      id={`discardButton_${id}`}
      onClick={() => onDiscardDraft(currentListing.id)}
    >
      <FormattedMessage id="ManageListingCard.discardDraft" />
    </InlineTextButton>
  ) : null;

  const hasError = hasOpeningError || hasClosingError || hasDiscardingError;
  const views = statsUnavailable ? '-' : intl.formatNumber(stats.views || 0);
  const bookmarks = statsUnavailable ? '-' : intl.formatNumber(stats.bookmarks || 0);
  const sales = statsUnavailable ? '-' : intl.formatNumber(stats.sales || 0);

  return (
    <div className={classes}>
      {/* Card body: image + content side by side */}
      <div className={css.cardBody}>
        {/* Left: image */}
        <div className={css.imageSection}>
          <AspectRatioWrapper
            className={css.imageWrapper}
            width={aspectWidth}
            height={aspectHeight}
          >
            {firstImage ? (
              <ResponsiveImage
                rootClassName={css.listingImage}
                alt={title}
                image={firstImage}
                variants={variants}
                sizes={renderSizes}
              />
            ) : (
              <ListingCardThumbnail width={aspectWidth} height={aspectHeight} />
            )}
          </AspectRatioWrapper>
          {categoryBadge ? <div className={css.categoryBadge}>{categoryBadge}</div> : null}
        </div>

        {/* Right: title + stats */}
        <div className={css.contentSection}>
          <div className={css.titleRow}>
            <h3 className={css.title}>{formatTitle(title, MAX_LENGTH_FOR_WORDS_IN_TITLE)}</h3>
            <NamedLink
              className={css.titleMobileViewLink}
              {...viewListingLinkProps}
              aria-label={intl.formatMessage(
                { id: 'ManageListingCard.screenreader.viewListing' },
                { title }
              )}
            >
              <ViewListingIcon />
            </NamedLink>
          </div>

          <div className={css.statsRow}>
            <div className={css.statCard}>
              <span className={css.statIcon}>
                <EyeIcon />
              </span>
              <span className={css.statValue}>{views}</span>
              <span className={css.statLabel}>
                <FormattedMessage id="ManageListingCard.statViews" />
              </span>
            </div>
            <div className={css.statCard}>
              <span className={css.statIcon}>
                <BookmarkIcon />
              </span>
              <span className={css.statValue}>{bookmarks}</span>
              <span className={css.statLabel}>
                <FormattedMessage id="ManageListingCard.statBookmarks" />
              </span>
            </div>
            <div className={css.statCard}>
              <span className={css.statIcon}>
                <CoinsIcon />
              </span>
              <span className={css.statValue}>{sales}</span>
              <span className={css.statLabel}>
                <FormattedMessage id="ManageListingCard.statSales" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card footer: state action left, CTAs right */}
      <div className={css.cardFooter}>
        <div className={css.footerLeft}>
          {primaryAction}
          {hasError ? (
            <span className={css.actionError}>
              <FormattedMessage id="ManageListingCard.actionFailed" />
            </span>
          ) : null}
        </div>
        <div className={css.footerRight}>
          <NamedLink
            className={css.editButton}
            name="EditListingPage"
            params={{ id, slug, type: editListingLinkType, tab: 'details' }}
          >
            <EditIcon />
            <FormattedMessage id="ManageListingCard.editListing" />
          </NamedLink>
          <NamedLink className={css.viewButton} {...viewListingLinkProps}>
            <FormattedMessage id="ManageListingCard.viewListing" />
          </NamedLink>
        </div>
      </div>
    </div>
  );
};

export default ManageListingCard;

// import { useConfiguration } from '../../../context/configurationContext';
// import { useIntl, FormattedMessage } from '../../../util/reactIntl';
// import {
//   LISTING_STATE_DRAFT,
//   LISTING_STATE_PENDING_APPROVAL,
//   STOCK_MULTIPLE_ITEMS,
//   propTypes,
// } from '../../../util/types';
// import { ensureOwnListing } from '../../../util/data';
// import {
//   LISTING_PAGE_DRAFT_VARIANT,
//   LISTING_PAGE_PENDING_APPROVAL_VARIANT,
//   LISTING_PAGE_PARAM_TYPE_DRAFT,
//   LISTING_PAGE_PARAM_TYPE_EDIT,
//   createSlug,
// } from '../../../util/urlHelpers';
// import { isBookingProcessAlias, isPurchaseProcessAlias } from '../../../transactions/transaction';

// import { NamedLink, IconSpinner } from '../../../components';

// import CardMenu from './CardMenu';
// import CardThumbnail from './CardThumbnail';
// import Overlay from './Overlay';
// import PriceInfo from './PriceInfo';
// import css from './ManageListingCard.module.css';

// const MAX_LENGTH_FOR_WORDS_IN_TITLE = 7;

// /**
//  * Splits a title to break long words into spans so that
//  * flexbox card layouts don't expand excessively.
//  *
//  * @param {string} title - Listing title
//  * @param {number} maxLength - Maximum allowed word length before breaking
//  * @returns {Array<React.ReactNode>} Formatted title parts
//  */
// export const formatTitle = (title, maxLength) => {
//   const nonWhiteSpaceSequence = /([^\s]+)/gi;
//   return title.split(nonWhiteSpaceSequence).map((word, index) => {
//     return word.length > maxLength ? (
//       <span key={index} style={{ wordBreak: 'break-all' }}>
//         {word}
//       </span>
//     ) : (
//       word
//     );
//   });
// };

// const LinkedListingTitle = props => {
//   const intl = useIntl();
//   const { state, id, slug, title } = props;

//   return (
//     <NamedLink
//       className={css.title}
//       {...(state === LISTING_STATE_DRAFT || state === LISTING_STATE_PENDING_APPROVAL
//         ? {
//             name: 'ListingPageVariant',
//             params: {
//               id,
//               slug,
//               variant:
//                 state === LISTING_STATE_DRAFT
//                   ? LISTING_PAGE_DRAFT_VARIANT
//                   : LISTING_PAGE_PENDING_APPROVAL_VARIANT,
//             },
//           }
//         : {
//             name: 'ListingPage',
//             params: { id, slug },
//           })}
//       ariaLabel={intl.formatMessage(
//         { id: 'ManageListingCard.screenreader.viewListing' },
//         { title }
//       )}
//     >
//       {formatTitle(title, MAX_LENGTH_FOR_WORDS_IN_TITLE)}
//     </NamedLink>
//   );
// };

// const LinkToStockOrAvailabilityTab = props => {
//   const intl = useIntl();
//   const { listing, listingTypeConfig } = props;

//   const id = listing.id.uuid;
//   const { title = '', state, publicData } = listing.attributes || {};
//   const slug = createSlug(title);

//   const { listingType, transactionProcessAlias } = publicData || {};
//   const isDraft = state === LISTING_STATE_DRAFT;
//   const isBookable = isBookingProcessAlias(transactionProcessAlias);
//   const isProductOrder = isPurchaseProcessAlias(transactionProcessAlias);
//   const hasListingType = !!listingType;
//   const hasStockManagementInUse =
//     isProductOrder && listingTypeConfig?.stockType === STOCK_MULTIPLE_ITEMS;
//   const currentStock = listing?.currentStock?.attributes?.quantity;

//   const editListingLinkType = isDraft
//     ? LISTING_PAGE_PARAM_TYPE_DRAFT
//     : LISTING_PAGE_PARAM_TYPE_EDIT;

//   if (!hasListingType || !(isBookable || hasStockManagementInUse)) {
//     return null;
//   }

//   return (
//     <>
//       <span className={css.manageLinksSeparator}>{' • '}</span>

//       {isBookable ? (
//         <NamedLink
//           className={css.manageLink}
//           name="EditListingPage"
//           params={{ id, slug, type: editListingLinkType, tab: 'availability' }}
//           ariaLabel={intl.formatMessage(
//             { id: 'ManageListingCard.screenreader.manageAvailability' },
//             { title }
//           )}
//         >
//           <FormattedMessage id="ManageListingCard.manageAvailability" />
//         </NamedLink>
//       ) : (
//         <NamedLink
//           className={css.manageLink}
//           name="EditListingPage"
//           params={{ id, slug, type: editListingLinkType, tab: 'pricing-and-stock' }}
//           ariaLabel={
//             currentStock != null
//               ? intl.formatMessage(
//                   { id: 'ManageListingCard.screenreader.manageStock' },
//                   { title, currentStock }
//                 )
//               : intl.formatMessage(
//                   { id: 'ManageListingCard.screenreader.setPriceAndStock' },
//                   { title }
//                 )
//           }
//         >
//           {currentStock != null ? (
//             <FormattedMessage id="ManageListingCard.manageStock" values={{ currentStock }} />
//           ) : (
//             <FormattedMessage id="ManageListingCard.setPriceAndStock" />
//           )}
//         </NamedLink>
//       )}
//     </>
//   );
// };

// /**
//  * Manage listing card
//  *
//  * @param {Object} props
//  * @param {string} [props.className] - Custom class that extends the default class for the root element
//  * @param {string} [props.rootClassName] - Custom class that overrides the default class for the root element
//  * @param {boolean} props.hasClosingError - Whether the closing error is present
//  * @param {boolean} props.hasDiscardingError - Whether the discarding error is present
//  * @param {boolean} props.hasOpeningError - Whether the opening error is present
//  * @param {boolean} props.isMenuOpen - Whether the menu is open
//  * @param {Object} [props.actionsInProgressListingId] - The actions in progress for the specific listing
//  * @param {propTypes.uuid} [props.actionsInProgressListingId.uuid] - The uuid of the listing
//  * @param {propTypes.ownListing} props.listing - The listing
//  * @param {string} [props.renderSizes] - The render sizes for the ResponsiveImage component
//  * @param {function} props.onCloseListing - The function to close the listing
//  * @param {function} props.onOpenListing - The function to open the listing
//  * @param {function} props.onDiscardDraft - The function to discard the draft
//  * @param {function} props.onToggleMenu - The function to toggle the menu
//  * @returns {JSX.Element} Manage listing card component
//  */
// export const ManageListingCard = props => {
//   const config = useConfiguration();
//   const intl = props.intl || useIntl();
//   const {
//     className,
//     rootClassName,
//     hasClosingError,
//     hasDiscardingError,
//     hasOpeningError,
//     isMenuOpen,
//     actionsInProgressListingId,
//     listing,
//     renderSizes,
//     onCloseListing,
//     onOpenListing,
//     onDiscardDraft,
//     onToggleMenu,
//   } = props;
//   const classes = classNames(rootClassName || css.root, className);
//   const currentListing = ensureOwnListing(listing);
//   const id = currentListing.id.uuid;
//   const { title = '', state, publicData, price } = currentListing.attributes;
//   const slug = createSlug(title);
//   const isDraft = state === LISTING_STATE_DRAFT;

//   const { listingType, transactionProcessAlias } = publicData || {};

//   const validListingTypes = config.listing.listingTypes;
//   const listingTypeConfig = validListingTypes.find(conf => conf.listingType === listingType);

//   const hasError = hasOpeningError || hasClosingError || hasDiscardingError;
//   const thisListingInProgress =
//     actionsInProgressListingId && actionsInProgressListingId.uuid === id;

//   const editListingLinkType = isDraft
//     ? LISTING_PAGE_PARAM_TYPE_DRAFT
//     : LISTING_PAGE_PARAM_TYPE_EDIT;

//   return (
//     <div className={classes}>
//       <div className={classNames(css.thumbnailContainer)}>
//         <CardThumbnail
//           listing={currentListing}
//           renderSizes={renderSizes}
//           isBlended={isMenuOpen}
//           inProgressListingId={actionsInProgressListingId}
//           onCloseListing={onCloseListing}
//           onOpenListing={onOpenListing}
//           onDiscardDraft={onDiscardDraft}
//         />

//         <CardMenu
//           isMenuOpen={isMenuOpen}
//           listing={currentListing}
//           inProgressListingId={actionsInProgressListingId}
//           onToggleMenu={onToggleMenu}
//           onCloseListing={onCloseListing}
//         />

//         {thisListingInProgress ? (
//           <Overlay>
//             <IconSpinner />
//           </Overlay>
//         ) : hasError ? (
//           <Overlay errorMessage={intl.formatMessage({ id: 'ManageListingCard.actionFailed' })} />
//         ) : null}
//       </div>

//       <div className={css.info}>
//         <PriceInfo
//           price={price}
//           publicData={publicData}
//           isBookable={isBookingProcessAlias(transactionProcessAlias)}
//           listingTypeConfig={listingTypeConfig}
//         />

//         <div className={css.mainInfo}>
//           <div className={css.titleWrapper}>
//             <LinkedListingTitle state={state} id={id} slug={slug} title={title} />
//           </div>
//         </div>

//         <div className={css.manageLinks}>
//           <NamedLink
//             className={css.manageLink}
//             name="EditListingPage"
//             params={{ id, slug, type: editListingLinkType, tab: 'details' }}
//             ariaLabel={intl.formatMessage(
//               { id: 'ManageListingCard.screenreader.editListing' },
//               { title }
//             )}
//           >
//             <FormattedMessage id="ManageListingCard.editListing" />
//           </NamedLink>

//           <LinkToStockOrAvailabilityTab
//             listing={currentListing}
//             listingTypeConfig={listingTypeConfig}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ManageListingCard;
