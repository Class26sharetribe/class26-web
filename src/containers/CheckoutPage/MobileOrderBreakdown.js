import React from 'react';

import { Heading } from '../../components';
import css from './CheckoutPage.module.css';

const MobileOrderBreakdown = props => {
  const {
    breakdown,
    speculateTransactionErrorMessage,
    priceVariantName,
    tags,
    courseHighlight,
    sessionInfo,
  } = props;

  return (
    <div className={css.priceBreakdownContainer}>
      {priceVariantName ? (
        <div className={css.bookingPriceVariantMobile}>
          <Heading as="h3" rootClassName={css.priceVariantNameMobile}>
            {priceVariantName}
          </Heading>
        </div>
      ) : null}
      {speculateTransactionErrorMessage}

      <div className={css.mobileInfo}>
        {tags}
        {courseHighlight}
        {sessionInfo}
      </div>
      {breakdown}
    </div>
  );
};

export default MobileOrderBreakdown;
