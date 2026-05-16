import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import {
  AVAILABILITY_MULTIPLE_SEATS,
  LISTING_STATE_CLOSED,
  LINE_ITEM_NIGHT,
  LINE_ITEM_DAY,
  LINE_ITEM_HOUR,
  LINE_ITEM_FIXED,
  LINE_ITEM_ITEM,
  STOCK_MULTIPLE_ITEMS,
  STOCK_INFINITE_MULTIPLE_ITEMS,
} from '../../../util/types';
import { displayDeliveryPickup, displayDeliveryShipping } from '../../../util/configHelpers';
import { createSlug, parse } from '../../../util/urlHelpers';
import {
  OFFER,
  REQUEST,
  getSupportedProcessesInfo,
  isBookingProcess,
  isNegotiationProcess,
  isInquiryProcess,
  isPurchaseProcess,
  resolveLatestProcessName,
} from '../../../transactions/transaction';

import PriceVariantPicker from '../../../components/OrderPanel/PriceVariantPicker/PriceVariantPicker';
import {
  getCheapestPriceVariant,
  hasValidPriceVariants,
  isPublishedListing,
} from './listingPageMobileOrderHelpers';

/**
 * Computes order form visibility flags and shared form props for listing page mobile order UI.
 */
const useListingPageMobileOrderState = props => {
  const [mounted, setMounted] = useState(false);
  const [internalSeatsOptions, setInternalSeatsOptions] = useState([]);
  const location = useLocation();

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    listing,
    validListingTypes,
    lineItemUnitType: lineItemUnitTypeMaybe,
    isOwnListing,
    onSubmit,
    onFetchTransactionLineItems,
    lineItems,
    marketplaceCurrency,
    marketplaceName,
    fetchLineItemsInProgress,
    fetchLineItemsError,
    payoutDetailsWarning,
    listingType: listingTypeProp,
    currentUser,
    onSaveClick,
    seatsOptions: seatsOptionsProp,
    onSeatsOptionsChange,
  } = props;

  const seatsOptions = seatsOptionsProp ?? internalSeatsOptions;
  const setSeatsOptions = onSeatsOptionsChange ?? setInternalSeatsOptions;

  const publicData = listing?.attributes?.publicData || {};
  const {
    listingType,
    unitType,
    transactionProcessAlias = '',
    priceVariants,
    startTimeInterval,
    sessionDates,
  } = publicData || {};

  const processName = resolveLatestProcessName(transactionProcessAlias.split('/')[0]);
  const lineItemUnitType = lineItemUnitTypeMaybe || `line-item/${unitType}`;

  const price = listing?.attributes?.price;
  const isInquiry = isInquiryProcess(processName);
  const isBooking = isBookingProcess(processName);
  const isPurchase = isPurchaseProcess(processName);
  const isNegotiation = isNegotiationProcess(processName);
  const isPaymentProcess = isBooking || isPurchase || isNegotiation;

  const showPriceMissing = isPaymentProcess && !isNegotiation && !price;
  const showInvalidCurrency =
    isPaymentProcess && !isNegotiation && price?.currency !== marketplaceCurrency;

  const timeZone = listing?.attributes?.availabilityPlan?.timezone;
  const isClosed = listing?.attributes?.state === LISTING_STATE_CLOSED;

  const shouldHaveFixedBookingDuration = isBooking && [LINE_ITEM_FIXED].includes(lineItemUnitType);
  const showBookingFixedDurationForm =
    mounted && shouldHaveFixedBookingDuration && !isClosed && timeZone && priceVariants?.length > 0;

  const shouldHaveBookingTime = isBooking && [LINE_ITEM_HOUR].includes(lineItemUnitType);
  const showBookingTimeForm = mounted && shouldHaveBookingTime && !isClosed && timeZone;

  const shouldHaveBookingDates =
    isBooking && [LINE_ITEM_DAY, LINE_ITEM_NIGHT].includes(lineItemUnitType);
  const showBookingDatesForm = mounted && shouldHaveBookingDates && !isClosed && timeZone;

  const shouldHavePurchase = isPurchase && lineItemUnitType === LINE_ITEM_ITEM;
  const currentStock = listing.currentStock?.attributes?.quantity;

  const showProductOrderForm =
    mounted && shouldHavePurchase && !isClosed && typeof currentStock === 'number';

  const showInquiryForm = mounted && !isClosed && isInquiry;
  const showNegotiationForm = mounted && !isClosed && isNegotiation && unitType === REQUEST;
  const showRequestQuoteForm = mounted && !isClosed && isNegotiation && unitType === OFFER;

  const supportedProcessesInfo = getSupportedProcessesInfo();
  const isKnownProcess = supportedProcessesInfo.map(info => info.name).includes(processName);

  const { pickupEnabled, shippingEnabled } = publicData || {};

  const listingTypeConfig = validListingTypes.find(conf => conf.listingType === listingType);
  const displayShipping = displayDeliveryShipping(listingTypeConfig);
  const displayPickup = displayDeliveryPickup(listingTypeConfig);
  const allowOrdersOfMultipleItems = [STOCK_MULTIPLE_ITEMS, STOCK_INFINITE_MULTIPLE_ITEMS].includes(
    listingTypeConfig?.stockType
  );

  const searchParams = parse(location.search);
  const preselectedPriceVariantSlug = searchParams.bookableOption;

  const seatsEnabled = [AVAILABILITY_MULTIPLE_SEATS].includes(listingTypeConfig?.availabilityType);

  const isPriceVariationsInUse = !!publicData?.priceVariationsEnabled;
  const preselectedPriceVariant =
    Array.isArray(priceVariants) && preselectedPriceVariantSlug && isPriceVariationsInUse
      ? priceVariants.find(pv => pv?.name && createSlug(pv?.name) === preselectedPriceVariantSlug)
      : null;

  const priceVariantsMaybe = isPriceVariationsInUse
    ? {
        isPriceVariationsInUse,
        priceVariants,
        priceVariantFieldComponent: PriceVariantPicker,
        preselectedPriceVariant,
        isPublishedListing: isPublishedListing(listing),
      }
    : !isPriceVariationsInUse && showBookingFixedDurationForm
    ? {
        isPriceVariationsInUse: false,
        priceVariants: [getCheapestPriceVariant(priceVariants)],
        priceVariantFieldComponent: PriceVariantPicker,
      }
    : {};

  const showInvalidPriceVariantsMessage =
    isPriceVariationsInUse && !hasValidPriceVariants(priceVariants);

  const sharedProps = {
    lineItemUnitType,
    onSubmit,
    price,
    marketplaceCurrency,
    listingId: listing.id,
    isOwnListing,
    marketplaceName,
    onFetchTransactionLineItems,
    lineItems,
    fetchLineItemsInProgress,
    fetchLineItemsError,
    payoutDetailsWarning,
    listingType: listingTypeProp || listingType,
    currentUser,
    onSaveClick,
  };

  return {
    seatsOptions,
    setSeatsOptions,
    showPriceMissing,
    showInvalidCurrency,
    showInvalidPriceVariantsMessage,
    showBookingFixedDurationForm,
    showBookingTimeForm,
    showBookingDatesForm,
    showProductOrderForm,
    showInquiryForm,
    showNegotiationForm,
    showRequestQuoteForm,
    isKnownProcess,
    seatsEnabled,
    startTimeInterval,
    timeZone,
    sessionDates,
    priceVariantsMaybe,
    sharedProps,
    pickupEnabled,
    shippingEnabled,
    displayPickup,
    displayShipping,
    allowOrdersOfMultipleItems,
    currentStock,
  };
};

export default useListingPageMobileOrderState;
