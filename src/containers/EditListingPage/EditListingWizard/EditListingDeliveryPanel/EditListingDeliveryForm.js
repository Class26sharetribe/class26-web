import React, { useEffect, useState } from 'react';
import { Form as FinalForm, Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';

// Import configs and util modules
import appSettings from '../../../../config/settings';
import { FormattedMessage, useIntl } from '../../../../util/reactIntl';
import { propTypes } from '../../../../util/types';
import { displayDeliveryPickup, displayDeliveryShipping } from '../../../../util/configHelpers';
import {
  autocompleteSearchRequired,
  autocompletePlaceSelected,
  composeValidators,
  required,
} from '../../../../util/validators';
import { generatePresignedUrl } from '../../../../util/api';

// Import shared components
import {
  Form,
  FieldLocationAutocompleteInput,
  Button,
  FieldCurrencyInput,
  FieldTextInput,
  FieldCheckbox,
  FieldSelect,
  IconDelete,
  InlineTextButton,
  ValidationError,
} from '../../../../components';

// Import modules from this directory
import css from './EditListingDeliveryForm.module.css';

const identity = v => v;

/**
 * File upload field component for the dynamic table
 */
const FileUploadField = props => {
  const { name, type, disabled, onChange, validate, listingId } = props;
  const intl = useIntl();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const accept =
    type === 'document'
      ? 'application/pdf,.pdf,.doc,.docx,.xls,.xlsx,.txt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain'
      : type === 'image'
      ? 'image/*'
      : type === 'video'
      ? 'video/*'
      : '';

  const uploadFile = async (file, input) => {
    try {
      setUploading(true);
      setUploadError(null);

      // Step 1: Get presigned URL from backend
      const response = await generatePresignedUrl({
        storagePath: `listings/${listingId}`,
        files: [{ name: file.name, type: file.type }],
      });

      if (!response.success || !response.data || response.data.length === 0) {
        throw new Error('Failed to get presigned URL');
      }

      const { url: presignedUrl, key } = response.data[0];

      // Step 2: Upload file to presigned URL
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      // Step 3: Store file metadata in form
      const fileData = {
        name: file.name,
        type: file.type,
        size: file.size,
        key,
      };

      input.onChange(fileData);
      if (onChange) {
        onChange(fileData);
      }

      setUploading(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError(error.message || 'Failed to upload file');
      setUploading(false);
    }
  };

  return (
    <Field name={name} validate={validate}>
      {({ input, meta }) => {
        const handleFileChange = e => {
          const file = e.target.files[0];
          if (file) {
            uploadFile(file, input);
          }
        };

        const hasError = (meta.touched && meta.error) || uploadError;
        const fileName = input.value?.name || '';
        const isDisabled = disabled || uploading;

        return (
          <div className={css.fileUploadWrapper}>
            <input
              type="file"
              id={input.name}
              name={input.name}
              accept={accept}
              onChange={handleFileChange}
              disabled={isDisabled}
              className={css.fileInput}
            />
            <label
              htmlFor={input.name}
              className={classNames(css.fileLabel, { [css.disabled]: isDisabled })}
            >
              {uploading
                ? intl.formatMessage({ id: 'EditListingDeliveryForm.uploading' })
                : fileName || intl.formatMessage({ id: 'EditListingDeliveryForm.chooseFile' })}
            </label>
            {hasError && (
              <div className={css.error}>{uploadError || <ValidationError fieldMeta={meta} />}</div>
            )}
          </div>
        );
      }}
    </Field>
  );
};

/**
 * Dynamic row component for the documents table
 */
const DocumentRow = props => {
  const { name, index, onRemove, fields, listingId } = props;
  const intl = useIntl();
  const rowValues = fields.value[index] || {};
  const selectedType = rowValues.type;

  const typeOptions = [
    { key: '', label: intl.formatMessage({ id: 'EditListingDeliveryForm.selectType' }) },
    { key: 'document', label: 'Document' },
    { key: 'image', label: 'Image' },
    { key: 'video', label: 'Video' },
  ];

  return (
    <tr className={css.tableRow}>
      <td className={css.tableCell}>{index + 1}</td>
      <td className={css.tableCell}>
        <FieldTextInput
          id={`${name}.name`}
          name={`${name}.name`}
          type="text"
          placeholder={intl.formatMessage({ id: 'EditListingDeliveryForm.namePlaceholder' })}
          validate={required(intl.formatMessage({ id: 'EditListingDeliveryForm.nameRequired' }))}
        />
      </td>
      <td className={css.tableCell}>
        <FieldSelect
          id={`${name}.type`}
          name={`${name}.type`}
          validate={required(intl.formatMessage({ id: 'EditListingDeliveryForm.typeRequired' }))}
        >
          {typeOptions.map(option => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </FieldSelect>
      </td>
      <td className={css.tableCell}>
        <FileUploadField
          name={`${name}.file`}
          type={selectedType}
          disabled={!selectedType}
          validate={required(intl.formatMessage({ id: 'EditListingDeliveryForm.fileRequired' }))}
          listingId={listingId}
        />
      </td>
      <td className={css.tableCell}>
        <InlineTextButton type="button" onClick={onRemove} className={css.removeButton}>
          <IconDelete rootClassName={css.deleteIcon} />
        </InlineTextButton>
      </td>
    </tr>
  );
};

/**
 * The EditListingDeliveryForm component.
 *
 * @component
 * @param {Object} props - The component props
 * @param {string} props.formId - The form ID
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {Function} props.onSubmit - The submit function
 * @param {string} props.saveActionMsg - The save action message
 * @param {Object} props.selectedPlace - The selected place
 * @param {string} props.marketplaceCurrency - The marketplace currency
 * @param {boolean} props.hasStockInUse - Whether the stock is in use
 * @param {boolean} props.disabled - Whether the form is disabled
 * @param {boolean} props.ready - Whether the form is ready
 * @param {boolean} props.updated - Whether the form is updated
 * @param {boolean} props.updateInProgress - Whether the form is in progress
 * @param {Object} props.fetchErrors - The fetch errors
 * @param {propTypes.error} [props.fetchErrors.showListingsError] - The show listings error
 * @param {propTypes.error} [props.fetchErrors.updateListingError] - The update listing error
 * @param {boolean} props.autoFocus - Whether the form is auto focused
 * @returns {JSX.Element} The EditListingDeliveryForm component
 */
export const EditListingDeliveryForm = props => {
  const [digitalAssetsComplete, setDigitalAssetsComplete] = useState(true);

  return (
    <FinalForm
      {...props}
      mutators={{ ...arrayMutators }}
      render={formRenderProps => {
        const {
          formId = 'EditListingDeliveryForm',
          form,
          autoFocus,
          className,
          disabled,
          ready,
          handleSubmit,
          pristine,
          invalid,
          listingTypeConfig,
          marketplaceCurrency,
          allowOrdersOfMultipleItems = false,
          saveActionMsg,
          updated,
          updateInProgress,
          fetchErrors,
          values,
          listingId,
        } = formRenderProps;
        const intl = useIntl();

        // Track if all digital assets are complete
        useEffect(() => {
          const digitalAssets = values.digitalAssets || [];
          const allComplete =
            digitalAssets.length === 0 ||
            digitalAssets.every(asset => asset.name && asset.type && asset.file);
          setDigitalAssetsComplete(allComplete);
        }, [values.digitalAssets]);

        // This is a bug fix for Final Form.
        // Without this, React will return a warning:
        //   "Cannot update a component (`ForwardRef(Field)`)
        //   while rendering a different component (`ForwardRef(Field)`)"
        // This seems to happen because validation calls listeneres and
        // that causes state to change inside final-form.
        // https://github.com/final-form/react-final-form/issues/751
        //
        // TODO: it might not be worth the trouble to show these fields as disabled,
        // if this fix causes trouble in future dependency updates.
        const { pauseValidation, resumeValidation } = form;
        pauseValidation(false);
        useEffect(() => resumeValidation(), [values]);

        const displayShipping = displayDeliveryShipping(listingTypeConfig);
        const displayPickup = displayDeliveryPickup(listingTypeConfig);
        const displayMultipleDelivery = displayShipping && displayPickup;
        const shippingEnabled = displayShipping && values.deliveryOptions?.includes('shipping');
        const pickupEnabled = displayPickup && values.deliveryOptions?.includes('pickup');

        const addressRequiredMessage = intl.formatMessage({
          id: 'EditListingDeliveryForm.addressRequired',
        });
        const addressNotRecognizedMessage = intl.formatMessage({
          id: 'EditListingDeliveryForm.addressNotRecognized',
        });

        const optionalText = intl.formatMessage({
          id: 'EditListingDeliveryForm.optionalText',
        });

        const { updateListingError, showListingsError } = fetchErrors || {};

        const classes = classNames(css.root, className);
        const submitReady = (updated && pristine) || ready;
        const submitInProgress = updateInProgress;
        const digitalAssets = values.digitalAssets || [];
        const hasIncompleteDigitalAssets = digitalAssets.length > 0 && !digitalAssetsComplete;
        const submitDisabled =
          invalid ||
          disabled ||
          submitInProgress ||
          // (!shippingEnabled && !pickupEnabled) ||
          hasIncompleteDigitalAssets ||
          digitalAssets.length === 0;

        console.log('submitDisabled', submitDisabled, hasIncompleteDigitalAssets);
        const shippingLabel = intl.formatMessage({ id: 'EditListingDeliveryForm.shippingLabel' });
        const pickupLabel = intl.formatMessage({ id: 'EditListingDeliveryForm.pickupLabel' });

        const pickupClasses = classNames({
          [css.deliveryOption]: displayMultipleDelivery,
          [css.disabled]: !pickupEnabled,
          [css.hidden]: !displayPickup,
        });
        const shippingClasses = classNames({
          [css.deliveryOption]: displayMultipleDelivery,
          [css.disabled]: !shippingEnabled,
          [css.hidden]: !displayShipping,
        });
        const currencyConfig = appSettings.getCurrencyFormatting(marketplaceCurrency);

        return (
          <Form className={classes} onSubmit={handleSubmit}>
            {/* <FieldCheckbox
            id={formId ? `${formId}.pickup` : 'pickup'}
            className={classNames(css.deliveryCheckbox, { [css.hidden]: !displayMultipleDelivery })}
            name="deliveryOptions"
            label={pickupLabel}
            value="pickup"
          />
          <div className={pickupClasses}>
            {updateListingError ? (
              <p className={css.error}>
                <FormattedMessage id="EditListingDeliveryForm.updateFailed" />
              </p>
            ) : null}

            {showListingsError ? (
              <p className={css.error}>
                <FormattedMessage id="EditListingDeliveryForm.showListingFailed" />
              </p>
            ) : null}

            <FieldLocationAutocompleteInput
              disabled={!pickupEnabled}
              rootClassName={css.input}
              inputClassName={css.locationAutocompleteInput}
              iconClassName={css.locationAutocompleteInputIcon}
              predictionsClassName={css.predictionsRoot}
              validClassName={css.validLocation}
              autoFocus={autoFocus}
              name="location"
              id={`${formId}.location`}
              label={intl.formatMessage({ id: 'EditListingDeliveryForm.address' })}
              placeholder={intl.formatMessage({
                id: 'EditListingDeliveryForm.addressPlaceholder',
              })}
              useDefaultPredictions={false}
              format={identity}
              valueFromForm={values.location}
              validate={
                pickupEnabled
                  ? composeValidators(
                      autocompleteSearchRequired(addressRequiredMessage),
                      autocompletePlaceSelected(addressNotRecognizedMessage)
                    )
                  : () => {}
              }
              hideErrorMessage={!pickupEnabled}
              // Whatever parameters are being used to calculate
              // the validation function need to be combined in such
              // a way that, when they change, this key prop
              // changes, thus reregistering this field (and its
              // validation function) with Final Form.
              // See example: https://codesandbox.io/s/changing-field-level-validators-zc8ei
              key={pickupEnabled ? 'locationValidation' : 'noLocationValidation'}
            />

            <FieldTextInput
              className={css.input}
              type="text"
              name="building"
              id={formId ? `${formId}.building` : 'building'}
              label={intl.formatMessage(
                { id: 'EditListingDeliveryForm.building' },
                { optionalText }
              )}
              placeholder={intl.formatMessage({
                id: 'EditListingDeliveryForm.buildingPlaceholder',
              })}
              disabled={!pickupEnabled}
            />
          </div>

          <FieldCheckbox
            id={formId ? `${formId}.shipping` : 'shipping'}
            className={classNames(css.deliveryCheckbox, { [css.hidden]: !displayMultipleDelivery })}
            name="deliveryOptions"
            label={shippingLabel}
            value="shipping"
          />

          <div className={shippingClasses}>
            <FieldCurrencyInput
              id={
                formId
                  ? `${formId}.shippingPriceInSubunitsOneItem`
                  : 'shippingPriceInSubunitsOneItem'
              }
              name="shippingPriceInSubunitsOneItem"
              className={css.input}
              label={intl.formatMessage({
                id: 'EditListingDeliveryForm.shippingOneItemLabel',
              })}
              placeholder={intl.formatMessage({
                id: 'EditListingDeliveryForm.shippingOneItemPlaceholder',
              })}
              currencyConfig={currencyConfig}
              disabled={!shippingEnabled}
              validate={
                shippingEnabled
                  ? required(
                      intl.formatMessage({
                        id: 'EditListingDeliveryForm.shippingOneItemRequired',
                      })
                    )
                  : null
              }
              hideErrorMessage={!shippingEnabled}
              // Whatever parameters are being used to calculate
              // the validation function need to be combined in such
              // a way that, when they change, this key prop
              // changes, thus reregistering this field (and its
              // validation function) with Final Form.
              // See example: https://codesandbox.io/s/changing-field-level-validators-zc8ei
              key={shippingEnabled ? 'oneItemValidation' : 'noOneItemValidation'}
            />

            {allowOrdersOfMultipleItems ? (
              <FieldCurrencyInput
                id={
                  formId
                    ? `${formId}.shippingPriceInSubunitsAdditionalItems`
                    : 'shippingPriceInSubunitsAdditionalItems'
                }
                name="shippingPriceInSubunitsAdditionalItems"
                className={css.input}
                label={intl.formatMessage({
                  id: 'EditListingDeliveryForm.shippingAdditionalItemsLabel',
                })}
                placeholder={intl.formatMessage({
                  id: 'EditListingDeliveryForm.shippingAdditionalItemsPlaceholder',
                })}
                currencyConfig={currencyConfig}
                disabled={!shippingEnabled}
                validate={
                  shippingEnabled
                    ? required(
                        intl.formatMessage({
                          id: 'EditListingDeliveryForm.shippingAdditionalItemsRequired',
                        })
                      )
                    : null
                }
                hideErrorMessage={!shippingEnabled}
                // Whatever parameters are being used to calculate
                // the validation function need to be combined in such
                // a way that, when they change, this key prop
                // changes, thus reregistering this field (and its
                // validation function) with Final Form.
                // See example: https://codesandbox.io/s/changing-field-level-validators-zc8ei
                key={shippingEnabled ? 'additionalItemsValidation' : 'noAdditionalItemsValidation'}
              />
            ) : null}
          </div> */}

            {/* Dynamic Digital Assets Table */}
            <div className={css.digitalAssetsSection}>
              <h3 className={css.sectionTitle}>
                <FormattedMessage id="EditListingDeliveryForm.digitalAssetsTitle" />
              </h3>

              <div className={css.tableWrapper}>
                <table className={css.table}>
                  <thead>
                    <tr className={css.tableHeader}>
                      <th className={css.tableHeaderCell}>
                        <FormattedMessage id="EditListingDeliveryForm.number" />
                      </th>
                      <th className={css.tableHeaderCell}>
                        <FormattedMessage id="EditListingDeliveryForm.name" />
                      </th>
                      <th className={css.tableHeaderCell}>
                        <FormattedMessage id="EditListingDeliveryForm.type" />
                      </th>
                      <th className={css.tableHeaderCell}>
                        <FormattedMessage id="EditListingDeliveryForm.file" />
                      </th>
                      <th className={css.tableHeaderCell}>
                        <FormattedMessage id="EditListingDeliveryForm.actions" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <FieldArray name="digitalAssets">
                      {({ fields }) => (
                        <>
                          {fields.length === 0 ? (
                            <tr>
                              <td colSpan="5" className={css.emptyState}>
                                <FormattedMessage id="EditListingDeliveryForm.noDigitalAssets" />
                              </td>
                            </tr>
                          ) : (
                            fields.map((name, index) => (
                              <DocumentRow
                                key={name}
                                name={name}
                                index={index}
                                fields={fields}
                                formApi={form}
                                onRemove={() => fields.remove(index)}
                                listingId={listingId}
                              />
                            ))
                          )}
                        </>
                      )}
                    </FieldArray>
                  </tbody>
                </table>
              </div>

              <Button
                type="button"
                onClick={() => {
                  form.mutators.push('digitalAssets', { name: '', type: '', file: null });
                }}
                disabled={hasIncompleteDigitalAssets}
              >
                <FormattedMessage id="EditListingDeliveryForm.addRow" />
              </Button>
            </div>

            <Button
              className={css.submitButton}
              type="submit"
              inProgress={submitInProgress}
              disabled={submitDisabled}
              ready={submitReady}
            >
              {saveActionMsg}
            </Button>
          </Form>
        );
      }}
    />
  );
};

export default EditListingDeliveryForm;
