import classNames from 'classnames';
import { useEffect, useState } from 'react';

import {
  InlineTextButton,
  LinkedLogo,
  Menu,
  MenuContent,
  MenuItem,
  MenuLabel,
  NamedLink,
} from '../../../../components';
import { ACCOUNT_SETTINGS_PAGES } from '../../../../routing/routeConfiguration';
import { FormattedMessage } from '../../../../util/reactIntl';
import { getCurrentUserTypeRoles } from '../../../../util/userHelpers';
import {
  MY_CLASSES_TAB,
  SAVED_FOR_LATER_TAB,
  PERSONAL_PROFILE_TAB,
  ACCOUNT_SETTINGS_TAB,
} from '../../../PersonalAreaPage/PersonalAreaPage';

import TopbarSearchForm from '../TopbarSearchForm/TopbarSearchForm';
import IconsCollection from '../../../../components/IconsCollection/IconsCollection';

import css from './TopbarDesktop.module.css';

const SignupLink = () => {
  return (
    <NamedLink id="signup-link" name="SignupPage" className={css.topbarLink}>
      <span className={css.topbarLinkLabel}>
        <FormattedMessage id="TopbarDesktop.signup" />
      </span>
    </NamedLink>
  );
};

const LoginLink = () => {
  return (
    <NamedLink id="login-link" name="LoginPage" className={css.LoginLink}>
      <span className={css.topbarLinkLabel}>
        <FormattedMessage id="TopbarDesktop.login" />
      </span>
    </NamedLink>
  );
};

const InboxLink = ({ notificationCount, inboxTab }) => {
  const notificationDot = notificationCount > 0 ? <div className={css.notificationDot} /> : null;
  return (
    <NamedLink
      id="inbox-link"
      className={css.topbarLink}
      name="InboxPage"
      params={{ tab: inboxTab }}
    >
      <span className={css.topbarLinkLabel}>
        <svg
          style={{ fill: 'transparent' }}
          width="25"
          height="25"
          viewBox="0 0 25 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M22.9167 5.2814V19.5837C22.9167 20.8483 21.7841 21.875 20.389 21.875H4.61106C3.216 21.875 2.08337 20.8483 2.08337 19.5837V5.2814C2.08337 4.01682 3.216 2.99012 4.61106 2.99012H20.389C21.7841 2.99012 22.9167 4.01682 22.9167 5.2814Z"
            stroke="#101828"
            stroke-width="2"
            stroke-miterlimit="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M22.9167 5.27577L12.5 14.7182L2.08334 5.27577"
            stroke="#101828"
            stroke-width="2"
            stroke-miterlimit="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>

        {/* <FormattedMessage id="TopbarDesktop.inbox" /> */}
        {notificationDot}
      </span>
    </NamedLink>
  );
};

