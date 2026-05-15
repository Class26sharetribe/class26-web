import { MY_LISTINGS_TAB, ACCOUNT_SETTINGS_TAB } from './DashboardPage';
import { loadData as loadManageListings } from '../ManageListingsPage/ManageListingsPage.duck';
import { loadData as loadStripePayoutData } from '../StripePayoutPage/StripePayoutPage.duck';

// ================ Load data ================ //

/**
 * Load data for the DashboardPage based on the active tab.
 * Delegates to tab-specific loadData functions as needed.
 */
export const loadData = (params, search, config) => dispatch => {
  if (params.tab === MY_LISTINGS_TAB) {
    return dispatch(loadManageListings(params, search, config));
  }
  if (params.tab === ACCOUNT_SETTINGS_TAB) {
    return dispatch(loadStripePayoutData());
  }
  return Promise.resolve();
};
