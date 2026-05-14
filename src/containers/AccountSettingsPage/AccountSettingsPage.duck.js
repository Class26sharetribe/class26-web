import { setInitialValues as setInitialValuesForPaymentMethods } from '../../ducks/paymentMethods.duck';
import { stripeCustomerThunk } from '../PaymentMethodsPage/PaymentMethodsPage.duck';

// ================ Load data ================ //

export const loadData = () => dispatch => {
  // Reset payment method state and load stripe customer (sets state.PaymentMethodsPage.stripeCustomerFetched)
  dispatch(setInitialValuesForPaymentMethods());
  return dispatch(stripeCustomerThunk());
};
