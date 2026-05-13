import React from 'react';
import { useSelector } from 'react-redux';

import { useConfiguration } from '../../context/configurationContext';
import { FormattedMessage, useIntl } from '../../util/reactIntl';

import { IconSpinner, ListingCard } from '../../components';

import { getSavedListingsById } from './SavedCoursesPage.duck';
import css from './SavedCoursesPage.module.css';

const cardRenderSizes = `(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw`;

/**
 * Saved courses tab content — fetches and renders the current user's favourited listings.
 *
 * @component
 * @returns {JSX.Element}
 */
const SavedCoursesPage = () => {
  const config = useConfiguration();
  const intl = useIntl();

  const { fetchInProgress, fetchSavedCoursesError, currentPageResultIds } = useSelector(
    state => state.SavedCoursesPage
  );
  const listings = useSelector(state => getSavedListingsById(state, currentPageResultIds));

  let content;
  if (fetchInProgress) {
    content = <IconSpinner className={css.spinner} />;
  } else if (fetchSavedCoursesError) {
    content = (
      <p className={css.error}>
        <FormattedMessage id="SavedCoursesPage.fetchError" />
      </p>
    );
  } else if (listings.length === 0) {
    content = (
      <p className={css.noResults}>
        <FormattedMessage id="SavedCoursesPage.noSavedCourses" />
      </p>
    );
  } else {
    content = (
      <ul className={css.listingGrid} className={css.listingCards}>
        {listings.map(listing => (
          <li key={listing.id.uuid} className={css.resultItem}>
            <ListingCard
              className={css.listingCard}
              listing={listing}
              renderSizes={cardRenderSizes}
              cardVariant="course"
            />
          </li>
        ))}
      </ul>
    );
  }

  return <div className={css.root}>{content}</div>;
};

export default SavedCoursesPage;
