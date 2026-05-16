import React from 'react';
import { FormattedMessage } from '../../../util/reactIntl';
import { LISTING_STATE_PUBLISHED } from '../../../util/types';
import { createSlug } from '../../../util/urlHelpers';

import orderPanelCss from '../../../components/OrderPanel/OrderPanel.module.css';

export const LISTING_PAGE_MOBILE_ORDER_DATE_FORMATTING_OPTIONS = {
  month: 'short',
  day: 'numeric',
  weekday: 'short',
};

export const LISTING_PAGE_MOBILE_ORDER_TODAY = new Date();

export const LISTING_PAGE_MOBILE_ORDER_FORM_ID = 'listingPageMobileOrderForm';

export const scrollToListingPageMobileOrderForm = () => {
  document.getElementById(LISTING_PAGE_MOBILE_ORDER_FORM_ID)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
};

export const isPublishedListing = listing => {
  return listing.attributes.state === LISTING_STATE_PUBLISHED;
};

export const getCheapestPriceVariant = (priceVariants = []) => {
  return priceVariants.reduce((cheapest, current) => {
    return current.priceInSubunits < cheapest.priceInSubunits ? current : cheapest;
  }, priceVariants[0]);
};

const hasUniqueVariants = priceVariants => {
  const priceVariantsSlugs = priceVariants?.map(variant =>
    variant.name ? createSlug(variant.name) : 'no-name'
  );
  return new Set(priceVariantsSlugs).size === priceVariants.length;
};

export const hasValidPriceVariants = priceVariants => {
  const isArray = Array.isArray(priceVariants);
  const hasItems = isArray && priceVariants.length > 0;
  const variantsHaveNames = hasItems && priceVariants.every(variant => variant.name);
  const namesAreUnique = hasItems && hasUniqueVariants(priceVariants);

  return variantsHaveNames && namesAreUnique;
};

export const PriceMissing = () => {
  return (
    <p className={orderPanelCss.error}>
      <FormattedMessage id="OrderPanel.listingPriceMissing" />
    </p>
  );
};

export const InvalidCurrency = () => {
  return (
    <p className={orderPanelCss.error}>
      <FormattedMessage id="OrderPanel.listingCurrencyInvalid" />
    </p>
  );
};

export const InvalidPriceVariants = () => {
  return (
    <p className={orderPanelCss.error}>
      <FormattedMessage id="OrderPanel.listingPriceVariantsAreInvalid" />
    </p>
  );
};
