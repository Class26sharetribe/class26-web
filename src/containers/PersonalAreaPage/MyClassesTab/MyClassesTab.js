import React, { useState } from 'react';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';

import ClassProgramCard from './ClassProgramCard';
import VideoCourseProgramCard from './VideoCourseProgramCard';
import DigitalDownloadProgramCard from './DigitalDownloadProgramCard';
import LearningCurveBanner from './LearningCurveBanner';
import FindYourNextClass from './FindYourNextClass';

import css from './MyClassesTab.module.css';

export const ACTIVE_FILTER = 'active';
export const LIFETIME_FILTER = 'lifetime';
export const PAST_FILTER = 'past';
export const CANCELED_FILTER = 'canceled';

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
  const [activeFilter, setActiveFilter] = useState(ACTIVE_FILTER);

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
        <ClassProgramCard />
        <VideoCourseProgramCard />
        <DigitalDownloadProgramCard />
      </div>

      <LearningCurveBanner />

      <FindYourNextClass />
    </div>
  );
};

export default MyClassesTab;
