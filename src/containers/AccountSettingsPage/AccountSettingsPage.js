import React from 'react';
import { useSelector } from 'react-redux';

// ================ Configs / contexts / utils ================ //
import { useConfiguration } from '../../context/configurationContext';
import { showPaymentDetailsForUser } from '../../util/userHelpers';

// ================ Page containers ================ //
import ContactDetailsPage from '../ContactDetailsPage/ContactDetailsPage';
import PasswordChangePage from '../PasswordChangePage/PasswordChangePage';
import PaymentMethodsPage from '../PaymentMethodsPage/PaymentMethodsPage';
import StripePayoutPage from '../StripePayoutPage/StripePayoutPage';
import ManageAccountPage from '../ManageAccountPage/ManageAccountPage';

import css from './AccountSettingsPage.module.css';

/**
 * Combined account settings page.
 * Renders each existing settings page in embedded mode (no Page/LayoutSideNavigation wrapper)
 * so each section manages its own state and Redux connections.
 *
 * @returns {JSX.Element}
 */
const AccountSettingsPage = () => {
  const config = useConfiguration();
  const currentUser = useSelector(state => state.user.currentUser);

  const { showPaymentMethods, showPayoutDetails } = showPaymentDetailsForUser(config, currentUser);

  return (
    <div className={css.root}>
      <ContactDetailsPage embedded />
      <PasswordChangePage embedded />
      {showPayoutDetails ? <StripePayoutPage embedded /> : null}
      {showPaymentMethods ? <PaymentMethodsPage embedded /> : null}
      <ManageAccountPage embedded />
    </div>
  );
};

export default AccountSettingsPage;
