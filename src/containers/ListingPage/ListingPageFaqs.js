import React, { useMemo, useState } from 'react';
import classNames from 'classnames';

import css from './ListingPage.module.css';

/**
 * FAQs section (publicData.faqs).
 *
 * @component
 * @param {Object} props
 * @param {Object} props.publicData
 * @returns {JSX.Element|null}
 */
const ListingPageFaqs = props => {
  const { publicData } = props;
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = useMemo(() => {
    return Array.isArray(publicData?.faqs) ? publicData.faqs : [];
  }, [publicData]);

  if (faqs.length === 0) {
    return null;
  }

  const toggleItem = index => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <section className={css.courseFaqSection}>
      <h2 className={classNames(css.courseSectionTitle, css.courseFaqSectionTitle)}>
        Frequently Asked Questions
      </h2>
      <div className={css.courseFaqGrid}>
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          const itemId = `listing-course-faq-${i}`;

          return (
            <div key={`${faq?.question || 'faq'}_${i}`} className={css.courseFaqItem}>
              <h3 className={css.courseFaqQuestionHeading}>
                <button
                  type="button"
                  className={css.courseFaqQuestionButton}
                  aria-expanded={isOpen}
                  aria-controls={`${itemId}-panel`}
                  id={`${itemId}-label`}
                  onClick={() => toggleItem(i)}
                >
                  <span className={css.courseFaqQuestion}>{faq?.question}</span>
                  <span
                    className={classNames(css.courseFaqToggleIcon, {
                      [css.courseFaqToggleIconOpen]: isOpen,
                    })}
                    aria-hidden="true"
                  />
                </button>
              </h3>
              <div
                id={`${itemId}-panel`}
                role="region"
                aria-labelledby={`${itemId}-label`}
                className={classNames(css.courseFaqPanel, { [css.courseFaqPanelOpen]: isOpen })}
              >
                <p className={css.courseFaqAnswer}>{faq?.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ListingPageFaqs;
