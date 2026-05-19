import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import { getMarketplaceEntities } from '../../../ducks/marketplaceData.duck';
import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { parse, stringify } from '../../../util/urlHelpers';
import {
  ACTIVE_FILTER,
  CANCELED_FILTER,
  LIFETIME_FILTER,
  PAST_FILTER,
} from '../PersonalAreaPage.duck';

import { IconSpinner } from '../../../components';

import DigitalDownloadProgramCard from './DigitalDownloadProgramCard';
import FindYourNextClass from './FindYourNextClass';
import LearningCurveBanner from './LearningCurveBanner';

import { LISTING_TYPE_DIGITAL_DOWNLOAD, LISTING_TYPE_VIDEO_COURSE } from '../../../util/types';
import css from './MyClassesTab.module.css';
import VideoCourseProgramCard from './VideoCourseProgramCard';
import { useConfiguration } from '../../../context/configurationContext';

const FILTER_TABS = [
  { id: ACTIVE_FILTER, labelId: 'MyClassesTab.filterActive' },
  { id: LIFETIME_FILTER, labelId: 'MyClassesTab.filterLifetime' },
  { id: PAST_FILTER, labelId: 'MyClassesTab.filterPast' },
  { id: CANCELED_FILTER, labelId: 'MyClassesTab.filterCanceled' },
];

/**
 * My Classes tab — filter tabs and enrolled program cards.
 *
 * @component
 * @returns {JSX.Element}
 */
const MyClassesTab = () => {
  const intl = useIntl();
  const location = useLocation();
  const history = useHistory();
  const config = useConfiguration();

  const { filter = ACTIVE_FILTER } = parse(location.search) || {};
  const activeFilter = filter;

  const setActiveFilter = newFilter => {
    const newSearch = stringify({ ...parse(location.search), filter: newFilter });
    history.push({ search: newSearch });
  };

  const transactionRefs = useSelector(state => state.PersonalAreaPage.transactionRefs);
  const fetchInProgress = useSelector(state => state.PersonalAreaPage.fetchInProgress);
  const transactions = useSelector(state => getMarketplaceEntities(state, transactionRefs));

  const filterTabsLabel = intl.formatMessage({ id: 'MyClassesTab.filterTabsAriaLabel' });

  return (
    <div className={css.root}>
      <div className={css.filterTabsWrapper} role="tablist" aria-label={filterTabsLabel}>
        {FILTER_TABS.map(({ id, labelId }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeFilter === id}
            className={classNames(css.filterTab, {
              [css.filterTabActive]: activeFilter === id,
            })}
            onClick={() => setActiveFilter(id)}
          >
            <FormattedMessage id={labelId} />
          </button>
        ))}
      </div>

      <div className={css.cardsList}>
        {fetchInProgress ? (
          <div className={css.spinnerWrapper}>
            <IconSpinner />
          </div>
        ) : transactions.length === 0 ? (
          <p className={css.noResults}>
            <FormattedMessage id="MyClassesTab.noResults" />
          </p>
        ) : (
          <>
            {transactions.map(tx => {
              const { title, publicData } = tx.listing.attributes;
              const { categoryLevel1, listingType, digitalAssets } = publicData;

              const categories = config.categoryConfiguration?.categories || [];
              const categoryLevel1Label = categoryLevel1
                ? categories.find(c => c.id === categoryLevel1)?.name || categoryLevel1
                : null;

              const validListingTypes = config.listing.listingTypes || [];
              const foundListingTypeConfig = validListingTypes.find(
                conf => conf.listingType === listingType
              );
              const listingTypeLabel = foundListingTypeConfig?.label || null;

              const imageUrl =
                tx.listing?.images?.[0]?.attributes?.variants?.['square-small2x']?.url || null;

              const tags = (
                <div className={css.tags}>
                  <span className={classNames(css.tag, css.tagGreen)}>{categoryLevel1Label}</span>
                  <span className={classNames(css.tag, css.tagNeutral)}>{listingTypeLabel}</span>
                </div>
              );

              if (listingType === LISTING_TYPE_DIGITAL_DOWNLOAD) {
                return (
                  <DigitalDownloadProgramCard
                    key={tx.id.uuid}
                    tx={tx}
                    imageUrl={imageUrl}
                    tags={tags}
                  />
                );
              } else if (listingType === LISTING_TYPE_VIDEO_COURSE) {
                return (
                  <VideoCourseProgramCard
                    key={tx.id.uuid}
                    tx={tx}
                    tags={tags}
                    imageUrl={imageUrl}
                  />
                );
              }
              return null;
            })}
          </>
        )}
      </div>

      <LearningCurveBanner />

      <FindYourNextClass />
    </div>
  );
};

export default MyClassesTab;
