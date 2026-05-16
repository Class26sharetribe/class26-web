import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { formatMoney } from '../../util/currency';
import { types as sdkTypes } from '../../util/sdkLoader';

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
} from './DashboardPage.tabs';
import { fetchDashboardStats } from './DashboardPage.duck';

export { MY_LISTINGS_TAB, REVIEWS_TAB, EXPERT_PROFILE_TAB, ACCOUNT_SETTINGS_TAB };

const { Money } = sdkTypes;

const moneyFromStats = money => new Money(Number(money?.amount || 0), money?.currency || 'USD');

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
  const dispatch = useDispatch();
  const scrollingDisabled = useSelector(isScrollingDisabled);
  const reviews = useSelector(state => state.DashboardPage?.reviews ?? []);
  const stats = useSelector(state => state.DashboardPage?.stats);
  const statsError = useSelector(state => state.DashboardPage?.statsError);
  const intl = useIntl();

  const currentTab = params?.tab || MY_LISTINGS_TAB;
  const totals = stats?.totals || {};
  const statsUnavailable = !!statsError;
  const analytics = [
    {
      value: statsUnavailable ? '-' : intl.formatNumber(totals.listingsSold || 0),
      labelId: 'DashboardPage.analyticsLabelSold',
    },
    {
      value: statsUnavailable ? '-' : intl.formatNumber(totals.totalViews || 0),
      labelId: 'DashboardPage.analyticsLabelViews',
    },
    {
      value: statsUnavailable ? '-' : formatMoney(intl, moneyFromStats(totals.totalEarnings)),
      labelId: 'DashboardPage.analyticsLabelEarnings',
    },
  ];

  useEffect(() => {
    dispatch(fetchDashboardStats()).catch(() => null);
  }, [dispatch]);

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
          {analytics.map(({ value, labelId }) => (
            <div key={labelId} className={css.analyticsCard}>
              <p className={css.analyticsValue}>{value}</p>
              <p className={css.analyticsLabel}>
                <FormattedMessage id={labelId} />
              </p>
            </div>
          ))}
        </div>
        {statsUnavailable ? (
          <p className={css.analyticsUnavailable}>
            <FormattedMessage id="DashboardPage.analyticsUnavailable" />
          </p>
        ) : null}

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
