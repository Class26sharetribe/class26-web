import React from 'react';
import classNames from 'classnames';

import { Page } from '../../components';
import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';

import { getDerivedRenderData } from './SearchPage.shared';

import SearchErrors from './SearchErrors';

import css from './SearchPage.module.css';

/**
 * Shared page shell for explicit search pages.
 *
 * @param {Object} props
 * @returns {JSX.Element}
 */
const SearchPageShell = props => {
  const {
    intl,
    location,
    routeConfiguration,
    config,
    currentUser,
    scrollingDisabled,
    searchInProgress,
    searchListingsError,
    searchParams = {},
    pagination,
    listings = [],
    currentPathParams = {},
    titleMessageId,
    subtitleMessageId,
    children,
  } = props;

  const {
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
    listings,
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
            <h1 className={css.pageTitle}>{intl.formatMessage({ id: titleMessageId })}</h1>
            <p className={css.pageSubTitle}>{intl.formatMessage({ id: subtitleMessageId })}</p>
            <div
              className={classNames(css.listingsForGridVariant, {
                [css.newSearchInProgress]: !(listingsAreLoaded || searchListingsError),
              })}
            >
              <SearchErrors
                searchListingsError={searchListingsError}
                isValidDatesFilter={isValidDatesFilter}
              />
              {children}
            </div>
          </div>
        </div>
      </div>
      <FooterContainer />
    </Page>
  );
};

export default SearchPageShell;