const ProfileMenu = ({
  currentPage,
  currentUser,
  onLogout,
  showManageListingsLink,
  intl,
  config,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { provider: isProvider } = getCurrentUserTypeRoles(config, currentUser);

  const currentPageClass = page => {
    const isAccountSettingsPage =
      page === 'AccountSettingsPage' && ACCOUNT_SETTINGS_PAGES.includes(currentPage);
    return currentPage === page || isAccountSettingsPage ? css.currentPage : null;
  };

  const close = () => setIsOpen(false);

  return (
    <Menu isOpen={isOpen} onToggleActive={setIsOpen} skipFocusOnNavigation={true}>
      <MenuLabel
        id="profile-menu-label"
        className={css.profileMenuLabel}
        isOpenClassName={css.profileMenuIsOpen}
        ariaLabel={intl.formatMessage({ id: 'TopbarDesktop.screenreader.profileMenu' })}
      >
        <svg
          style={{ fill: 'transparent' }}
          width="25"
          height="25"
          viewBox="0 0 25 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20.8333 21.875V19.7917C20.8333 18.6866 20.3943 17.6268 19.6129 16.8454C18.8315 16.064 17.7717 15.625 16.6666 15.625H8.33329C7.22822 15.625 6.16842 16.064 5.38701 16.8454C4.60561 17.6268 4.16663 18.6866 4.16663 19.7917V21.875M16.6666 7.29167C16.6666 9.59285 14.8011 11.4583 12.5 11.4583C10.1988 11.4583 8.33329 9.59285 8.33329 7.29167C8.33329 4.99048 10.1988 3.125 12.5 3.125C14.8011 3.125 16.6666 4.99048 16.6666 7.29167Z"
            stroke="#101828"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* <Avatar className={css.avatar} user={currentUser} disableProfileLink /> */}
      </MenuLabel>
      <MenuContent className={css.profileMenuContent}>
        {/* Heading — Expert Dashboard (provider) or Personal Area (customer) */}
        <MenuItem key="menuHeading">
          <span className={css.menuHeading}>
            <FormattedMessage
              id={
                isProvider
                  ? 'TopbarDesktop.expertDashboardHeading'
                  : 'TopbarDesktop.personalAreaHeading'
              }
            />
          </span>
        </MenuItem>

        {/* Provider: My Listings */}
        {isProvider ? (
          <MenuItem key="MyListings">
            <div onClick={close}>
              <NamedLink className={css.menuLink} name="ManageListingsPage">
                <span className={css.menuItemBorder} />
                <span className={css.menuLinkRow}>
                  <IconsCollection iconName="my-listings" />
                  <span className={css.menuLinkLabel}>
                    <FormattedMessage id="TopbarDesktop.myListingsLink" />
                  </span>
                </span>
              </NamedLink>
            </div>
          </MenuItem>
        ) : null}

        {/* Customer: My Classes */}
        {!isProvider ? (
          <MenuItem key="MyClassesTab">
            <div onClick={close}>
              <NamedLink
                className={css.menuLink}
                name="PersonalAreaPage"
                params={{ tab: MY_CLASSES_TAB }}
              >
                <span className={css.menuItemBorder} />
                <span className={css.menuLinkRow}>
                  <IconsCollection iconName="my-classes" />
                  <span className={css.menuLinkLabel}>
                    <FormattedMessage id="TopbarDesktop.myClassesLink" />
                  </span>
                </span>
              </NamedLink>
            </div>
          </MenuItem>
        ) : null}

        {/* Customer: Saved for Later */}
        {!isProvider ? (
          <MenuItem key="SavedForLaterTab">
            <div onClick={close}>
              <NamedLink
                className={css.menuLink}
                name="PersonalAreaPage"
                params={{ tab: SAVED_FOR_LATER_TAB }}
              >
                <span className={css.menuItemBorder} />
                <span className={css.menuLinkRow}>
                  <IconsCollection iconName="saved-for-later" />
                  <span className={css.menuLinkLabel}>
                    <FormattedMessage id="TopbarDesktop.savedForLaterLink" />
                  </span>
                </span>
              </NamedLink>
            </div>
          </MenuItem>
        ) : null}

        {/* Account Settings (both) */}
        <MenuItem key="AccountSettings">
          <div onClick={close}>
            <NamedLink
              className={css.menuLink}
              name="PersonalAreaPage"
              params={{ tab: ACCOUNT_SETTINGS_TAB }}
            >
              <span className={css.menuItemBorder} />
              <span className={css.menuLinkRow}>
                <IconsCollection iconName="account-settings" />
                <span className={css.menuLinkLabel}>
                  <FormattedMessage id="TopbarDesktop.accountSettingsLink" />
                </span>
              </span>
            </NamedLink>
          </div>
        </MenuItem>

        {/* Provider: Reviews */}
        {isProvider ? (
          <MenuItem key="ExpertReviews">
            <div onClick={close}>
              <NamedLink className={css.menuLink} name="InboxPage" params={{ tab: 'sales' }}>
                <span className={css.menuItemBorder} />
                <span className={css.menuLinkRow}>
                  <IconsCollection iconName="reviews" />
                  <span className={css.menuLinkLabel}>
                    <FormattedMessage id="TopbarDesktop.reviewsLink" />
                  </span>
                </span>
              </NamedLink>
            </div>
          </MenuItem>
        ) : null}

        {/* Provider: Expert Profile / Customer: Public Profile */}
        <MenuItem key="profileLink">
          <div onClick={close}>
            <NamedLink
              className={css.menuLink}
              name={isProvider ? 'ProfileSettingsPage' : 'PersonalAreaPage'}
              params={isProvider ? undefined : { tab: PERSONAL_PROFILE_TAB }}
            >
              <span className={css.menuItemBorder} />
              <span className={css.menuLinkRow}>
                <IconsCollection
                  iconName={isProvider ? 'expert-profile' : 'public-profile'}
                />
                <span className={css.menuLinkLabel}>
                  <FormattedMessage
                    id={
                      isProvider
                        ? 'TopbarDesktop.expertProfileLink'
                        : 'TopbarDesktop.publicProfileLink'
                    }
                  />
                </span>
              </span>
            </NamedLink>
          </div>
        </MenuItem>

        <MenuItem key="logout">
          <InlineTextButton rootClassName={css.logoutButton} onClick={onLogout}>
            <span className={css.menuItemBorder} />
            <span className={css.logoutButtonRow}>
              <IconsCollection iconName="logout" />
              <span className={css.logoutButtonLabel}>
                <FormattedMessage id="TopbarDesktop.logout" />
              </span>
            </span>
          </InlineTextButton>
        </MenuItem>

        {/* Legacy menu items — kept for reference
        {showManageListingsLink ? (
          <MenuItem key="ManageListingsPage">
            <NamedLink
              className={classNames(css.menuLink, currentPageClass('ManageListingsPage'))}
              name="ManageListingsPage"
            >
              <span className={css.menuItemBorder} />
              <FormattedMessage id="TopbarDesktop.yourListingsLink" />
            </NamedLink>
          </MenuItem>
        ) : null}
        <MenuItem key="ProfileSettingsPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('ProfileSettingsPage'))}
            name="ProfileSettingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.profileSettingsLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="AccountSettingsPage">
          <NamedLink
            className={classNames(css.menuLink, currentPageClass('AccountSettingsPage'))}
            name="AccountSettingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.accountSettingsLink" />
          </NamedLink>
        </MenuItem>
        */}
      </MenuContent>
    </Menu>
  );
};

