import React from 'react';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';
import classNames from 'classnames';

// Import configs and util modules
import { FormattedMessage, useIntl } from '../../../../util/reactIntl';

// Import shared components
import { Button, FieldTextInput, Form } from '../../../../components';

// Import modules from this directory
import css from './EditListingFaqForm.module.css';

const UpdateListingError = props =>
  props.error ? (
    <p className={css.error}>
      <FormattedMessage id="EditListingFaqForm.updateFailed" />
    </p>
  ) : null;

const PublishListingError = props =>
  props.error ? (
    <p className={css.error}>
      <FormattedMessage id="EditListingFaqForm.publishListingFailed" />
    </p>
  ) : null;

/**
 * A single FAQ card within the FieldArray.
 * `name` is the scoped field path provided by fields.map (e.g. "faqs[0]").
 */
const FaqCard = ({ name, onRemove, formId, intl }) => (
  <div className={css.faqCard}>
    <FieldTextInput
      id={`${formId}.${name}.question`}
      name={`${name}.question`}
      className={css.faqField}
      type="text"
      label={intl.formatMessage({ id: 'EditListingFaqForm.questionLabel' })}
      placeholder={intl.formatMessage({ id: 'EditListingFaqForm.questionPlaceholder' })}
    />
    <FieldTextInput
      id={`${formId}.${name}.answer`}
      name={`${name}.answer`}
      className={css.faqField}
      type="textarea"
      label={intl.formatMessage({ id: 'EditListingFaqForm.answerLabel' })}
      placeholder={intl.formatMessage({ id: 'EditListingFaqForm.answerPlaceholder' })}
    />
    <div className={css.faqCardActions}>
      <button type="button" className={css.deleteButton} onClick={onRemove}>
        <svg style={{ fill: "transparent" }} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.5 5.00008H4.16667M4.16667 5.00008H17.5M4.16667 5.00008V16.6667C4.16667 17.1088 4.34226 17.5327 4.65482 17.8453C4.96738 18.1578 5.39131 18.3334 5.83333 18.3334H14.1667C14.6087 18.3334 15.0326 18.1578 15.3452 17.8453C15.6577 17.5327 15.8333 17.1088 15.8333 16.6667V5.00008H4.16667ZM6.66667 5.00008V3.33341C6.66667 2.89139 6.84226 2.46746 7.15482 2.1549C7.46738 1.84234 7.89131 1.66675 8.33333 1.66675H11.6667C12.1087 1.66675 12.5326 1.84234 12.8452 2.1549C13.1577 2.46746 13.3333 2.89139 13.3333 3.33341V5.00008M8.33333 9.16675V14.1667M11.6667 9.16675V14.1667" stroke="#101828" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round" />
        </svg>

        <FormattedMessage id="EditListingFaqForm.delete" />
      </button>
    </div>
  </div>
);

/**
 * The EditListingFaqForm component.
 *
 * @component
 * @param {Object} props
 * @returns {JSX.Element}
 */
export const EditListingFaqForm = props => {
  const intl = useIntl();

  return (
    <FinalForm
      {...props}
      keepDirtyOnReinitialize
      mutators={{ ...arrayMutators }}
      render={formRenderProps => {
        const {
          formId = 'EditListingFaqForm',
          className,
          fetchErrors,
          handleSubmit,
          ready,
          saveActionMsg,
          updated,
          updateInProgress,
          values,
          form,
        } = formRenderProps;

        const { publishListingError, updateListingError } = fetchErrors || {};
        const faqs = values.faqs || [];

        // FAQs are optional, but if any are added every item must be fully filled
        const hasPendingFaqs = faqs.some(faq => !faq?.question?.trim() || !faq?.answer?.trim());

        const submitReady = updated || ready;
        const submitInProgress = updateInProgress;
        const submitDisabled = submitInProgress || hasPendingFaqs;
        const classes = classNames(css.root, className);

        return (
          <Form className={classes} onSubmit={handleSubmit}>
            <p className={css.examples}>
              <FormattedMessage id="EditListingFaqForm.examples" />
            </p>

            <FieldArray name="faqs">
              {({ fields }) => (
                <div className={css.faqList}>
                  {fields.map((name, index) => (
                    <FaqCard
                      key={name}
                      name={name}
                      onRemove={() => fields.remove(index)}
                      formId={formId}
                      intl={intl}
                    />
                  ))}
                  <button
                    type="button"
                    className={css.addFaqButton}
                    onClick={() => form.mutators.push('faqs', { question: '', answer: '' })}
                  >
                    <FormattedMessage id="EditListingFaqForm.addFaq" />
                  </button>
                </div>
              )}
            </FieldArray>

            <PublishListingError error={publishListingError} />
            <UpdateListingError error={updateListingError} />

            <Button
              className={css.submitButton}
              type="submit"
              inProgress={submitInProgress}
              ready={submitReady}
              disabled={submitDisabled}
            >
              {saveActionMsg}
            </Button>
          </Form>
        );
      }}
    />
  );
};

export default EditListingFaqForm;
