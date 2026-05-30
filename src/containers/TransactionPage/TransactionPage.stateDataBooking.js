import {
  TX_TRANSITION_ACTOR_CUSTOMER as CUSTOMER,
  TX_TRANSITION_ACTOR_PROVIDER as PROVIDER,
  CONDITIONAL_RESOLVER_WILDCARD,
  ConditionalResolver,
} from '../../transactions/transaction';
import { LISTING_TYPE_INDIVIDUAL_COACHING } from '../../util/types';

/**
 * Get state data against booking process for TransactionPage's UI.
 * I.e. info about showing action buttons, current state etc.
 *
 * @param {*} txInfo detials about transaction
 * @param {*} processInfo  details about process
 */
export const getStateDataForBookingProcess = (txInfo, processInfo) => {
  const { transaction, transactionRole, nextTransitions, onOpenAcceptBookingModal } = txInfo;
  const isProviderBanned = transaction?.provider?.attributes?.banned;
  const isCustomerBanned = transaction?.provider?.attributes?.banned;
  const bookingStart = transaction?.booking?.attributes?.start;

  const _ = CONDITIONAL_RESOLVER_WILDCARD;

  const {
    processName,
    processState,
    states,
    transitions,
    isCustomer,
    actionButtonProps,
    leaveReviewProps,
  } = processInfo;

  const canCancel = bookingStart
    ? new Date() < new Date(new Date(bookingStart) - 48 * 60 * 60 * 1000)
    : false;

  return new ConditionalResolver([processState, transactionRole])
    .cond([states.INQUIRY, CUSTOMER], () => {
      const transitionNames = Array.isArray(nextTransitions)
        ? nextTransitions.map(t => t.attributes.name)
        : [];
      const requestAfterInquiry = transitions.REQUEST_PAYMENT_AFTER_INQUIRY;
      const hasCorrectNextTransition = transitionNames.includes(requestAfterInquiry);
      const showOrderPanel = !isProviderBanned && hasCorrectNextTransition;
      return { processName, processState, showOrderPanel };
    })
    .cond([states.INQUIRY, PROVIDER], () => {
      return { processName, processState, showDetailCardHeadings: true };
    })
    .cond([states.PREAUTHORIZED, CUSTOMER], () => {
      const primary = isCustomerBanned
        ? null
        : actionButtonProps(transitions.CUSTOMER_CANCEL, CUSTOMER);

      return {
        processName,
        processState,
        showDetailCardHeadings: true,
        showExtraInfo: true,
        showActionButtons: true,
        primaryButtonProps: primary,
      };
    })
    .cond([states.PREAUTHORIZED, PROVIDER], () => {
      const listingType = transaction?.listing?.attributes?.publicData?.listingType;
      const isIndividualCoaching = listingType === LISTING_TYPE_INDIVIDUAL_COACHING;
      const primary = isCustomerBanned
        ? null
        : isIndividualCoaching && onOpenAcceptBookingModal
        ? actionButtonProps(transitions.ACCEPT, PROVIDER, { onAction: onOpenAcceptBookingModal })
        : actionButtonProps(transitions.ACCEPT, PROVIDER);
      const secondary = isCustomerBanned ? null : actionButtonProps(transitions.DECLINE, PROVIDER);
      return {
        processName,
        processState,
        showDetailCardHeadings: true,
        showActionButtons: true,
        primaryButtonProps: primary,
        secondaryButtonProps: secondary,
      };
    })
    .cond([states.ACCEPTED, CUSTOMER], () => {
      const primary =
        canCancel && !isCustomerBanned ? actionButtonProps(transitions.CANCEL, CUSTOMER) : null;
      return {
        processName,
        processState,
        showDetailCardHeadings: true,
        showActionButtons: canCancel,
        primaryButtonProps: primary,
      };
    })
    .cond([states.ACCEPTED, PROVIDER], () => {
      const primary =
        canCancel && !isCustomerBanned
          ? actionButtonProps(transitions.PROVIDER_CANCEL, PROVIDER)
          : null;
      return {
        processName,
        processState,
        showDetailCardHeadings: true,
        showActionButtons: canCancel,
        primaryButtonProps: primary,
      };
    })
    .cond([states.DELIVERED, _], () => {
      return {
        processName,
        processState,
        showDetailCardHeadings: true,
        showReviewAsFirstLink: true,
        showActionButtons: true,
        primaryButtonProps: leaveReviewProps,
      };
    })
    .cond([states.REVIEWED_BY_PROVIDER, PROVIDER], () => {
      return {
        processName,
        processState,
        showDetailCardHeadings: true,
        showReviews: true,
      };
    })
    .cond([states.REVIEWED_BY_PROVIDER, CUSTOMER], () => {
      return {
        processName,
        processState,
        showDetailCardHeadings: true,
        showReviewAsSecondLink: true,
        showActionButtons: true,
        primaryButtonProps: leaveReviewProps,
        showReviews: true,
      };
    })
    .cond([states.REVIEWED_BY_CUSTOMER, CUSTOMER], () => {
      return {
        processName,
        processState,
        showDetailCardHeadings: true,
        showReviews: true,
      };
    })
    .cond([states.REVIEWED_BY_CUSTOMER, PROVIDER], () => {
      return {
        processName,
        processState,
        showDetailCardHeadings: true,
        showReviewAsSecondLink: true,
        showActionButtons: true,
        primaryButtonProps: leaveReviewProps,
        showReviews: true,
      };
    })
    .cond([states.REVIEWED, _], () => {
      return { processName, processState, showDetailCardHeadings: true, showReviews: true };
    })
    .default(() => {
      // Default values for other states
      return { processName, processState, showDetailCardHeadings: true };
    })
    .resolve();
};
