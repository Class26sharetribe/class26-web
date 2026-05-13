import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createImageVariantConfig } from '../../util/sdkLoader';
import { storableError } from '../../util/errors';

import { addMarketplaceEntities, getListingsById } from '../../ducks/marketplaceData.duck';
import { fetchCurrentUser } from '../../ducks/user.duck';
import { denormalisedEntities } from '../../util/data';

// ================ Selectors ================ //

/**
 * Get denormalised listing entities for saved courses from the marketplace data.
 *
 * @param {Object} state - Redux state
 * @param {Array<UUID>} listingIds - Array of listing UUID objects
 * @returns {Array} Denormalised listing entities
 */
export const getSavedListingsById = (state, listingIds) => {
  return getListingsById(state, listingIds);
};

// ================ Async Thunks ================ //

const fetchSavedCoursesPayloadCreator = (config, thunkAPI) => {
  const { dispatch, getState, extra: sdk, rejectWithValue } = thunkAPI;

  const { currentUser } = getState().user;
  const { favorites } = currentUser?.attributes.profile.privateData || {};
  const favoritesMaybe = favorites?.length > 0 ? { ids: favorites } : null;

  // No favourites saved — resolve with empty result immediately
  if (!favoritesMaybe) {
    return Promise.resolve({ data: { data: [], included: [], meta: {} } });
  }

  const {
    aspectWidth = 1,
    aspectHeight = 1,
    variantPrefix = 'listing-card',
  } = config.layout.listingImage;
  const aspectRatio = aspectHeight / aspectWidth;

  const params = {
    ...favoritesMaybe,
    include: ['author', 'images'],
    'fields.listing': [
      'title',
      'description',
      'geolocation',
      'price',
      'deleted',
      'state',
      'publicData',
    ],
    'fields.user': ['profile.displayName', 'profile.abbreviatedName'],
    'fields.image': [
      'variants.scaled-small',
      'variants.scaled-medium',
      `variants.${variantPrefix}`,
      `variants.${variantPrefix}-2x`,
    ],
    ...createImageVariantConfig(`${variantPrefix}`, 400, aspectRatio),
    ...createImageVariantConfig(`${variantPrefix}-2x`, 800, aspectRatio),
    'limit.images': 1,
  };

  return sdk.listings
    .query(params)
    .then(response => {
      const listingFields = config?.listing?.listingFields;
      const sanitizeConfig = { listingFields };
      dispatch(addMarketplaceEntities(response, sanitizeConfig));
      return response;
    })
    .catch(e => rejectWithValue(storableError(e)));
};

export const fetchSavedCoursesThunk = createAsyncThunk(
  'app/SavedCoursesPage/fetchSavedCourses',
  fetchSavedCoursesPayloadCreator
);

// ================ Slice ================ //

const resultIds = data =>
  data.data.filter(l => !l.attributes.deleted && l.attributes.state === 'published').map(l => l.id);

const savedCoursesPageSlice = createSlice({
  name: 'SavedCoursesPage',
  initialState: {
    fetchInProgress: false,
    fetchSavedCoursesError: null,
    currentPageResultIds: [],
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSavedCoursesThunk.pending, state => {
        state.fetchInProgress = true;
        state.fetchSavedCoursesError = null;
        state.currentPageResultIds = [];
      })
      .addCase(fetchSavedCoursesThunk.fulfilled, (state, action) => {
        state.fetchInProgress = false;
        state.currentPageResultIds = resultIds(action.payload.data);
      })
      .addCase(fetchSavedCoursesThunk.rejected, (state, action) => {
        console.error(action.payload || action.error);
        state.fetchInProgress = false;
        state.fetchSavedCoursesError = action.payload;
      });
  },
});

export default savedCoursesPageSlice.reducer;

// ================ Thunk action creators ================ //

export const fetchSavedCourses = config => (dispatch, getState, sdk) => {
  return dispatch(fetchSavedCoursesThunk(config));
};

// ================ Load data ================ //

export const loadData = (params, search, config) => dispatch => {
  return dispatch(fetchSavedCoursesThunk(config));
};
