import React from 'react';
import loadable from '@loadable/component';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';

import SubmitFinePrint from '../../../components/OrderPanel/SubmitFinePrint/SubmitFinePrint';
import useListingPageMobileOrderState from './useListingPageMobileOrderState';
import {
  InvalidCurrency,
  InvalidPriceVariants,
  LISTING_PAGE_MOBILE_ORDER_DATE_FORMATTING_OPTIONS,
  LISTING_PAGE_MOBILE_ORDER_TODAY,
  PriceMissing,
} from './listingPageMobileOrderHelpers';

import orderPanelCss from '../../../components/OrderPanel/OrderPanel.module.css';

const BookingTimeForm = loadable(() =>
  import(
    /* webpackChunkName: "BookingTimeForm" */ '../../../components/OrderPanel/BookingTimeForm/BookingTimeForm'
  )
);
const BookingDatesForm = loadable(() =>
  import(
    /* webpackChunkName: "BookingDatesForm" */ '../../../components/OrderPanel/BookingDatesForm/BookingDatesForm'
  )
);
const BookingFixedDurationForm = loadable(() =>
  import(
    /* webpackChunkName: "BookingFixedDurationForm" */ '../../../components/OrderPanel/BookingFixedDurationForm/BookingFixedDurationForm'
  )
);
const InquiryWithoutPaymentForm = loadable(() =>
  import(
    /* webpackChunkName: "InquiryWithoutPaymentForm" */ '../../../components/OrderPanel/InquiryWithoutPaymentForm/InquiryWithoutPaymentForm'
  )
);
const ProductOrderForm = loadable(() =>
  import(
    /* webpackChunkName: "ProductOrderForm" */ '../../../components/OrderPanel/ProductOrderForm/ProductOrderForm'
  )
);
const NegotiationForm = loadable(() =>
  import(
    /* webpackChunkName: "NegotiationForm" */ '../../../components/OrderPanel/NegotiationForm/NegotiationForm'
  )
);
const NegotiationRequestQuoteForm = loadable(() =>
  import(
    /* webpackChunkName: "NegotiationRequestQuoteForm" */ '../../../components/OrderPanel/NegotiationRequestQuoteForm/NegotiationRequestQuoteForm'
  )
);

/**
 * Order/booking forms for the listing page mobile layout.
 */
const ListingPageMobileOrderForms = props => {
  const intl = useIntl();
  const {
    formIdPrefix = 'ListingPageMobileOrderPanel',
    rootClassName,
    dayCountAvailableForBooking,
    onFetchTimeSlots,
    monthlyTimeSlots,
    timeSlotsForDate,
    isOwnListing,
    onSubmit,
    payoutDetailsWarning,
    onContactUser,
  } = props;

  const formState = useListingPageMobileOrderState(props);
  const {
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
  } = formState;

  return (
    <div className={classNames(rootClassName)}>
      {showPriceMissing ? (
        <PriceMissing />
      ) : showInvalidCurrency ? (
        <InvalidCurrency />
      ) : showInvalidPriceVariantsMessage ? (
        <InvalidPriceVariants />
      ) : showBookingFixedDurationForm ? (
        <BookingFixedDurationForm
          seatsEnabled={seatsEnabled}
          className={orderPanelCss.bookingForm}
          formId={`${formIdPrefix}BookingFixedDurationForm`}
          dayCountAvailableForBooking={dayCountAvailableForBooking}
          monthlyTimeSlots={monthlyTimeSlots}
          timeSlotsForDate={timeSlotsForDate}
          onFetchTimeSlots={onFetchTimeSlots}
          startDatePlaceholder={intl.formatDate(
            LISTING_PAGE_MOBILE_ORDER_TODAY,
            LISTING_PAGE_MOBILE_ORDER_DATE_FORMATTING_OPTIONS
          )}
          startTimeInterval={startTimeInterval}
          timeZone={timeZone}
          finePrintComponent={SubmitFinePrint}
          {...priceVariantsMaybe}
          {...sharedProps}
        />
      ) : showBookingTimeForm ? (
        <BookingTimeForm
          seatsEnabled={seatsEnabled}
          className={orderPanelCss.bookingForm}
          formId={`${formIdPrefix}BookingTimeForm`}
          dayCountAvailableForBooking={dayCountAvailableForBooking}
          monthlyTimeSlots={monthlyTimeSlots}
          timeSlotsForDate={timeSlotsForDate}
          onFetchTimeSlots={onFetchTimeSlots}
          startDatePlaceholder={intl.formatDate(
            LISTING_PAGE_MOBILE_ORDER_TODAY,
            LISTING_PAGE_MOBILE_ORDER_DATE_FORMATTING_OPTIONS
          )}
          endDatePlaceholder={intl.formatDate(
            LISTING_PAGE_MOBILE_ORDER_TODAY,
            LISTING_PAGE_MOBILE_ORDER_DATE_FORMATTING_OPTIONS
          )}
          timeZone={timeZone}
          finePrintComponent={SubmitFinePrint}
          {...priceVariantsMaybe}
          {...sharedProps}
        />
      ) : showBookingDatesForm ? (
        <BookingDatesForm
          seatsEnabled={seatsEnabled}
          className={orderPanelCss.bookingForm}
          formId={`${formIdPrefix}BookingDatesForm`}
          dayCountAvailableForBooking={dayCountAvailableForBooking}
          monthlyTimeSlots={monthlyTimeSlots}
          onFetchTimeSlots={onFetchTimeSlots}
          timeZone={timeZone}
          sessionDates={sessionDates}
          onSeatsOptionsChange={setSeatsOptions}
          finePrintComponent={SubmitFinePrint}
          {...priceVariantsMaybe}
          {...sharedProps}
        />
      ) : showProductOrderForm ? (
        <ProductOrderForm
          formId={`${formIdPrefix}ProductOrderForm`}
          currentStock={currentStock}
          allowOrdersOfMultipleItems={allowOrdersOfMultipleItems}
          pickupEnabled={pickupEnabled && displayPickup}
          shippingEnabled={shippingEnabled && displayShipping}
          displayDeliveryMethod={displayPickup || displayShipping}
          onContactUser={onContactUser}
          {...sharedProps}
        />
      ) : showInquiryForm ? (
        <InquiryWithoutPaymentForm
          formId={`${formIdPrefix}InquiryForm`}
          onSubmit={onSubmit}
          finePrintComponent={SubmitFinePrint}
          isOwnListing={isOwnListing}
        />
      ) : showNegotiationForm ? (
        <NegotiationForm
          formId={`${formIdPrefix}NegotiationForm`}
          onSubmit={onSubmit}
          finePrintComponent={SubmitFinePrint}
          payoutDetailsWarning={payoutDetailsWarning}
          isOwnListing={isOwnListing}
        />
      ) : showRequestQuoteForm ? (
        <NegotiationRequestQuoteForm
          formId={`${formIdPrefix}RequestQuoteForm`}
          onSubmit={onSubmit}
          finePrintComponent={SubmitFinePrint}
          payoutDetailsWarning={payoutDetailsWarning}
          isOwnListing={isOwnListing}
        />
      ) : !isKnownProcess ? (
        <p className={orderPanelCss.errorSidebar}>
          <FormattedMessage id="OrderPanel.unknownTransactionProcess" />
        </p>
      ) : null}
    </div>
  );
};

export default ListingPageMobileOrderForms;
