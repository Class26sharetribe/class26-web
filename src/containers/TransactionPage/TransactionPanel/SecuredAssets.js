import classNames from 'classnames';
import React from 'react';
import { Heading } from '../../../components';
import { FormattedMessage } from '../../../util/reactIntl';
import css from './TransactionPanel.module.css';

const SecuredAssets = props => {
  const { className, rootClassName, protectedData } = props;
  const classes = classNames(rootClassName || css.deliveryInfoContainer, className);

  const { digitalAssets } = protectedData || {};

  if (!digitalAssets || digitalAssets.length === 0) {
    return null;
  }

  return (
    <div className={classes}>
      <Heading as="h3" rootClassName={css.sectionHeading}>
        <FormattedMessage id="TransactionPanel.securedAssetsHeading" />
      </Heading>
      <FormattedMessage
        id="TransactionPanel.securedAssetsNote"
        values={{ validFor: 432000 / 86400 }}
      />
      <div className={css.shippingInfoContent}>
        {digitalAssets.map(asset => (
          <div key={asset.name}>
            <li>
              <a href={asset.url} target="_blank" rel="noopener noreferrer">
                {asset.name}
              </a>{' '}
              ({asset.type})
            </li>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecuredAssets;
