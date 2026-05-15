import React, { Component } from 'react';
import { compose } from 'redux';
import { Field, Form as FinalForm } from 'react-final-form';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import arrayMutators from 'final-form-arrays';

import { FormattedMessage, injectIntl, intlShape } from '../../../util/reactIntl';
import { ensureCurrentUser } from '../../../util/data';
import { propTypes } from '../../../util/types';
import * as validators from '../../../util/validators';
import { isUploadImageOverLimitError } from '../../../util/errors';
import { getPropsForCustomUserFieldInputs } from '../../../util/userHelpers';

import {
  Form,
  Avatar,
  Button,
  ImageFromFile,
  IconSpinner,
  FieldTextInput,
  H4,
  CustomExtendedDataField,
} from '../../../components';

import UsernameInputRow from './UsernameInputRow';
import FieldUrlInput from '../../ExpertSignupPage/ExpertSignupForm/FieldUrlInput';
import {
  linkedinFieldIcon as LinkedinFieldIcon,
  instagramFieldIcon as InstagramFieldIcon,
  xFieldIcon as XFieldIcon,
  youtubeFieldIcon as YoutubeFieldIcon,
  websiteFieldIcon as WebsiteFieldIcon,
} from '../../PageBuilder/Primitives/Link/Icons';
import css from './ProfileSettingsForm.module.css';

const ACCEPT_IMAGES = 'image/*';
const UPLOAD_CHANGE_DELAY = 2000; // Show spinner so that browser has time to load img srcset
const BIO_MAX_LENGTH = 500;

const DisplayNameMaybe = props => {
  const { userTypeConfig, intl } = props;

  const isDisabled = userTypeConfig?.defaultUserFields?.displayName === false;
  if (isDisabled) {
    return null;
  }

  const { required } = userTypeConfig?.displayNameSettings || {};
  const isRequired = required === true;

  const validateMaybe = isRequired
    ? {
      validate: validators.required(
        intl.formatMessage({
          id: 'ProfileSettingsForm.displayNameRequired',
        })
      ),
    }
    : {};

  return (
    <div className={css.sectionContainer}>
      <div className={css.usernameContainer}>
        <h2 className={css.sectionTitle}>{intl.formatMessage({
          id: 'ProfileSettingsForm.displayNameLabel',
        })}</h2>
        <FieldTextInput
          className={css.row}
          type="text"
          id="displayName"
          name="displayName"
          label={""}
          placeholder={intl.formatMessage({
            id: 'ProfileSettingsForm.displayNamePlaceholder',
          })}
          {...validateMaybe}
        />
      </div>

    </div>
  );
};

/**
 * ProfileSettingsForm
 * TODO: change to functional component
 *
 * @component
 * @param {Object} props
 * @param {string} [props.rootClassName] - Custom class that overrides the default class for the root element
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.formId] - The form id
 * @param {propTypes.currentUser} props.currentUser - The current user
 * @param {Object} props.userTypeConfig - The user type config
 * @param {string} props.userTypeConfig.userType - The user type
 * @param {Array<Object>} props.userFields - The user fields
 * @param {Object} [props.profileImage] - The profile image
 * @param {string} props.marketplaceName - The marketplace name
 * @param {Function} props.onImageUpload - The function to handle image upload
 * @param {Function} props.onSubmit - The function to handle form submission
 * @param {boolean} props.uploadInProgress - Whether the upload is in progress
 * @param {propTypes.error} [props.uploadImageError] - The upload image error
 * @param {boolean} props.updateInProgress - Whether the update is in progress
 * @param {propTypes.error} [props.updateProfileError] - The update profile error
 * @param {intlShape} props.intl - The intl object
 * @returns {JSX.Element}
 */
class ProfileSettingsFormComponent extends Component {
  constructor(props) {
    super(props);

    this.uploadDelayTimeoutId = null;
    this.state = { uploadDelay: false, usernameStatus: 'idle' };
    this.submittedValues = {};
  }

