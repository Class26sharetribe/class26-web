import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { denormalisedResponseEntities } from '../../util/data';
import { storableError } from '../../util/errors';

import { REVIEWS_TAB, MY_LISTINGS_TAB, ACCOUNT_SETTINGS_TAB } from './DashboardPage.tabs';
import { loadData as loadManageListings } from '../ManageListingsPage/ManageListingsPage.duck';
import { loadData as loadStripePayoutData } from '../StripePayoutPage/StripePayoutPage.duck';

// ================ Async Thunks ================ //

////////////////////////////
// Fetch Expert Reviews   //
////////////////////////////

const fetchExpertReviewsPayloadCreator = ({ userId }, { rejectWithValue, extra: sdk }) => {
  console.log('fetchExpertReviewsPayloadCreator userId', userId);

  return sdk.reviews
    .query({
      subject_id: userId,
      type: 'ofProvider',
      state: 'public',
      include: ['author', 'author.profileImage'],
      'fields.image': ['variants.square-small', 'variants.square-small2x'],
    })
    .then(response => {
      const reviews = denormalisedResponseEntities(response);
      return reviews;
    })
    .catch(e => {
      return rejectWithValue(storableError(e));
    });
};

export const fetchExpertReviewsThunk = createAsyncThunk(
  'DashboardPage/fetchExpertReviews',
  fetchExpertReviewsPayloadCreator
);

export const fetchExpertReviews = userId => dispatch => {
  return dispatch(fetchExpertReviewsThunk({ userId }));
};

// ================ Slice ================ //

const initialState = {
  reviews: [],
  reviewsInProgress: false,
  reviewsError: null,
};

const dashboardPageSlice = createSlice({
  name: 'DashboardPage',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchExpertReviewsThunk.pending, state => {
        state.reviewsInProgress = true;
        state.reviewsError = null;
      })
      .addCase(fetchExpertReviewsThunk.fulfilled, (state, action) => {
        state.reviewsInProgress = false;
        state.reviews = action.payload;
      })
      .addCase(fetchExpertReviewsThunk.rejected, (state, action) => {
        state.reviewsInProgress = false;
        state.reviews = [];
        state.reviewsError = action.payload;
      });
  },
});

export default dashboardPageSlice.reducer;

// ================ Load data ================ //

export const loadData = (params, search, config) => (dispatch, getState) => {
  if (params.tab === MY_LISTINGS_TAB) {
    return dispatch(loadManageListings(params, search, config));
  }
  if (params.tab === ACCOUNT_SETTINGS_TAB) {
    return dispatch(loadStripePayoutData());
  }
  if (params.tab === REVIEWS_TAB) {
    const currentUser = getState()?.user?.currentUser;
    const userId = currentUser?.id?.uuid;
    return dispatch(fetchExpertReviews(userId));
  }
  return Promise.resolve();
};
