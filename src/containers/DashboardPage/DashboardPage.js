import React from 'react';
import { useSelector } from 'react-redux';

import { FormattedMessage, useIntl } from '../../util/reactIntl';

import { isScrollingDisabled } from '../../ducks/ui.duck';

import { H1, IconsCollection, Page, TabNav } from '../../components';

import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';
import ManageListingsPage from '../ManageListingsPage/ManageListingsPage';

import css from './DashboardPage.module.css';

export const MY_LISTINGS_TAB = 'courses';
export const REVIEWS_TAB = 'reviews';
export const EXPERT_PROFILE_TAB = 'profile';
export const ACCOUNT_SETTINGS_TAB = 'account-settings';

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
  const intl = useIntl();

  const currentTab = params?.tab || MY_LISTINGS_TAB;

  const title = intl.formatMessage({ id: 'DashboardPage.title' });

  const tabs = [
    {
      text: <FormattedMessage id="DashboardPage.myListingsTab" />,
      icon: <IconsCollection iconName="my-listings" />,
      selected: currentTab === MY_LISTINGS_TAB,
      id: 'MyListingsTab',
      linkProps: { name: 'DashboardPage', params: { tab: MY_LISTINGS_TAB } },
    },
    {
      text: <FormattedMessage id="DashboardPage.reviewsTab" />,
      icon: <IconsCollection iconName="reviews" />,
      selected: currentTab === REVIEWS_TAB,
      id: 'ReviewsTab',
      linkProps: { name: 'DashboardPage', params: { tab: REVIEWS_TAB } },
    },
    {
      text: <FormattedMessage id="DashboardPage.expertProfileTab" />,
      icon: <IconsCollection iconName="expert-profile" />,
      selected: currentTab === EXPERT_PROFILE_TAB,
      id: 'ExpertProfileTab',
      linkProps: { name: 'DashboardPage', params: { tab: EXPERT_PROFILE_TAB } },
    },
    {
      text: <FormattedMessage id="DashboardPage.accountSettingsTab" />,
      icon: <IconsCollection iconName="account-settings" />,
      selected: currentTab === ACCOUNT_SETTINGS_TAB,
      id: 'AccountSettingsTab',
      linkProps: { name: 'DashboardPage', params: { tab: ACCOUNT_SETTINGS_TAB } },
    },
  ];

  return (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <TopbarContainer />
      <div className={css.root}>
        <div className={css.headingSection}>
          <H1 className={css.heading}>
            <FormattedMessage id="DashboardPage.heading" />
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
          ) : null}
          <div className={css.contentWrapper}>
            {currentTab === REVIEWS_TAB ? (
              <FormattedMessage id="DashboardPage.reviewsContent" />
            ) : currentTab === EXPERT_PROFILE_TAB ? (
              <FormattedMessage id="DashboardPage.expertProfileContent" />
            ) : currentTab === ACCOUNT_SETTINGS_TAB ? (
              <FormattedMessage id="DashboardPage.accountSettingsContent" />
            ) : null}
          </div>
        </main>
      </div>
      <FooterContainer />
    </Page>
  );
};

export default DashboardPage;