  componentDidUpdate(prevProps) {
    // Upload delay is additional time window where Avatar is added to the DOM,
    // but not yet visible (time to load image URL from srcset)
    if (prevProps.uploadInProgress && !this.props.uploadInProgress) {
      this.setState({ uploadDelay: true });
      this.uploadDelayTimeoutId = window.setTimeout(() => {
        this.setState({ uploadDelay: false });
      }, UPLOAD_CHANGE_DELAY);
    }
  }

  componentWillUnmount() {
    window.clearTimeout(this.uploadDelayTimeoutId);
  }

  render() {
    return (
      <FinalForm
        {...this.props}
        keepDirtyOnReinitialize
        mutators={{ ...arrayMutators }}
        render={fieldRenderProps => {
          const {
            className,
            currentUser,
            handleSubmit,
            intl,
            invalid,
            onImageUpload,
            pristine,
            profileImage,
            rootClassName,
            updateInProgress,
            updateProfileError,
            uploadImageError,
            uploadInProgress,
            form,
            formId,
            marketplaceName,
            marketplaceRootURL,
            values,
            userFields,
            userTypeConfig,
          } = fieldRenderProps;

          const user = ensureCurrentUser(currentUser);

          // First name
          const firstNameLabel = intl.formatMessage({
            id: 'ProfileSettingsForm.firstNameLabel',
          });
          const firstNamePlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.firstNamePlaceholder',
          });
          const firstNameRequiredMessage = intl.formatMessage({
            id: 'ProfileSettingsForm.firstNameRequired',
          });
          const firstNameRequired = validators.required(firstNameRequiredMessage);

          // Last name
          const lastNameLabel = intl.formatMessage({
            id: 'ProfileSettingsForm.lastNameLabel',
          });
          const lastNamePlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.lastNamePlaceholder',
          });
          const lastNameRequiredMessage = intl.formatMessage({
            id: 'ProfileSettingsForm.lastNameRequired',
          });
          const lastNameRequired = validators.required(lastNameRequiredMessage);

