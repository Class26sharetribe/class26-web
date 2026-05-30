import React, { useMemo } from 'react';
import moment from 'moment-timezone';
import { useSelector } from 'react-redux';

import { parse } from '../../util/urlHelpers';
import { makeGetListingsByIdSelector } from '../../ducks/marketplaceData.duck';
import { isScrollingDisabled } from '../../ducks/ui.duck';

import SearchPageAccessWrapper from './SearchPageAccessWrapper';
import SearchPageShell from './SearchPageShell';
import SearchResultsPanel from './SearchResultsPanel/SearchResultsPanel';

import css from './SearchPage.module.css';
import { LISTING_TYPE_GROUP_COACHING } from '../../util/types';

export const isGroupCoachingListingActive = listing => {
  const { publicData: { listingType, sessionDates } = {}, availabilityPlan } =
    listing.attributes || {};

  if (listingType !== LISTING_TYPE_GROUP_COACHING) return true;
  if (!sessionDates || sessionDates.length === 0) return false;

  const timezone = availabilityPlan?.timezone || 'Asia/Calcutta';
  const now = moment().tz(timezone);

  const earliestSession = sessionDates.reduce((min, s) => {
    const dt = moment.tz(`${s.date} ${s.startTime || '00:00'}`, 'YYYY-MM-DD HH:mm', timezone);
    const minDt = moment.tz(`${min.date} ${min.startTime || '00:00'}`, 'YYYY-MM-DD HH:mm', timezone);
    return dt.isBefore(minDt) ? s : min;
  });

  const earliestDateTime = moment.tz(
    `${earliestSession.date} ${earliestSession.startTime || '00:00'}`,
    'YYYY-MM-DD HH:mm',
    timezone
  );

  return earliestDateTime.isAfter(now);
};

const SearchPageForCoursesComponent = props => {
  const {
    intl,
    listings = [],
    location,
    pagination,
    scrollingDisabled,
    searchInProgress,
    searchListingsError,
    searchParams,
    routeConfiguration,
    config,
    currentUser,
    params: currentPathParams = {},
  } = props;

  const filteredListings = listings.filter(isGroupCoachingListingActive);

  return (
    <SearchPageShell
      intl={intl}
      location={location}
      routeConfiguration={routeConfiguration}
      config={config}
      currentUser={currentUser}
      scrollingDisabled={scrollingDisabled}
      searchInProgress={searchInProgress}
      searchListingsError={searchListingsError}
      searchParams={searchParams}
      pagination={pagination}
      listings={filteredListings}
      currentPathParams={currentPathParams}
      titleMessageId="SearchPageForCourses.title"
      subtitleMessageId="SearchPageForCourses.subtitle"
    >
      <SearchResultsPanel
        className={css.searchListingsPanel}
        listings={filteredListings}
        pagination={pagination}
        search={parse(location.search)}
        isMapVariant={false}
        listingTypeParam={currentPathParams.listingType}
        intl={intl}
      />
    </SearchPageShell>
  );
};

/**
 * Course listing search page.
 *
 * @param {Object} props
 * @returns {JSX.Element}
 */
const SearchPageForCourses = props => {
  const selectListingsById = useMemo(makeGetListingsByIdSelector, []);
  const currentUser = useSelector(state => state.user?.currentUser);
  const { pagination, searchInProgress, searchListingsError, searchParams } = useSelector(
    state => state.SearchPage
  );
  const listings = useSelector(state =>
    selectListingsById(state, state.SearchPage.currentPageResultIds)
  );
  const scrollingDisabled = useSelector(state => isScrollingDisabled(state));

  return (
    <SearchPageAccessWrapper
      {...props}
      PageComponent={SearchPageForCoursesComponent}
      currentUser={currentUser}
      listings={listings}
      pagination={pagination}
      scrollingDisabled={scrollingDisabled}
      searchInProgress={searchInProgress}
      searchListingsError={searchListingsError}
      searchParams={searchParams}
    />
  );
};

export default SearchPageForCourses;
