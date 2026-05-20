import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { getUsersById } from '../../ducks/marketplaceData.duck';
import { isScrollingDisabled } from '../../ducks/ui.duck';

import SearchPageAccessWrapper from './SearchPageAccessWrapper';
import SearchPageShell from './SearchPageShell';
import SearchResultsPanel from './SearchResultsPanel/SearchResultsPanel';

import css from './SearchPage.module.css';

const SearchPageForSellersComponent = props => {
  const {
    intl,
    sellers = [],
    location,
    pagination,
    scrollingDisabled,
    searchInProgress,
    searchListingsError,
    searchParams,
    routeConfiguration,
    config,
    currentUser,
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
      titleMessageId="SearchPageForSellers.title"
      subtitleMessageId="SearchPageForSellers.subtitle"
    >
      <SearchResultsPanel
        className={css.searchListingsPanel}
        sellers={sellers}
        pagination={null}
        search={{}}
        isMapVariant={false}
        intl={intl}
      />
    </SearchPageShell>
  );
};

/**
 * Seller user search page.
 *
 * @param {Object} props
 * @returns {JSX.Element}
 */
const SearchPageForSellers = props => {
  const currentUser = useSelector(state => state.user?.currentUser);
  const {
    pagination,
    searchInProgress,
    searchListingsError,
    searchParams,
    sellerRefs = [],
  } = useSelector(state => state.SearchPage);
  const realSellers = useSelector(state =>
    getUsersById(
      state,
      sellerRefs.filter(ref => ref.type === 'user').map(ref => ref.id)
    )
  );
  const sellers = useMemo(() => [...realSellers], [realSellers]);
  const scrollingDisabled = useSelector(state => isScrollingDisabled(state));

  return (
    <SearchPageAccessWrapper
      {...props}
      PageComponent={SearchPageForSellersComponent}
      currentUser={currentUser}
      sellers={sellers}
      pagination={pagination}
      scrollingDisabled={scrollingDisabled}
      searchInProgress={searchInProgress}
      searchListingsError={searchListingsError}
      searchParams={searchParams}
    />
  );
};

export default SearchPageForSellers;