          // Bio
          const bioLabel = intl.formatMessage({
            id: 'ProfileSettingsForm.bioLabel',
          });
          const bioPlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.bioPlaceholder',
          });

          // Social links
          const linkedinPlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.linkedinPlaceholder',
          });
          const instagramPlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.instagramPlaceholder',
          });
          const twitterPlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.twitterPlaceholder',
          });
          const youtubePlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.youtubePlaceholder',
          });
          const websitePlaceholder = intl.formatMessage({
            id: 'ProfileSettingsForm.websitePlaceholder',
          });

          const uploadingOverlay =
            uploadInProgress || this.state.uploadDelay ? (
              <div className={css.uploadingImageOverlay}>
                <IconSpinner />
              </div>
            ) : null;

          const hasUploadError = !!uploadImageError && !uploadInProgress;
          const errorClasses = classNames({ [css.avatarUploadError]: hasUploadError });
          const transientUserProfileImage = profileImage.uploadedImage || user.profileImage;
          const transientUser = { ...user, profileImage: transientUserProfileImage };

          // Ensure that file exists if imageFromFile is used
          const fileExists = !!profileImage.file;
          const fileUploadInProgress = uploadInProgress && fileExists;
          const delayAfterUpload = profileImage.imageId && this.state.uploadDelay;
          const imageFromFile =
            fileExists && (fileUploadInProgress || delayAfterUpload) ? (
              <ImageFromFile
                id={profileImage.id}
                className={errorClasses}
                rootClassName={css.uploadingImage}
                aspectWidth={1}
                aspectHeight={1}
                file={profileImage.file}
              >
                {uploadingOverlay}
              </ImageFromFile>
            ) : null;

          // Avatar is rendered in hidden during the upload delay
          // Upload delay smoothes image change process:
          // responsive img has time to load srcset stuff before it is shown to user.
          const avatarClasses = classNames(errorClasses, css.avatar, {
            [css.avatarInvisible]: this.state.uploadDelay,
          });
          const avatarComponent =
            !fileUploadInProgress && profileImage.imageId ? (
              <Avatar
                className={avatarClasses}
                renderSizes="(max-width: 767px) 96px, 240px"
                user={transientUser}
                disableProfileLink
              />
            ) : null;

          const submitError = updateProfileError ? (
            <div className={css.error}>
              <FormattedMessage id="ProfileSettingsForm.updateProfileFailed" />
            </div>
          ) : null;

          const classes = classNames(rootClassName || css.root, className);
          const submitInProgress = updateInProgress;
          const submittedOnce = Object.keys(this.submittedValues).length > 0;
          const pristineSinceLastSubmit = submittedOnce && isEqual(values, this.submittedValues);
          const usernameBlocking =
            this.state.usernameStatus === 'checking' || this.state.usernameStatus === 'taken';
          const submitDisabled =
            invalid ||
            pristine ||
            pristineSinceLastSubmit ||
            uploadInProgress ||
            submitInProgress ||
            usernameBlocking;

          const userFieldProps = getPropsForCustomUserFieldInputs(
            userFields,
            userTypeConfig?.userType,
            false
          );

          return (
            <Form
              className={classes}
              onSubmit={e => {
                this.submittedValues = values;
                handleSubmit(e);
              }}
            >
              <div className={css.sectionContainer}>
                <div className={css.usernameContainer}>
                  <H4 as="h2" className={css.sectionTitle}>
                    <FormattedMessage id="ProfileSettingsForm.usernameLabel" />
                  </H4>
                  <Field name="username">
                    {fieldProps => (
                      <UsernameInputRow
                        input={fieldProps.input}
                        meta={fieldProps.meta}
                        marketplaceRootURL={marketplaceRootURL ? marketplaceRootURL + '/u' : ''}
                        currentUsername={values.currentUsername}
                        onStatusChange={status => this.setState({ usernameStatus: status })}
                      />
                    )}
                  </Field>
                </div>
              </div>

              <div className={css.sectionContainer}>
                <div className={css.profilePictureRow}>
                  <div className={css.profilePictureInfo}>
                    <H4 as="h2" className={css.sectionTitle}>
                      <FormattedMessage id="ProfileSettingsForm.yourProfilePicture" />
                    </H4>
                    <p className={css.profilePictureSubtitle}>
                      <FormattedMessage id="ProfileSettingsForm.profilePictureSubtitle" />
                    </p>
                  </div>
                  <div className={css.profilePictureCurrentAvatar}>
                    {fileUploadInProgress || delayAfterUpload ? (
                      <div className={css.avatarUploadSpinner}>
                        <IconSpinner />
                      </div>
                    ) : (
                      avatarComponent || null
                    )}
                  </div>
                  <Field
                    accept="image/jpeg,image/png"
                    id="profileImage"
                    name="profileImage"
                    type="file"
                    form={null}
                    uploadImageError={uploadImageError}
                    disabled={uploadInProgress}
                  >
                    {fieldProps => {
                      const { accept, id, input, disabled, uploadImageError } = fieldProps;
                      const { name, type } = input;
                      const onChange = e => {
                        const file = e.target.files[0];
                        form.change(`profileImage`, file);
                        form.blur(`profileImage`);
                        if (file != null) {
                          const tempId = `${file.name}_${Date.now()}`;
                          onImageUpload({ id: tempId, file });
                        }
                      };

                      let error = null;

                      if (isUploadImageOverLimitError(uploadImageError)) {
                        error = (
                          <div className={css.error}>
                            <FormattedMessage id="ProfileSettingsForm.imageUploadFailedFileTooLarge" />
                          </div>
                        );
                      } else if (uploadImageError) {
                        error = (
                          <div className={css.error}>
                            <FormattedMessage id="ProfileSettingsForm.imageUploadFailed" />
                          </div>
                        );
                      }

                      return (
                        <div className={css.uploadZoneOuter}>
                          <label className={css.uploadZone} htmlFor={id}>
                            <div className={css.uploadIconCircle}>
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                aria-hidden="true"
                              >
                                <path
                                  d="M13.333 13.333 10 10m0 0L6.667 13.333M10 10v7.5M16.992 15.325A4.167 4.167 0 0 0 15 7.5h-1.05A6.667 6.667 0 1 0 3.334 14.167"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                            <span className={css.uploadZoneClickText}>
                              <FormattedMessage id="ProfileSettingsForm.clickToUpload" />
                            </span>
                            <span className={css.uploadZoneFormats}>
                              <FormattedMessage id="ProfileSettingsForm.fileInfo" />
                            </span>
                          </label>
                          <input
                            accept={accept}
                            id={id}
                            name={name}
                            className={css.uploadAvatarInput}
                            disabled={disabled}
                            onChange={onChange}
                            type={type}
                          />
                          {error}
                        </div>
                      );
                    }}
                  </Field>
                </div>
              </div>
              <div className={css.sectionContainer}>
                <div className={css.usernameContainer}>

                  <h2 className={css.sectionTitle}>{firstNameLabel}</h2>

                  <FieldTextInput
                    // className={css.firstName}
                    type="text"
                    id="firstName"
                    name="firstName"
                    label={""}
                    placeholder={firstNamePlaceholder}
                    validate={firstNameRequired}
                  />
                </div>

                {/* <div className={css.nameContainer}>
                </div> */}


              </div>
              <div className={css.sectionContainer}>
                <div className={css.usernameContainer}>
                  <h2 className={css.sectionTitle}>{lastNameLabel}</h2>
                  <FieldTextInput
                    // className={css.lastName}
                    type="text"
                    id="lastName"
                    name="lastName"
                    label={""}
                    placeholder={lastNamePlaceholder}
                    validate={lastNameRequired}
                  />
                </div>
              </div>

              <DisplayNameMaybe userTypeConfig={userTypeConfig} intl={intl} />

              <div className={classNames(css.sectionContainer)}>
                <div className={css.usernameContainer}>
                  <h2 className={css.sectionTitle}>{bioLabel}</h2>
                  <div>
                    <FieldTextInput
                      type="textarea"
                      id="bio"
                      name="bio"
                      label={"Description"}
                      placeholder={bioPlaceholder}
                      maxLength={BIO_MAX_LENGTH}
                    />
                    <p className={css.bioCharCount}>
                      {BIO_MAX_LENGTH - (values.bio?.length || 0)}{' '}
                      <FormattedMessage id="ProfileSettingsForm.bioCharactersLeft" />
                    </p>
                  </div>
                </div>
              </div>
              <div className={css.sectionContainer}>
                <div className={css.usernameContainer}>


                  <H4 as="h2" className={css.sectionTitle}>
                    <FormattedMessage id="ProfileSettingsForm.socialLinksLabel" />
                  </H4>
                  <div className={css.socialLinksContainer}>
                    <FieldUrlInput
                      name="socialLinks.linkedin"
                      id="socialLinks.linkedin"
                      placeholder={linkedinPlaceholder}
                      icon={<LinkedinFieldIcon />}
                    />
                    <FieldUrlInput
                      name="socialLinks.instagram"
                      id="socialLinks.instagram"
                      placeholder={instagramPlaceholder}
                      icon={<InstagramFieldIcon />}
                    />
                    <FieldUrlInput
                      name="socialLinks.twitter"
                      id="socialLinks.twitter"
                      placeholder={twitterPlaceholder}
                      icon={<XFieldIcon />}
                    />
                    <FieldUrlInput
                      name="socialLinks.youtube"
                      id="socialLinks.youtube"
                      placeholder={youtubePlaceholder}
                      icon={<YoutubeFieldIcon />}
                    />
                    <FieldUrlInput
                      name="socialLinks.website"
                      id="socialLinks.website"
                      placeholder={websitePlaceholder}
                      icon={<WebsiteFieldIcon />}
                    />
                  </div>
                </div>
              </div>
              <div className={classNames(css.sectionContainer, css.lastSection)}>
                {userFieldProps.map(({ key, ...fieldProps }) => (
                  <CustomExtendedDataField key={key} {...fieldProps} formId={formId} />
                ))}
              </div>
              {submitError}
              <Button
                className={css.submitButton}
                type="submit"
                inProgress={submitInProgress}
                disabled={submitDisabled}
                ready={pristineSinceLastSubmit}
              >
                <FormattedMessage id="ProfileSettingsForm.saveChanges" />
              </Button>
            </Form>
          );
        }}
      />
    );
  }
}

const ProfileSettingsForm = compose(injectIntl)(ProfileSettingsFormComponent);

ProfileSettingsForm.displayName = 'ProfileSettingsForm';

export default ProfileSettingsForm;