/**
 * Topbar for desktop layout
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to components own css.root
 * @param {string?} props.rootClassName overwrite components own css.root
 * @param {CurrentUser} props.currentUser API entity
 * @param {string?} props.currentPage
 * @param {boolean} props.isAuthenticated
 * @param {number} props.notificationCount
 * @param {Function} props.onLogout
 * @param {Function} props.onSearchSubmit
 * @param {Object?} props.initialSearchFormValues
 * @param {Object} props.intl
 * @param {Object} props.config
 * @param {boolean} props.showSearchForm
 * @param {boolean} props.showCreateListingsLink
 * @param {string} props.inboxTab
 * @returns {JSX.Element} search icon
 */
const TopbarDesktop = props => {
  const {
    className,
    config,
    customLinks,
    currentUser,
    currentPage,
    rootClassName,
    notificationCount = 0,
    intl,
    isAuthenticated,
    onLogout,
    onSearchSubmit,
    initialSearchFormValues = {},
    showSearchForm = false,
    showCreateListingsLink,
    inboxTab,
  } = props;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const marketplaceName = config.marketplaceName;
  const authenticatedOnClientSide = mounted && isAuthenticated;
  const isAuthenticatedOrJustHydrated = isAuthenticated || !mounted;

  const giveSpaceForSearch = customLinks == null || customLinks?.length === 0;
  const classes = classNames(rootClassName || css.root, className);

  const inboxLinkMaybe = authenticatedOnClientSide ? (
    <InboxLink notificationCount={notificationCount} inboxTab={inboxTab} />
  ) : null;

  const profileMenuMaybe = authenticatedOnClientSide ? (
    <ProfileMenu
      currentPage={currentPage}
      currentUser={currentUser}
      onLogout={onLogout}
      showManageListingsLink={showCreateListingsLink}
      intl={intl}
      config={config}
    />
  ) : null;

  const signupLinkMaybe = isAuthenticatedOrJustHydrated ? null : <SignupLink />;
  const loginLinkMaybe = isAuthenticatedOrJustHydrated ? null : <LoginLink />;

  const searchFormMaybe = showSearchForm ? (
    <TopbarSearchForm
      className={classNames(css.searchLink, { [css.takeAvailableSpace]: giveSpaceForSearch })}
      desktopInputRoot={css.topbarSearchWithLeftPadding}
      onSubmit={onSearchSubmit}
      initialValues={initialSearchFormValues}
      appConfig={config}
    />
  ) : (
    <div
      className={classNames(css.spacer, css.topbarSearchWithLeftPadding, {
        [css.takeAvailableSpace]: giveSpaceForSearch,
      })}
    />
  );

  return (
    <nav
      className={classes}
      aria-label={intl.formatMessage({ id: 'TopbarDesktop.screenreader.topbarNavigation' })}
    >
      <LinkedLogo
        id="logo-topbar-desktop"
        className={css.logoLink}
        layout="desktop"
        alt={intl.formatMessage({ id: 'TopbarDesktop.logo' }, { marketplaceName })}
        linkToExternalSite={config?.topbar?.logoLink}
      />
      {/* {searchFormMaybe} */}
      <div
        className={classNames(css.spacer, css.topbarSearchWithLeftPadding, {
          [css.takeAvailableSpace]: giveSpaceForSearch,
        })}
      >
        <NamedLink name="SearchPageForCourses" className={css.topbarLink}>
          <span className={css.topbarLinkLabel}>Courses</span>
        </NamedLink>
        <NamedLink name="SearchPageForSellers" className={css.topbarLink}>
          <span className={css.topbarLinkLabel}>Experts</span>
        </NamedLink>
      </div>

      {profileMenuMaybe}
      {inboxLinkMaybe}

      {/* {signupLinkMaybe} */}
      {loginLinkMaybe}
    </nav>
  );
};

export default TopbarDesktop;
