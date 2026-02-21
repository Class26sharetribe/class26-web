import React, { useState } from 'react';
import classNames from 'classnames';

// Import configs and util modules
import { FormattedMessage } from '../../../../util/reactIntl';
import {
  LISTING_STATE_DRAFT,
  STOCK_INFINITE_MULTIPLE_ITEMS,
  STOCK_MULTIPLE_ITEMS,
  propTypes,
} from '../../../../util/types';
import { displayDeliveryPickup, displayDeliveryShipping } from '../../../../util/configHelpers';
import { types as sdkTypes } from '../../../../util/sdkLoader';

// Import shared components
import { H3, ListingLink } from '../../../../components';

// Import modules from this directory
import EditListingDeliveryForm from './EditListingDeliveryForm';
import css from './EditListingDeliveryPanel.module.css';

const { Money } = sdkTypes;

const getInitialValues = props => {
  const { listing } = props;
  const { privateData } = listing?.attributes || {};

  const { digitalAssets = [] } = privateData;

  // Initial values for the form
  return {
    digitalAssets,
  };
};

/**
 * The EditListingDeliveryPanel component.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.rootClassName] - Custom class that overrides the default class for the root element
 * @param {propTypes.ownListing} props.listing - The listing object
 * @param {Array<Object>} props.listingTypes - The active listing types configs
 * @param {string} props.marketplaceCurrency - The marketplace currency (e.g. 'USD')
 * @param {boolean} props.disabled - Whether the form is disabled
 * @param {boolean} props.ready - Whether the form is ready
 * @param {Function} props.onSubmit - The submit function
 * @param {string} props.submitButtonText - The submit button text
 * @param {boolean} props.panelUpdated - Whether the panel is updated
 * @param {boolean} props.updateInProgress - Whether the update is in progress
 * @param {Object} props.errors - The errors object
 * @param {Function} props.onManageDisableScrolling - Required by Modal children for scroll management
 * @returns {JSX.Element}
 */
const EditListingDeliveryPanel = props => {
  // State is needed since LocationAutocompleteInput doesn't have internal state
  // and therefore re-rendering would overwrite the values during XHR call.
  const [state, setState] = useState({ initialValues: getInitialValues(props) });

  const {
    className,
    rootClassName,
    listing,
    listingTypes,
    marketplaceCurrency,
    disabled,
    ready,
    onSubmit,
    submitButtonText,
    panelUpdated,
    updateInProgress,
    errors,
    onManageDisableScrolling,
    updatePageTitle: UpdatePageTitle,
    intl,
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const isPublished = listing?.id && listing?.attributes.state !== LISTING_STATE_DRAFT;
  const priceCurrencyValid = listing?.attributes?.price?.currency === marketplaceCurrency;
  const listingType = listing?.attributes?.publicData?.listingType;
  const listingTypeConfig = listingTypes.find(conf => conf.listingType === listingType);
  const allowOrdersOfMultipleItems = [STOCK_MULTIPLE_ITEMS, STOCK_INFINITE_MULTIPLE_ITEMS].includes(
    listingTypeConfig?.stockType
  );

  const panelHeadingProps = isPublished
    ? {
        id: 'EditListingDeliveryPanel.title',
        values: { listingTitle: <ListingLink listing={listing} />, lineBreak: <br /> },
        messageProps: { listingTitle: listing.attributes.title },
      }
    : {
        id: 'EditListingDeliveryPanel.createListingTitle',
        values: { lineBreak: <br /> },
        messageProps: {},
      };

  return (
    <main className={classes}>
      <UpdatePageTitle
        panelHeading={intl.formatMessage(
          { id: panelHeadingProps.id },
          { ...panelHeadingProps.messageProps }
        )}
      />
      <H3 as="h1">
        <FormattedMessage id={panelHeadingProps.id} values={{ ...panelHeadingProps.values }} />
      </H3>
      {priceCurrencyValid ? (
        <EditListingDeliveryForm
          className={css.form}
          initialValues={state.initialValues}
          onSubmit={values => {
            const { digitalAssets } = values;

            const updateValues = {
              publicData: {
                digitalAssetsInfo: digitalAssets.map(asset => ({
                  name: asset.name,
                  type: asset.type,
                })),
              },
              privateData: {
                digitalAssets,
              },
            };

            // Save the initialValues to state
            // LocationAutocompleteInput doesn't have internal state
            // and therefore re-rendering would overwrite the values during XHR call.
            setState({
              initialValues: {
                digitalAssets,
              },
            });
            onSubmit(updateValues);
          }}
          listingTypeConfig={listingTypeConfig}
          marketplaceCurrency={marketplaceCurrency}
          allowOrdersOfMultipleItems={allowOrdersOfMultipleItems}
          saveActionMsg={submitButtonText}
          disabled={disabled}
          ready={ready}
          updated={panelUpdated}
          updateInProgress={updateInProgress}
          fetchErrors={errors}
          onManageDisableScrolling={onManageDisableScrolling}
          listingId={listing.id.uuid}
        />
      ) : (
        <div className={css.priceCurrencyInvalid}>
          <FormattedMessage
            id="EditListingPricingPanel.listingPriceCurrencyInvalid"
            values={{ marketplaceCurrency }}
          />
        </div>
      )}
    </main>
  );
};

export default EditListingDeliveryPanel;
