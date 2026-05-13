import React from 'react';

import { requiredFieldArrayCheckbox } from '../../../util/validators';
import { FieldCheckboxGroup } from '../../../components';

import { FormattedMessage, intlShape } from '../../../util/reactIntl';

import css from './TermsAndConditions.module.css';

const KEY_CODE_ENTER = 13;

/**
 * A component that renders the terms and conditions.
 *
 * @component
 * @param {Object} props
 * @param {Function} props.onOpenTermsOfService - The function to open the terms of service modal
 * @param {Function} props.onOpenPrivacyPolicy - The function to open the privacy policy modal
 * @param {string} props.formId - The form id
 * @param {intlShape} props.intl - The intl object
 * @returns {JSX.Element}
 */
const TermsAndConditions = props => {
  const {
    onOpenTermsOfService,
    onOpenPrivacyPolicy,
    onOpenUserAgreement,
    onOpenCommunityGuidelines,
    onOpenExpertCollaborationAgreement,
    onOpenExpertConductPolicy,
    showExpertTerms,
    formId,
    intl,
  } = props;

  const handleClick = callback => e => {
    e.preventDefault();
    callback(e);
  };
  const handleKeyUp = callback => e => {
    // Allow click action with keyboard like with normal links
    if (e.keyCode === KEY_CODE_ENTER) {
      callback();
    }
  };

  const termsLink = (
    <span
      className={css.termsLink}
      onClick={handleClick(onOpenTermsOfService)}
      role="button"
      tabIndex="0"
      onKeyUp={handleKeyUp(onOpenTermsOfService)}
    >
      <FormattedMessage id="AuthenticationPage.termsAndConditionsTermsLinkText" />
    </span>
  );

  const privacyLink = (
    <span
      className={css.privacyLink}
      onClick={handleClick(onOpenPrivacyPolicy)}
      role="button"
      tabIndex="0"
      onKeyUp={handleKeyUp(onOpenPrivacyPolicy)}
    >
      <FormattedMessage id="AuthenticationPage.termsAndConditionsPrivacyLinkText" />
    </span>
  );

  const userAgreementLink = (
    <span
      className={css.termsLink}
      onClick={handleClick(onOpenUserAgreement)}
      role="button"
      tabIndex="0"
      onKeyUp={handleKeyUp(onOpenUserAgreement)}
    >
      <FormattedMessage id="AuthenticationPage.userAgreementLinkText" />
    </span>
  );

  const communityGuidelinesLink = (
    <span
      className={css.privacyLink}
      onClick={handleClick(onOpenCommunityGuidelines)}
      role="button"
      tabIndex="0"
      onKeyUp={handleKeyUp(onOpenCommunityGuidelines)}
    >
      <FormattedMessage id="AuthenticationPage.communityGuidelinesLinkText" />
    </span>
  );

  const expertCollaborationAgreementLink = showExpertTerms ? (
    <span
      className={css.termsLink}
      onClick={handleClick(onOpenExpertCollaborationAgreement)}
      role="button"
      tabIndex="0"
      onKeyUp={handleKeyUp(onOpenExpertCollaborationAgreement)}
    >
      <FormattedMessage id="ExpertSignupPage.expertCollaborationAgreementLinkText" />
    </span>
  ) : null;

  const expertCommunityGuidelinesLink = showExpertTerms ? (
    <span
      className={css.privacyLink}
      onClick={handleClick(onOpenCommunityGuidelines)}
      role="button"
      tabIndex="0"
      onKeyUp={handleKeyUp(onOpenCommunityGuidelines)}
    >
      <FormattedMessage id="AuthenticationPage.communityGuidelinesLinkText" />
    </span>
  ) : null;

  const expertConductPolicyLink = showExpertTerms ? (
    <span
      className={css.termsLink}
      onClick={handleClick(onOpenExpertConductPolicy)}
      role="button"
      tabIndex="0"
      onKeyUp={handleKeyUp(onOpenExpertConductPolicy)}
    >
      <FormattedMessage id="ExpertSignupPage.expertConductPolicyLinkText" />
    </span>
  ) : null;

  return (
    <div className={css.root}>
      <FieldCheckboxGroup
        name="terms"
        id={formId ? `${formId}.terms-accepted` : 'terms-accepted'}
        optionLabelClassName={css.finePrint}
        options={[
          {
            key: 'tos-and-privacy',
            label: intl.formatMessage(
              { id: 'AuthenticationPage.termsAndConditionsAcceptText' },
              { termsLink, privacyLink }
            ),
          },
        ]}
        validate={requiredFieldArrayCheckbox(
          intl.formatMessage({ id: 'AuthenticationPage.termsAndConditionsAcceptRequired' })
        )}
      />
      {!showExpertTerms ? (
        <FieldCheckboxGroup
          name="userAgreement"
          id={formId ? `${formId}.user-agreement-accepted` : 'user-agreement-accepted'}
          optionLabelClassName={css.finePrint}
          options={[
            {
              key: 'user-agreement-and-guidelines',
              label: intl.formatMessage(
                { id: 'AuthenticationPage.userAgreementAcceptText' },
                { userAgreementLink, communityGuidelinesLink }
              ),
            },
          ]}
          validate={requiredFieldArrayCheckbox(
            intl.formatMessage({ id: 'AuthenticationPage.userAgreementAcceptRequired' })
          )}
        />
      ) : (
        <FieldCheckboxGroup
          name="expertTerms"
          id={formId ? `${formId}.expert-terms-accepted` : 'expert-terms-accepted'}
          optionLabelClassName={css.finePrint}
          options={[
            {
              key: 'expert-collaboration-and-conduct',
              label: intl.formatMessage(
                { id: 'ExpertSignupPage.expertTermsAcceptText' },
                {
                  expertCollaborationAgreementLink,
                  expertCommunityGuidelinesLink,
                  expertConductPolicyLink,
                }
              ),
            },
          ]}
          validate={requiredFieldArrayCheckbox(
            intl.formatMessage({ id: 'ExpertSignupPage.expertTermsAcceptRequired' })
          )}
        />
      )}
    </div>
  );
};

export default TermsAndConditions;
