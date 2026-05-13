import React, { Component, useMemo } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';

import { mockSellerUsers } from '../../config/configMockSellers';
import { getUsersById } from '../../ducks/marketplaceData.duck';
import { isScrollingDisabled } from '../../ducks/ui.duck';

import { Page } from '../../components';
import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';

import { getDerivedRenderData } from './SearchPage.shared';

import SearchResultsPanel from './SearchResultsPanel/SearchResultsPanel';
import SearchPageAccessWrapper from './SearchPageAccessWrapper';
import SearchErrors from './SearchErrors';

import css from './SearchPage.module.css';

export class SearchPageComponent extends Component {
  render() {
    const {
      intl,
      listings = [],
      location,
      pagination,
      scrollingDisabled,
      searchInProgress,
      searchListingsError,
      searchParams = {},
      routeConfiguration,
      config,
      params: currentPathParams = {},
      currentUser,
    } = this.props;

    const {
      listingTypePathParam,
      validQueryParams,
      isValidDatesFilter,
      listingsAreLoaded,
      title,
      description,
      schema,
    } = getDerivedRenderData({
      intl,
      location,
      config,
      routeConfiguration,
      searchParams,
      pagination,
      listings: [],
      searchInProgress,
      currentPathParams,
      currentUser,
    });

    return (
      <Page
        scrollingDisabled={scrollingDisabled}
        description={description}
        title={title}
        schema={schema}
      >
        <TopbarContainer rootClassName={css.topbar} currentSearchParams={validQueryParams} />
        <div className={css.layoutWrapperContainer}>
          <div id="main-content" className={css.layoutWrapperMain} role="main">
            <div className={css.searchResultContainer}>
              <h1 className={css.pageTitle}>Top-Notch Teachers</h1>
              <p className={css.pageSubTitle}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur facilisis sem
                finibus erat euismod, sit amet mattis mauris tincidunt.
              </p>
              <div
                className={classNames(css.listingsForGridVariant, {
                  [css.newSearchInProgress]: !(listingsAreLoaded || searchListingsError),
                })}
              >
                <SearchErrors
                  searchListingsError={searchListingsError}
                  isValidDatesFilter={isValidDatesFilter}
                />
                <SearchResultsPanel
                  className={css.searchListingsPanel}
                  sellers={listings}
                  pagination={null}
                  search={{}}
                  isMapVariant={false}
                  listingTypeParam={listingTypePathParam}
                  intl={intl}
                />
              </div>
            </div>
          </div>
        </div>
        <FooterContainer />
      </Page>
    );
  }
}

/**
 * SearchPage "container" (grid layout): selects Redux state and dispatch handlers, then passes the
 * same prop surface as before to `SearchPageComponent` via `SearchPageAccessWrapper`.
 *
 * @param {Object} props - Router / route props from `routeConfiguration.js` and `Routes.js`
 * @returns {JSX.Element}
 */
const SearchPage = props => {
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
  const sellers = useMemo(() => [...realSellers, ...mockSellerUsers], [realSellers]);
  const scrollingDisabled = useSelector(state => isScrollingDisabled(state));

  return (
    <SearchPageAccessWrapper
      {...props}
      PageComponent={SearchPageComponent}
      currentUser={currentUser}
      listings={sellers}
      pagination={pagination}
      scrollingDisabled={scrollingDisabled}
      searchInProgress={searchInProgress}
      searchListingsError={searchListingsError}
      searchParams={searchParams}
    />
  );
};

export default SearchPage;
