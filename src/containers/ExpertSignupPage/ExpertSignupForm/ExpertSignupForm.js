import React from 'react';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { useConfiguration } from '../../../context/configurationContext';
import * as validators from '../../../util/validators';

import {
  Form,
  PrimaryButton,
  FieldTextInput,
  FieldRadioButton,
  FieldSelect,
} from '../../../components';

import FieldPhoneWithCountry from './FieldPhoneWithCountry';
import FieldUrlInput from './FieldUrlInput';
import css from './ExpertSignupForm.module.css';

const YEARS_OF_EXPERIENCE_OPTIONS = [
  { value: '0-2', label: '0 – 2 years' },
  { value: '3-5', label: '3 – 5 years' },
  { value: '6-10', label: '6 – 10 years' },
  { value: '10+', label: '10+ years' },
];

const TARGET_CUSTOMER_BASE_OPTIONS = [
  { value: 'startups', label: 'Startups' },
  { value: 'sme', label: 'SMEs' },
  { value: 'enterprise', label: 'Enterprises' },
  { value: 'nonprofit', label: 'Non-profits' },
  { value: 'public', label: 'Public sector' },
  { value: 'all', label: 'All types' },
];

const ExpertSignupFormComponent = props => (
  <FinalForm
    {...props}
    mutators={{ ...arrayMutators }}
    render={formRenderProps => {
      const {
        rootClassName,
        className,
        formId,
        handleSubmit,
        inProgress,
        invalid,
        intl,
        termsAndConditions,
        values,
        listingCategories,
      } = formRenderProps;

      const primaryExpertiseOptions = (listingCategories || []).map(cat => ({
        value: cat.id,
        label: cat.name,
      }));

      // email
      const emailRequired = validators.required(
        intl.formatMessage({ id: 'ExpertSignupForm.emailRequired' })
      );
      const emailValid = validators.emailFormatValid(
        intl.formatMessage({ id: 'ExpertSignupForm.emailInvalid' })
      );

      // password
      const passwordRequiredMessage = intl.formatMessage({
        id: 'ExpertSignupForm.passwordRequired',
      });
      const passwordMinLengthMessage = intl.formatMessage(
        { id: 'ExpertSignupForm.passwordTooShort' },
        { minLength: validators.PASSWORD_MIN_LENGTH }
      );
      const passwordMaxLengthMessage = intl.formatMessage(
        { id: 'ExpertSignupForm.passwordTooLong' },
        { maxLength: validators.PASSWORD_MAX_LENGTH }
      );
      const passwordValidators = validators.composeValidators(
        validators.requiredStringNoTrim(passwordRequiredMessage),
        validators.minLength(passwordMinLengthMessage, validators.PASSWORD_MIN_LENGTH),
        validators.maxLength(passwordMaxLengthMessage, validators.PASSWORD_MAX_LENGTH)
      );

      const phoneRequired = validators.required(
        intl.formatMessage({ id: 'ExpertSignupForm.phoneRequired' })
      );
      const phoneMinDigits = value => {
        const digits = (value || '').replace(/\D/g, '');
        return digits.length >= 8
          ? undefined
          : intl.formatMessage({ id: 'ExpertSignupForm.phoneTooShort' });
      };
      const phoneValidators = validators.composeValidators(phoneRequired, phoneMinDigits);

      const classes = classNames(rootClassName || css.root, className);
      const submitInProgress = inProgress;
      const submitDisabled = invalid || submitInProgress;

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          {/* Name row */}
          <div className={css.nameRow}>
            <FieldTextInput
              className={css.firstNameRoot}
              type="text"
              id={formId ? `${formId}.fname` : 'fname'}
              name="fname"
              autoComplete="given-name"
              label={intl.formatMessage({ id: 'ExpertSignupForm.firstNameLabel' })}
              placeholder={intl.formatMessage({ id: 'ExpertSignupForm.firstNamePlaceholder' })}
              validate={validators.required(
                intl.formatMessage({ id: 'ExpertSignupForm.firstNameRequired' })
              )}
            />
            <FieldTextInput
              className={css.lastNameRoot}
              type="text"
              id={formId ? `${formId}.lname` : 'lname'}
              name="lname"
              autoComplete="family-name"
              label={intl.formatMessage({ id: 'ExpertSignupForm.lastNameLabel' })}
              placeholder={intl.formatMessage({ id: 'ExpertSignupForm.lastNamePlaceholder' })}
              validate={validators.required(
                intl.formatMessage({ id: 'ExpertSignupForm.lastNameRequired' })
              )}
            />
          </div>

          {/* Email + Phone row */}
          <div className={css.twoColRow}>
            <FieldTextInput
              className={css.halfField}
              type="email"
              id={formId ? `${formId}.email` : 'email'}
              name="email"
              autoComplete="email"
              label={intl.formatMessage({ id: 'ExpertSignupForm.emailLabel' })}
              placeholder={intl.formatMessage({ id: 'ExpertSignupForm.emailPlaceholder' })}
              validate={validators.composeValidators(emailRequired, emailValid)}
            />

            {/* Professional Phone */}
            <FieldPhoneWithCountry
              className={css.halfField}
              id={formId ? `${formId}.phoneNumber` : 'phoneNumber'}
              name="phoneNumber"
              label={intl.formatMessage({ id: 'ExpertSignupForm.phoneLabel' })}
              placeholder={intl.formatMessage({ id: 'ExpertSignupForm.phonePlaceholder' })}
              validate={phoneValidators}
            />
          </div>

          {/* Password */}
          <FieldTextInput
            className={css.field}
            type="password"
            id={formId ? `${formId}.password` : 'password'}
            name="password"
            autoComplete="new-password"
            label={intl.formatMessage({ id: 'ExpertSignupForm.passwordLabel' })}
            placeholder={intl.formatMessage({ id: 'ExpertSignupForm.passwordPlaceholder' })}
            validate={passwordValidators}
          />

          {/* Links */}
          <div className={css.field}>
            <label className={css.linksLabel}>
              <FormattedMessage id="ExpertSignupForm.linksLabel" />
            </label>
            <div className={css.linksRow}>
              <FieldUrlInput
                id={formId ? `${formId}.linkedinUrl` : 'linkedinUrl'}
                name="linkedinUrl"
                placeholder={intl.formatMessage({ id: 'ExpertSignupForm.linkedinPlaceholder' })}
                icon={
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clip-path="url(#clip0_3398_41666)">
                      <path
                        d="M22.2234 0H1.77187C0.792187 0 0 0.773438 0 1.72969V22.2656C0 23.2219 0.792187 24 1.77187 24H22.2234C23.2031 24 24 23.2219 24 22.2703V1.72969C24 0.773438 23.2031 0 22.2234 0ZM7.12031 20.4516H3.55781V8.99531H7.12031V20.4516ZM5.33906 7.43438C4.19531 7.43438 3.27188 6.51094 3.27188 5.37187C3.27188 4.23281 4.19531 3.30937 5.33906 3.30937C6.47813 3.30937 7.40156 4.23281 7.40156 5.37187C7.40156 6.50625 6.47813 7.43438 5.33906 7.43438ZM20.4516 20.4516H16.8937V14.8828C16.8937 13.5562 16.8703 11.8453 15.0422 11.8453C13.1906 11.8453 12.9094 13.2937 12.9094 14.7891V20.4516H9.35625V8.99531H12.7687V10.5609H12.8156C13.2891 9.66094 14.4516 8.70938 16.1813 8.70938C19.7859 8.70938 20.4516 11.0813 20.4516 14.1656V20.4516Z"
                        fill="#414651"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_3398_41666">
                        <rect width="24" height="24" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                }
              />
              <FieldUrlInput
                id={formId ? `${formId}.websiteUrl` : 'websiteUrl'}
                name="websiteUrl"
                placeholder={intl.formatMessage({ id: 'ExpertSignupForm.websitePlaceholder' })}
                icon={
                  <svg
                    style={{ fill: 'transparent' }}
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22 12C22 17.5228 17.5228 22 12 22M22 12C22 6.47715 17.5228 2 12 2M22 12H2M12 22C6.47715 22 2 17.5228 2 12M12 22C14.5013 19.2616 15.9228 15.708 16 12C15.9228 8.29203 14.5013 4.73835 12 2M12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2M2 12C2 6.47715 6.47715 2 12 2"
                      stroke="#101828"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                }
              />
            </div>
          </div>

          {/* Company Information */}
          <div className={css.companySection}>
            <div className={css.companySectionLeft}>
              <div className={css.companyTopGroup}>
                <p className={css.companyInfoLabel}>
                  <FormattedMessage id="ExpertSignupForm.companyInfoLabel" />
                </p>
                <div className={css.radioGroup}>
                  <FieldRadioButton
                    id={formId ? `${formId}.companyType.individual` : 'companyType.individual'}
                    name="companyType"
                    value="individual"
                    label={intl.formatMessage({ id: 'ExpertSignupForm.companyTypeIndividual' })}
                  />
                  <FieldRadioButton
                    id={formId ? `${formId}.companyType.company` : 'companyType.company'}
                    name="companyType"
                    value="company"
                    label={intl.formatMessage({ id: 'ExpertSignupForm.companyTypeCompany' })}
                  />
                </div>
              </div>
              {values.companyType === 'company' ? (
                <FieldTextInput
                  className={css.companyField}
                  type="text"
                  id={formId ? `${formId}.vatNumber` : 'vatNumber'}
                  name="vatNumber"
                  label={intl.formatMessage({ id: 'ExpertSignupForm.vatNumberLabel' })}
                  placeholder={intl.formatMessage({ id: 'ExpertSignupForm.vatNumberPlaceholder' })}
                />
              ) : null}
            </div>

            {values.companyType === 'company' ? (
              <div className={css.companySectionRight}>
                <div className={css.addressWrapper}>
                  <FieldTextInput
                    className={css.companyField}
                    type="text"
                    id={formId ? `${formId}.address` : 'address'}
                    name="address"
                    autoComplete="street-address"
                    label={intl.formatMessage({ id: 'ExpertSignupForm.addressLabel' })}
                    placeholder={intl.formatMessage({ id: 'ExpertSignupForm.addressPlaceholder' })}
                    validate={validators.required(
                      intl.formatMessage({ id: 'ExpertSignupForm.addressRequired' })
                    )}
                  />
                </div>
                <FieldTextInput
                  className={css.companyField}
                  type="text"
                  id={formId ? `${formId}.city` : 'city'}
                  name="city"
                  autoComplete="address-level2"
                  label={intl.formatMessage({ id: 'ExpertSignupForm.cityLabel' })}
                  placeholder={intl.formatMessage({ id: 'ExpertSignupForm.cityPlaceholder' })}
                  validate={validators.required(
                    intl.formatMessage({ id: 'ExpertSignupForm.cityRequired' })
                  )}
                />
              </div>
            ) : null}
          </div>

          {/* ===== Expert Profile Section ===== */}
          <div className={css.expertProfileSection}>
            {/* Three dropdowns row */}
            <div className={css.dropdownsRow}>
              <FieldSelect
                className={css.dropdownField}
                id={formId ? `${formId}.yearsOfExperience` : 'yearsOfExperience'}
                name="yearsOfExperience"
                label={intl.formatMessage({ id: 'ExpertSignupForm.yearsOfExperienceLabel' })}
                validate={validators.required(
                  intl.formatMessage({ id: 'ExpertSignupForm.yearsOfExperienceRequired' })
                )}
              >
                <option value="" disabled>
                  {intl.formatMessage({ id: 'ExpertSignupForm.yearsOfExperiencePlaceholder' })}
                </option>
                {YEARS_OF_EXPERIENCE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </FieldSelect>

              <FieldSelect
                className={css.dropdownField}
                id={formId ? `${formId}.primaryExpertise` : 'primaryExpertise'}
                name="primaryExpertise"
                label={intl.formatMessage({ id: 'ExpertSignupForm.primaryExpertiseLabel' })}
                validate={validators.required(
                  intl.formatMessage({ id: 'ExpertSignupForm.primaryExpertiseRequired' })
                )}
              >
                <option value="" disabled>
                  {intl.formatMessage({ id: 'ExpertSignupForm.primaryExpertisePlaceholder' })}
                </option>
                {primaryExpertiseOptions.map(o => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </FieldSelect>

              <FieldSelect
                className={css.dropdownField}
                id={formId ? `${formId}.targetCustomerBase` : 'targetCustomerBase'}
                name="targetCustomerBase"
                label={intl.formatMessage({ id: 'ExpertSignupForm.targetCustomerBaseLabel' })}
                validate={validators.required(
                  intl.formatMessage({ id: 'ExpertSignupForm.targetCustomerBaseRequired' })
                )}
              >
                <option value="" disabled>
                  {intl.formatMessage({ id: 'ExpertSignupForm.targetCustomerBasePlaceholder' })}
                </option>
                {TARGET_CUSTOMER_BASE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </FieldSelect>
            </div>

            {/* Unique Value Proposition */}
            <FieldTextInput
              className={css.textareaField}
              type="textarea"
              id={formId ? `${formId}.uniqueValueProposition` : 'uniqueValueProposition'}
              name="uniqueValueProposition"
              label={intl.formatMessage({ id: 'ExpertSignupForm.uvpLabel' })}
              placeholder={intl.formatMessage({ id: 'ExpertSignupForm.uvpPlaceholder' })}
              helpText={intl.formatMessage({ id: 'ExpertSignupForm.uvpHelpText' })}
              validate={validators.required(
                intl.formatMessage({ id: 'ExpertSignupForm.uvpRequired' })
              )}
            />

            {/* Motivation Letter */}
            <FieldTextInput
              className={css.textareaField}
              type="textarea"
              id={formId ? `${formId}.motivationLetter` : 'motivationLetter'}
              name="motivationLetter"
              label={intl.formatMessage({ id: 'ExpertSignupForm.motivationLetterLabel' })}
              placeholder={intl.formatMessage({
                id: 'ExpertSignupForm.motivationLetterPlaceholder',
              })}
              helpText={intl.formatMessage({ id: 'ExpertSignupForm.motivationLetterHelpText' })}
              validate={validators.required(
                intl.formatMessage({ id: 'ExpertSignupForm.motivationLetterRequired' })
              )}
            />
          </div>

          <div className={css.bottomWrapper}>
            {termsAndConditions}
            <PrimaryButton
              className={css.submitButton}
              type="submit"
              inProgress={submitInProgress}
              disabled={submitDisabled}
            >
              <FormattedMessage id="ExpertSignupForm.submit" />
            </PrimaryButton>
          </div>
        </Form>
      );
    }}
  />
);

/**
 * A component that renders the expert signup form.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.rootClassName] - Overrides the default root class
 * @param {string} [props.className] - Extends the root class
 * @param {string} [props.formId] - The form id
 * @param {boolean} [props.inProgress] - Whether the form is submitting
 * @param {Function} props.onSubmit - Submit handler
 * @returns {JSX.Element}
 */
const ExpertSignupForm = props => {
  const intl = useIntl();
  const config = useConfiguration();
  const listingCategories = config.categoryConfiguration.categories;
  return <ExpertSignupFormComponent {...props} intl={intl} listingCategories={listingCategories} />;
};

export default ExpertSignupForm;
