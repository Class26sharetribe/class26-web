import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useConfiguration } from '../../../context/configurationContext';
import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { ensureCurrentUser } from '../../../util/data';
import {
  initialValuesForUserFields,
  isUserAuthorized,
  pickUserFieldsData,
} from '../../../util/userHelpers';
import { PROFILE_PAGE_PENDING_APPROVAL_VARIANT } from '../../../util/urlHelpers';

import { NamedLink } from '../../../components';

import ProfileSettingsForm from '../../ProfileSettingsPage/ProfileSettingsForm/ProfileSettingsForm';
import { uploadImage, updateProfile } from '../../ProfileSettingsPage/ProfileSettingsPage.duck';

import css from './ProfileSettingsTab.module.css';

const onImageUploadHandler = (values, fn) => {
  const { id, imageId, file } = values;
  if (file) {
    fn({ id, imageId, file });
  }
};

const ViewProfileLink = props => {
  const { userUUID, isUnauthorizedUser } = props;
  return userUUID && isUnauthorizedUser ? (
    <NamedLink
      className={css.profileLink}
      name="ProfilePageVariant"
      params={{ id: userUUID, variant: PROFILE_PAGE_PENDING_APPROVAL_VARIANT }}
    >
      <svg style={{fill: 'transparent'}} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.83301 14.1667L14.1663 5.83334M14.1663 14.1667V5.83334H5.83301" stroke="white" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round" />
      </svg>

      <FormattedMessage id="ProfileSettingsPage.viewProfileLink" />
    </NamedLink>
  ) : userUUID ? (
    <NamedLink className={css.profileLink} name="ProfilePage" params={{ id: userUUID }}>
      <svg style={{fill: 'transparent'}} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.83301 14.1667L14.1663 5.83334M14.1663 14.1667V5.83334H5.83301" stroke="white" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round" />
      </svg>

      <FormattedMessage id="ProfileSettingsPage.viewProfileLink" />
    </NamedLink>
  ) : null;
};

/**
 * Renders the profile settings form as tab content inside PersonalAreaPage.
 * Shares all logic and styles with ProfileSettingsPage but without the page wrapper.
 *
 * @component
 * @returns {JSX.Element}
 */
const ProfileSettingsTab = () => {
  const config = useConfiguration();
  const dispatch = useDispatch();

  const { currentUser } = useSelector(state => state.user);
  const {
    image,
    uploadImageError,
    uploadInProgress,
    updateInProgress,
    updateProfileError,
  } = useSelector(state => state.ProfileSettingsPage);

  const onImageUpload = data => dispatch(uploadImage(data));
  const onUpdateProfile = data => dispatch(updateProfile(data));

  const { userFields, userTypes = [] } = config.user;
  const publicUserFields = userFields.filter(uf => uf.scope === 'public');

  const handleSubmit = (values, userType) => {
    const { firstName, lastName, displayName, bio: rawBio, username, socialLinks, ...rest } = values;

    const displayNameMaybe = displayName
      ? { displayName: displayName.trim() }
      : { displayName: null };

    const bio = rawBio || '';

    const profile = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      ...displayNameMaybe,
      bio,
      publicData: {
        ...pickUserFieldsData(rest, 'public', userType, userFields),
        ...(username ? { username: username.trim() } : {}),
        ...(socialLinks ? { socialLinks } : {}),
      },
    };

    const updatedValues =
      image && image.imageId && image.file
        ? { ...profile, profileImageId: image.imageId }
        : profile;

    onUpdateProfile(updatedValues);
  };

  const user = ensureCurrentUser(currentUser);
  const { firstName, lastName, displayName, bio, publicData } = user?.attributes.profile;
  const isUnauthorizedUser = currentUser && !isUserAuthorized(currentUser);

  const { userType, username: currentUsername } = publicData || {};
  const profileImageId = user.profileImage ? user.profileImage.id : null;
  const profileImage = image || { imageId: profileImageId };
  const userTypeConfig = userTypes.find(c => c.userType === userType);
  const isDisplayNameIncluded = userTypeConfig?.defaultUserFields?.displayName !== false;
  const displayNameMaybe = isDisplayNameIncluded && displayName ? { displayName } : {};

  const profileSettingsForm = user.id ? (
    <ProfileSettingsForm
      className={css.form}
      currentUser={currentUser}
      initialValues={{
        firstName,
        lastName,
        ...displayNameMaybe,
        bio,
        username: currentUsername || '',
        socialLinks: publicData?.socialLinks || {},
        profileImage: user.profileImage,
        ...initialValuesForUserFields(publicData, 'public', userType, userFields),
      }}
      profileImage={profileImage}
      onImageUpload={e => onImageUploadHandler(e, onImageUpload)}
      uploadInProgress={uploadInProgress}
      updateInProgress={updateInProgress}
      uploadImageError={uploadImageError}
      updateProfileError={updateProfileError}
      onSubmit={values => handleSubmit(values, userType)}
      marketplaceName={config.marketplaceName}
      marketplaceRootURL={config.marketplaceRootURL}
      userFields={publicUserFields}
      userTypeConfig={userTypeConfig}
    />
  ) : null;

  return (
    <div className={css.content}>
      <div className={css.headingContainer}>
        <ViewProfileLink userUUID={user?.id?.uuid} isUnauthorizedUser={isUnauthorizedUser} />
      </div>
      {profileSettingsForm}
    </div>
  );
};

export default ProfileSettingsTab;
