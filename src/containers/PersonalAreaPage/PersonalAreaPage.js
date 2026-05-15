import React from 'react';
import { useSelector } from 'react-redux';

import { FormattedMessage, useIntl } from '../../util/reactIntl';

import { isScrollingDisabled } from '../../ducks/ui.duck';

import { H1, IconsCollection, Page, TabNav } from '../../components';

import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';
import SavedCoursesPage from '../SavedCoursesPage/SavedCoursesPage';
import AccountSettingsPage from '../AccountSettingsPage/AccountSettingsPage';
import ProfileSettingsTab from './ProfileSettingsTab/ProfileSettingsTab';

import css from './PersonalAreaPage.module.css';

export const MY_CLASSES_TAB = 'my-classes';
export const SAVED_FOR_LATER_TAB = 'saved-courses';
export const PERSONAL_PROFILE_TAB = 'profile';
export const ACCOUNT_SETTINGS_TAB = 'account-settings';

const TAB_CONTENT = {
  [MY_CLASSES_TAB]: <FormattedMessage id="PersonalAreaPage.myClassesContent" />,
  [PERSONAL_PROFILE_TAB]: <FormattedMessage id="PersonalAreaPage.personalProfileContent" />,
  [ACCOUNT_SETTINGS_TAB]: <FormattedMessage id="PersonalAreaPage.accountSettingsContent" />,
};

/**
 * Personal Area page with horizontal tab navigation.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.scrollingDisabled - Whether scrolling is disabled
 * @param {Object} props.params - Route params
 * @param {string} props.params.tab - The active tab slug
 * @returns {JSX.Element}
 */
export const PersonalAreaPageComponent = props => {
  const { params } = props;
  const scrollingDisabled = useSelector(isScrollingDisabled);
  const intl = useIntl();

  const currentTab = params?.tab || MY_CLASSES_TAB;

  const title = intl.formatMessage({ id: 'PersonalAreaPage.title' });

  const tabs = [
    {
      text: <FormattedMessage id="PersonalAreaPage.myClassesTab" />,
      icon: <IconsCollection iconName="my-classes" />,
      selected: currentTab === MY_CLASSES_TAB,
      id: 'MyClassesTab',
      linkProps: { name: 'PersonalAreaPage', params: { tab: MY_CLASSES_TAB } },
    },
    {
      text: <FormattedMessage id="PersonalAreaPage.savedForLaterTab" />,
      icon: <IconsCollection iconName="saved-for-later" />,
      selected: currentTab === SAVED_FOR_LATER_TAB,
      id: 'SavedForLaterTab',
      linkProps: { name: 'PersonalAreaPage', params: { tab: SAVED_FOR_LATER_TAB } },
    },
    {
      text: <FormattedMessage id="PersonalAreaPage.personalProfileTab" />,
      icon: <IconsCollection iconName="public-profile" />,
      selected: currentTab === PERSONAL_PROFILE_TAB,
      id: 'ProfileTab',
      linkProps: { name: 'PersonalAreaPage', params: { tab: PERSONAL_PROFILE_TAB } },
    },
    {
      text: <FormattedMessage id="PersonalAreaPage.accountSettingsTab" />,
      icon: <IconsCollection iconName="account-settings" />,
      selected: currentTab === ACCOUNT_SETTINGS_TAB,
      id: 'AccountSettingsTab',
      linkProps: { name: 'PersonalAreaPage', params: { tab: ACCOUNT_SETTINGS_TAB } },
    },
  ];

  return (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <TopbarContainer />
      <div className={css.root}>
        <div className={css.headingSection}>
          <H1 className={css.heading}>
            <FormattedMessage id="PersonalAreaPage.heading" />
          </H1>
        </div>
        <div className={css.tabNavWrapper}>
          <TabNav
            rootClassName={css.tabs}
            tabRootClassName={css.tab}
            tabs={tabs}
            ariaLabel={intl.formatMessage({ id: 'PersonalAreaPage.screenreader.nav' })}
          />
        </div>
        <main id="main-content" className={css.content}>
          {currentTab === SAVED_FOR_LATER_TAB ? (
            <SavedCoursesPage />
          ) : currentTab === PERSONAL_PROFILE_TAB ? (
            <ProfileSettingsTab />
          ) : currentTab === ACCOUNT_SETTINGS_TAB ? (
            <AccountSettingsPage />
          ) : (
            <div className={css.contentWrapper}>
              {TAB_CONTENT[currentTab]}
            </div>
          )}
        </main>
      </div>
      <FooterContainer />
    </Page>
  );
};

const PersonalAreaPage = PersonalAreaPageComponent;

export default PersonalAreaPage;
