import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { storableError } from '../../util/errors';
import { parse } from '../../util/urlHelpers';
import { loadData as loadSavedCourses } from '../SavedCoursesPage/SavedCoursesPage.duck';
import { loadData as loadAccountSettings } from '../AccountSettingsPage/AccountSettingsPage.duck';
import { addMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { PURCHASE_PROCESS_NAME } from '../../transactions/transaction';

// Tab constants duplicated here to avoid circular dependency with PersonalAreaPage.js
export const MY_CLASSES_TAB = 'my-classes';
export const SAVED_FOR_LATER_TAB = 'saved-courses';
export const ACCOUNT_SETTINGS_TAB = 'account-settings';
export const PERSONAL_PROFILE_TAB = 'profile';

// Filter tabs for My Classes
export const ACTIVE_FILTER = 'active';
export const LIFETIME_FILTER = 'lifetime';
export const PAST_FILTER = 'past';
export const CANCELED_FILTER = 'canceled';

const INBOX_PAGE_SIZE = 100;

// ================ Helper functions ================ //

const entityRefs = entities =>
  entities.map(entity => ({
    id: entity.id,
    type: entity.type,
  }));

// ================ Slice ================ //

const personalAreaPageSlice = createSlice({
  name: 'PersonalAreaPage',
  initialState: {
    fetchInProgress: false,
    fetchOrdersError: null,
    pagination: null,
    transactionRefs: [],
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchOrdersThunk.pending, state => {
        state.fetchInProgress = true;
        state.fetchOrdersError = null;
      })
      .addCase(fetchOrdersThunk.fulfilled, (state, action) => {
        const transactions = action.payload.data.data;
        state.fetchInProgress = false;
        state.transactionRefs = entityRefs(transactions);
        state.pagination = action.payload.data.meta;
      })
      .addCase(fetchOrdersThunk.rejected, (state, action) => {
        console.error(action.payload || action.error);
        state.fetchInProgress = false;
        state.fetchOrdersError = action.payload;
      });
  },
});

export default personalAreaPageSlice.reducer;

// ================ Thunks ================ //

const fetchOrdersPayloadCreator = ({ search } = {}, { dispatch, rejectWithValue, extra: sdk }) => {
  const { filter = ACTIVE_FILTER } = parse(search) || {};

  let params = {};
  if (filter === ACTIVE_FILTER) {
    // TODO: filter active transactions
  } else if (filter === LIFETIME_FILTER) {
    params = {
      processNames: PURCHASE_PROCESS_NAME,
    };
  } else if (filter === PAST_FILTER) {
    // TODO: filter past transactions
  } else if (filter === CANCELED_FILTER) {
    // TODO: filter canceled transactions
  }

  const apiQueryParams = {
    only: 'order',
    ...params,
    include: [
      'listing',
      'provider',
      'provider.profileImage',
      'customer',
      'customer.profileImage',
      'booking',
      'listing.images',
    ],
    'fields.transaction': [
      'processName',
      'lastTransition',
      'lastTransitionedAt',
      'transitions',
      'payinTotal',
      'payoutTotal',
      'lineItems',
    ],
    'fields.listing': ['title', 'availabilityPlan', 'publicData'],
    'fields.user': ['profile.displayName', 'profile.abbreviatedName', 'deleted', 'banned'],
    'fields.image': ['variants.square-small', 'variants.square-small2x'],
    page: 1,
    perPage: INBOX_PAGE_SIZE,
  };

  return sdk.transactions
    .query(apiQueryParams)
    .then(response => {
      dispatch(addMarketplaceEntities(response));
      return response;
    })
    .catch(e => {
      return rejectWithValue(storableError(e));
    });
};

export const fetchOrdersThunk = createAsyncThunk(
  'PersonalAreaPage/fetchOrders',
  fetchOrdersPayloadCreator
);

// ================ Load data ================ //

/**
 * Load data for the PersonalAreaPage based on the active tab.
 * Delegates to tab-specific loadData functions as needed.
 */
export const loadData = (params, search, config) => dispatch => {
  if (params.tab === MY_CLASSES_TAB) {
    return dispatch(fetchOrdersThunk({ search }));
  }
  if (params.tab === SAVED_FOR_LATER_TAB) {
    return dispatch(loadSavedCourses(params, search, config));
  }
  if (params.tab === ACCOUNT_SETTINGS_TAB) {
    return dispatch(loadAccountSettings(params, search, config));
  }
  return Promise.resolve();
};
