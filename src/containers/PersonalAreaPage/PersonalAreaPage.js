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
import MyClassesTab from './MyClassesTab/MyClassesTab';

import css from './PersonalAreaPage.module.css';

export const MY_CLASSES_TAB = 'my-classes';
export const SAVED_FOR_LATER_TAB = 'saved-courses';
export const PERSONAL_PROFILE_TAB = 'profile';
export const ACCOUNT_SETTINGS_TAB = 'account-settings';

const TAB_CONTENT = {
  [PERSONAL_PROFILE_TAB]: <FormattedMessage id="PersonalAreaPage.personalProfileContent" />,
  [ACCOUNT_SETTINGS_TAB]: <FormattedMessage id="PersonalAreaPage.accountSettingsContent" />,
};

const TAB_DEFINITIONS = [
  {
    tab: MY_CLASSES_TAB,
    labelId: 'PersonalAreaPage.myClassesTab',
    iconName: 'my-classes',
    id: 'MyClassesTab',
  },
  {
    tab: SAVED_FOR_LATER_TAB,
    labelId: 'PersonalAreaPage.savedForLaterTab',
    iconName: 'saved-for-later',
    id: 'SavedForLaterTab',
  },
  {
    tab: PERSONAL_PROFILE_TAB,
    labelId: 'PersonalAreaPage.personalProfileTab',
    iconName: 'public-profile',
    id: 'ProfileTab',
  },
  {
    tab: ACCOUNT_SETTINGS_TAB,
    labelId: 'PersonalAreaPage.accountSettingsTab',
    iconName: 'account-settings',
    id: 'AccountSettingsTab',
  },
];

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

  const tabs = TAB_DEFINITIONS.map(({ tab, labelId, iconName, id }) => ({
    text: <FormattedMessage id={labelId} />,
    icon: <IconsCollection iconName={iconName} />,
    selected: currentTab === tab,
    id,
    linkProps: { name: 'PersonalAreaPage', params: { tab } },
  }));

  const activeTabDefinition =
    TAB_DEFINITIONS.find(({ tab }) => tab === currentTab) || TAB_DEFINITIONS[0];

  return (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <TopbarContainer />
      <div className={css.root}>
        <div className={css.headingSection}>
          <H1 className={css.heading}>
            <FormattedMessage id="PersonalAreaPage.heading" />
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
          ) : currentTab === MY_CLASSES_TAB ? (
            <div className={css.contentWrapper}>
              <MyClassesTab />
            </div>
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
