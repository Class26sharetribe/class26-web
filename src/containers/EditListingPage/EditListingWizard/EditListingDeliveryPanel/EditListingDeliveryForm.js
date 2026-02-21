import * as UpChunk from '@mux/upchunk';
import classNames from 'classnames';
import arrayMutators from 'final-form-arrays';
import { useEffect, useRef, useState } from 'react';
import { Field, Form as FinalForm } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { generatePresignedUrl, getMuxAsset, getMuxUploadUrl } from '../../../../util/api';
import { displayDeliveryPickup, displayDeliveryShipping } from '../../../../util/configHelpers';
import { FormattedMessage, useIntl } from '../../../../util/reactIntl';
import { propTypes } from '../../../../util/types';
import { required } from '../../../../util/validators';
// Import shared components
import {
  Button,
  FieldSelect,
  FieldTextInput,
  Form,
  IconDelete,
  IconSynchronize,
  InlineTextButton,
  MuxPlayerModal,
  ValidationError,
} from '../../../../components';
// Import modules from this directory
import css from './EditListingDeliveryForm.module.css';

/**
 * File upload field component for the dynamic table.
 * - Images: upload to R2, show public URL as a link once uploaded.
 * - Videos: upload to Mux via UpChunk, show HLS stream URL as a link once ready.
 * - Documents: upload to R2, show filename label.
 */
