import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { parse } from '../../util/urlHelpers';
import { makeGetListingsByIdSelector } from '../../ducks/marketplaceData.duck';
import { isScrollingDisabled } from '../../ducks/ui.duck';

import SearchPageAccessWrapper from './SearchPageAccessWrapper';
import SearchPageShell from './SearchPageShell';
import SearchResultsPanel from './SearchResultsPanel/SearchResultsPanel';

import css from './SearchPage.module.css';

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
      listings={listings}
      currentPathParams={currentPathParams}
      titleMessageId="SearchPageForCourses.title"
      subtitleMessageId="SearchPageForCourses.subtitle"
    >
      <SearchResultsPanel
        className={css.searchListingsPanel}
        listings={listings}
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
