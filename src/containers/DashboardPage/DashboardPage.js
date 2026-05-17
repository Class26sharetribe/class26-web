import React from 'react';
import { useSelector } from 'react-redux';

import { FormattedMessage, useIntl } from '../../util/reactIntl';

import { isScrollingDisabled } from '../../ducks/ui.duck';

import { H1, IconsCollection, Page, TabNav } from '../../components';

import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';
import ManageListingsPage from '../ManageListingsPage/ManageListingsPage';
import AccountSettingsPage from '../AccountSettingsPage/AccountSettingsPage';
import ProfileSettingsTab from '../PersonalAreaPage/ProfileSettingsTab/ProfileSettingsTab';
import DashboardReviews from './DashboardReviews/DashboardReviews';

import css from './DashboardPage.module.css';
import {
  MY_LISTINGS_TAB,
  REVIEWS_TAB,
  EXPERT_PROFILE_TAB,
  ACCOUNT_SETTINGS_TAB,
  TAB_DEFINITIONS,
} from './DashboardPage.tabs';

export { MY_LISTINGS_TAB, REVIEWS_TAB, EXPERT_PROFILE_TAB, ACCOUNT_SETTINGS_TAB };

const STATIC_ANALYTICS = [
  { valueId: 'DashboardPage.analyticsSold', labelId: 'DashboardPage.analyticsLabelSold' },
  { valueId: 'DashboardPage.analyticsViews', labelId: 'DashboardPage.analyticsLabelViews' },
  { valueId: 'DashboardPage.analyticsEarnings', labelId: 'DashboardPage.analyticsLabelEarnings' },
];

/**
 * Dashboard page for experts with tab navigation and analytics overview.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.params - Route params
 * @param {string} props.params.tab - The active tab slug
 * @returns {JSX.Element}
 */
const DashboardPage = props => {
  const { params } = props;
  const scrollingDisabled = useSelector(isScrollingDisabled);
  const reviews = useSelector(state => state.DashboardPage?.reviews ?? []);
  const intl = useIntl();

  const currentTab = params?.tab || MY_LISTINGS_TAB;

  const title = intl.formatMessage({ id: 'DashboardPage.title' });

  const tabs = TAB_DEFINITIONS.map(({ tab, labelId, iconName, id }) => ({
    text: <FormattedMessage id={labelId} />,
    icon: <IconsCollection iconName={iconName} />,
    selected: currentTab === tab,
    id,
    linkProps: { name: 'DashboardPage', params: { tab } },
  }));

  const activeTabDefinition =
    TAB_DEFINITIONS.find(({ tab }) => tab === currentTab) || TAB_DEFINITIONS[0];

  return (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <TopbarContainer />
      <div className={css.root}>
        <div className={css.headingSection}>
          <H1 className={css.heading}>
            <FormattedMessage id="DashboardPage.heading" />
          </H1>
        </div>
        <div className={css.pageheadingSectionMobile}>
          <H1 className={css.mobileHeading}>
            <IconsCollection
              iconName={activeTabDefinition.iconName}
              className={css.mobileHeadingIcon}
            />
            <FormattedMessage id={activeTabDefinition.labelId} />
          </H1>
        </div>

        <div className={css.analyticsSection}>
          {STATIC_ANALYTICS.map(({ valueId, labelId }) => (
            <div key={valueId} className={css.analyticsCard}>
              <p className={css.analyticsValue}>
                <FormattedMessage id={valueId} />
              </p>
              <p className={css.analyticsLabel}>
                <FormattedMessage id={labelId} />
              </p>
            </div>
          ))}
        </div>

        <div className={css.tabNavWrapper}>
          <TabNav
            rootClassName={css.tabs}
            tabRootClassName={css.tab}
            tabs={tabs}
            ariaLabel={intl.formatMessage({ id: 'DashboardPage.screenreader.nav' })}
          />
        </div>

        <main id="main-content" className={css.content}>
          {currentTab === MY_LISTINGS_TAB ? (
            <ManageListingsPage embedded />
          ) : currentTab === REVIEWS_TAB ? (
            <DashboardReviews reviews={reviews} />
          ) : currentTab === EXPERT_PROFILE_TAB ? (
            <ProfileSettingsTab />
          ) : currentTab === ACCOUNT_SETTINGS_TAB ? (
            <AccountSettingsPage />
          ) : null}
          <div className={css.contentWrapper}></div>
        </main>
      </div>
      <FooterContainer />
    </Page>
  );
};

export default DashboardPage;
