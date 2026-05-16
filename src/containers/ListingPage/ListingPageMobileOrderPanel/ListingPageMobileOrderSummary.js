import React from 'react';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { displayPrice } from '../../../util/configHelpers';
import {
  LISTING_STATE_CLOSED,
  LISTING_TYPE_GROUP_COACHING,
  LISTING_TYPE_INDIVIDUAL_COACHING,
  LISTING_TYPE_VIDEO_COURSE,
} from '../../../util/types';
import { formatMoney } from '../../../util/currency';

import { H2 } from '../../../components';
import { GreenCheckIcon } from '../../../components/ListingCard/ListingCard';
import { formatCourseDuration } from '../../../util/courseHelpers';

import orderPanelCss from '../../../components/OrderPanel/OrderPanel.module.css';
import css from './ListingPageMobileOrderSummary.module.css';

const formatMoneyIfSupportedCurrency = (price, intl) => {
  try {
    return formatMoney(intl, price);
  } catch (e) {
    return `(${price.currency})`;
  }
};

const PriceMaybe = props => {
  const { price, publicData, validListingTypes, intl, marketplaceCurrency, seatsOptions } = props;
  const { listingType, unitType } = publicData || {};

  const foundListingTypeConfig = validListingTypes.find(conf => conf.listingType === listingType);
  const showPrice = displayPrice(foundListingTypeConfig);
  const isPriceVariationsInUse = !!publicData?.priceVariationsEnabled;
  const hasMultiplePriceVariants = publicData?.priceVariants?.length > 1;

  if (!showPrice || !price || (isPriceVariationsInUse && hasMultiplePriceVariants)) {
    return null;
  }

  const priceValue = (
    <span className={orderPanelCss.priceValue}>{formatMoneyIfSupportedCurrency(price, intl)}</span>
  );
  const pricePerUnit = (
    <span className={orderPanelCss.perUnit}>
      <FormattedMessage id="OrderPanel.perUnit" values={{ unitType }} />
    </span>
  );

  return (
    <div className={classNames(orderPanelCss.priceContainer, css.mobilePriceContainer)}>
      <p className={classNames(orderPanelCss.price, css.mobilePrice)}>
        <FormattedMessage id="OrderPanel.price" values={{ priceValue, pricePerUnit }} />
      </p>
      {seatsOptions?.length > 0 && (
        <p className={orderPanelCss.seatsAvailable}>
          <span className={orderPanelCss.dividerLine} /> <b>{seatsOptions.length}</b>&nbsp;seats
          available for this class
        </p>
      )}
    </div>
  );
};

/**
 * Mobile listing page summary: order title, price, and course highlight.
 */
const ListingPageMobileOrderSummary = props => {
  const intl = useIntl();
  const {
    listing,
    title,
    titleDesktop,
    titleClassName,
    showListingImage,
    forceShowOrderHeading = false,
    validListingTypes,
    marketplaceCurrency,
    seatsOptions = [],
    rootClassName,
  } = props;

  const publicData = listing?.attributes?.publicData || {};
  const { listingType, totalSessions, courseModules } = publicData;
  const price = listing?.attributes?.price;
  const isClosed = listing?.attributes?.state === LISTING_STATE_CLOSED;

  const subTitleText = isClosed
    ? intl.formatMessage({ id: 'OrderPanel.subTitleClosedListing' })
    : null;

  const titleClasses = classNames(titleClassName || orderPanelCss.orderTitle);
  const durationText = courseModules ? formatCourseDuration(courseModules) : null;

  const orderHeadingClasses = classNames(orderPanelCss.orderHeading, {
    [css.orderHeadingVisible]: forceShowOrderHeading,
  });

  return (
    <div className={rootClassName}>
      {showListingImage ? (
        <div className={orderHeadingClasses}>
          {titleDesktop ? titleDesktop : <H2 className={titleClasses}>{title}</H2>}
          {subTitleText ? (
            <div className={classNames(orderPanelCss.orderHelp, css.orderHelpOnMobile)}>
              {subTitleText}
            </div>
          ) : null}
        </div>
      ) : null}

      <PriceMaybe
        price={price}
        publicData={publicData}
        validListingTypes={validListingTypes}
        intl={intl}
        marketplaceCurrency={marketplaceCurrency}
        seatsOptions={seatsOptions}
      />

      <div className={orderPanelCss.courseHighlight}>
        <GreenCheckIcon />
        <span className={orderPanelCss.courseHighlightText}>
          {listingType === LISTING_TYPE_INDIVIDUAL_COACHING ? (
            <FormattedMessage
              id="ListingCard.highlightIndividualCoaching"
              values={{ totalSessions }}
            />
          ) : listingType === LISTING_TYPE_GROUP_COACHING ? (
            <FormattedMessage id="ListingCard.highlightGroupCoaching" values={{ totalSessions }} />
          ) : listingType === LISTING_TYPE_VIDEO_COURSE ? (
            <FormattedMessage id="ListingCard.highlightVideoCourse" values={{ durationText }} />
          ) : (
            <FormattedMessage id="ListingCard.highlightDefault" />
          )}
        </span>
      </div>
    </div>
  );
};

export default ListingPageMobileOrderSummary;
