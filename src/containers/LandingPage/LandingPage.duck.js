import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { addMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { fetchPageAssets } from '../../ducks/hostedAssets.duck';
import { querySellers } from '../../util/api';
import { storableError } from '../../util/errors';

export const ASSET_NAME = 'landing-page';

const LANDING_PAGE_SELLER_LIMIT = 6;

const initialState = {
  sellerRefs: [],
  sellerFetchInProgress: false,
  sellerFetchError: null,
};

const queryLandingPageSellersPayloadCreator = (
  { perPage = LANDING_PAGE_SELLER_LIMIT, config },
  { dispatch, rejectWithValue }
) => {
  return querySellers({ perPage }, config?.marketplaceRootURL)
    .then(response => {
      const userFields = config?.user?.userFields;
      const sanitizeConfig = { userFields };
      dispatch(addMarketplaceEntities({ data: response }, sanitizeConfig));

      return {
        sellerRefs: response.data.map(({ id, type }) => ({ id, type })),
      };
    })
    .catch(e => {
      return rejectWithValue(storableError(e));
    });
};

export const queryLandingPageSellers = createAsyncThunk(
  'LandingPage/queryLandingPageSellers',
  queryLandingPageSellersPayloadCreator
);

const landingPageSlice = createSlice({
  name: 'LandingPage',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(queryLandingPageSellers.pending, state => {
        state.sellerFetchInProgress = true;
        state.sellerFetchError = null;
      })
      .addCase(queryLandingPageSellers.fulfilled, (state, action) => {
        state.sellerFetchInProgress = false;
        state.sellerRefs = action.payload.sellerRefs;
      })
      .addCase(queryLandingPageSellers.rejected, (state, action) => {
        state.sellerFetchInProgress = false;
        state.sellerFetchError = action.payload;
      });
  },
});

export default landingPageSlice.reducer;

export const loadData = (params, search, config) => dispatch => {
  const pageAsset = { landingPage: `content/pages/${ASSET_NAME}.json` };
  return Promise.all([
    dispatch(fetchPageAssets(pageAsset, true)),
    dispatch(queryLandingPageSellers({ perPage: LANDING_PAGE_SELLER_LIMIT, config })),
  ]);
};