const FileUploadField = props => {
  const { name, type, disabled, onChange, validate, listingId, onVideoClick } = props;
  const intl = useIntl();

  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const accept =
    type === 'document'
      ? 'application/pdf,.pdf,.doc,.docx,.xls,.xlsx,.txt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain'
      : type === 'image'
      ? 'image/*'
      : type === 'video'
      ? 'video/*'
      : '';

  /** Upload a video to Mux using UpChunk */
  const uploadVideoToMux = async (file, input) => {
    try {
      setUploading(true);
      setUploadError(null);
      setUploadProgress(0);

      const uploadData = await getMuxUploadUrl();

      if (!uploadData || !uploadData.url || !uploadData.id) {
        throw new Error('Failed to get upload URL from server');
      }

      const upload = UpChunk.createUpload({
        endpoint: uploadData.url,
        file,
        chunkSize: 5120,
      });

      upload.on('error', err => {
        console.error('Mux upload error:', err.detail);
        setUploadError('Upload failed. Please try again.');
        setUploading(false);
        setUploadProgress(0);
      });

      upload.on('progress', progress => {
        setUploadProgress(Math.round(progress.detail));
      });

      upload.on('success', async () => {
        try {
          let assetData = await getMuxAsset({ uploadId: uploadData.id });

          // if (assetData.state !== 'completed') {
          //   assetData = await waitForAssetReady(uploadData.id);
          // }

          const videoData = {
            asset_id: assetData.asset_id,
            playback_id: assetData.playback_id,
          };

          input.onChange(videoData);
          if (onChange) onChange(videoData);
          setUploading(false);
          setUploadProgress(0);
        } catch (err) {
          console.error('Error processing Mux asset:', err);
          setUploadError('Failed to process video. Please try again.');
          setUploading(false);
          setUploadProgress(0);
        }
      });
    } catch (error) {
      console.error('Error starting Mux upload:', error);
      setUploadError(error.message || 'Failed to upload video');
      setUploading(false);
    }
  };

  /** Upload an image (or document) to R2 via presigned URL */
  const uploadToR2 = async (file, input, isImage) => {
    try {
      setUploading(true);
      setUploadError(null);

      const response = await generatePresignedUrl({
        storagePath: `listings/${listingId}`,
        files: [{ name: file.name, type: file.type }],
      });

      if (!response.success || !response.data || response.data.length === 0) {
        throw new Error('Failed to get presigned URL');
      }

      const { url: presignedUrl, publicUrl, key } = response.data[0];

      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      const fileData = {
        name: file.name,
        type: file.type,
        size: file.size,
        url: publicUrl,
      };

      input.onChange(fileData);
      if (onChange) onChange(fileData);
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
          if (!file) return;
          // Clear the previous asset so the uploading state renders immediately
          input.onChange(null);
          if (type === 'video') {
            uploadVideoToMux(file, input);
          } else if (type === 'image') {
            uploadToR2(file, input, true);
          } else {
            uploadToR2(file, input, false);
          }
        };

        const hasError = (meta.touched && meta.error) || uploadError;
        const isDisabled = disabled || uploading;
        const triggerFileInput = () => fileInputRef.current?.click();

        // ── Video: show URL when playback_id is available ──
        const hasUploadedVideo = type === 'video' && input.value?.playback_id;
        if (hasUploadedVideo) {
          return (
            <div className={css.fileUploadWrapper}>
              <button
                type="button"
                className={css.uploadedFileLink}
                onClick={() => onVideoClick && onVideoClick(input.value.playback_id)}
              >
                {`https://stream.mux.com/${input.value.playback_id}.m3u8`}
              </button>
              {!disabled && (
                <button
                  type="button"
                  className={css.reuploadButton}
                  onClick={triggerFileInput}
                  title={intl.formatMessage({ id: 'EditListingDeliveryForm.reuploadAsset' })}
                >
                  <IconSynchronize rootClassName={css.reuploadIcon} />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                disabled={isDisabled}
                className={css.fileInput}
                aria-hidden="true"
                tabIndex={-1}
              />
              {hasError && (
                <div className={css.error}>
                  {uploadError || <ValidationError fieldMeta={meta} />}
                </div>
              )}
            </div>
          );
        }

        // ── Video: uploading state (progress bar) ──
        if (type === 'video' && uploading) {
          return (
            <div className={css.fileUploadWrapper}>
              <div className={css.uploadProgressContainer}>
                <div className={css.progressBar}>
                  <div className={css.progressBarFill} style={{ width: `${uploadProgress}%` }} />
                </div>
                <span className={css.uploadingText}>
                  {intl.formatMessage(
                    { id: 'EditListingDeliveryForm.uploadingProgress' },
                    { progress: uploadProgress }
                  )}
                </span>
              </div>
            </div>
          );
        }

        // ── Image: show URL when url is available ──
        const hasUploadedImage = type === 'image' && input.value?.url;
        if (hasUploadedImage) {
          return (
            <div className={css.fileUploadWrapper}>
              <a
                href={input.value.url}
                target="_blank"
                rel="noopener noreferrer"
                className={css.uploadedFileLink}
              >
                {input.value.url}
              </a>
              {!disabled && (
                <button
                  type="button"
                  className={css.reuploadButton}
                  onClick={triggerFileInput}
                  title={intl.formatMessage({ id: 'EditListingDeliveryForm.reuploadAsset' })}
                >
                  <IconSynchronize rootClassName={css.reuploadIcon} />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                disabled={isDisabled}
                className={css.fileInput}
                aria-hidden="true"
                tabIndex={-1}
              />
              {hasError && (
                <div className={css.error}>
                  {uploadError || <ValidationError fieldMeta={meta} />}
                </div>
              )}
            </div>
          );
        }

        // ── Document: show filename as a link when url is available ──
        const hasUploadedDocument = type === 'document' && input.value?.url;
        if (hasUploadedDocument) {
          return (
            <div className={css.fileUploadWrapper}>
              <a
                href={input.value.url}
                target="_blank"
                rel="noopener noreferrer"
                className={css.uploadedFileLink}
              >
                {input.value.name || input.value.url}
              </a>
              {!disabled && (
                <button
                  type="button"
                  className={css.reuploadButton}
                  onClick={triggerFileInput}
                  title={intl.formatMessage({ id: 'EditListingDeliveryForm.reuploadAsset' })}
                >
                  <IconSynchronize rootClassName={css.reuploadIcon} />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                disabled={isDisabled}
                className={css.fileInput}
                aria-hidden="true"
                tabIndex={-1}
              />
              {hasError && (
                <div className={css.error}>
                  {uploadError || <ValidationError fieldMeta={meta} />}
                </div>
              )}
            </div>
          );
        }

        // ── Document (and empty image/video): default file picker ──
        const fileName = input.value?.name || '';

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
  const { name, index, onRemove, fields, formApi, listingId, onVideoClick } = props;
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
          onChange={() => formApi.change(`${name}.file`, null)}
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
          onVideoClick={onVideoClick}
          validate={required(intl.formatMessage({ id: 'EditListingDeliveryForm.fileRequired' }))}
          listingId={listingId}
        />
      </td>
      <td className={classNames(css.tableCell, css.actionsCell)}>
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
  const { onManageDisableScrolling, ...formProps } = props;
  const [digitalAssetsComplete, setDigitalAssetsComplete] = useState(true);
  const [muxPlayerOpen, setMuxPlayerOpen] = useState(false);
  const [activePlaybackId, setActivePlaybackId] = useState(null);

  const handleVideoClick = playbackId => {
    setActivePlaybackId(playbackId);
    setMuxPlayerOpen(true);
  };

  const handlePlayerClose = () => {
    setMuxPlayerOpen(false);
    setActivePlaybackId(null);
  };

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
        // handleVideoClick comes from the outer component scope

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

        return (
          <Form className={classes} onSubmit={handleSubmit}>
            {muxPlayerOpen && (
              <MuxPlayerModal
                id="delivery-form-mux-player-modal"
                playbackId={activePlaybackId}
                isOpen={muxPlayerOpen}
                onClose={handlePlayerClose}
                onManageDisableScrolling={onManageDisableScrolling}
              />
            )}

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
                                onVideoClick={handleVideoClick}
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
