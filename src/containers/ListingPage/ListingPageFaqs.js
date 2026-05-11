import React, { useMemo } from 'react';

import css from './ListingPage.module.css';
import classNames from 'classnames';

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

  const faqs = useMemo(() => {
    return Array.isArray(publicData?.faqs) ? publicData.faqs : [];
  }, [publicData]);

  if (faqs.length === 0) {
    return null;
  }

  return (
    <section className={css.courseFaqSection}>
      <h2 className={classNames(css.courseSectionTitle, css.courseFaqSectionTitle)}>Frequently Asked Questions</h2>
      <div className={css.courseFaqGrid}>
        {faqs.map((faq, i) => (
          <div key={`${faq?.question || 'faq'}_${i}`} className={css.courseFaqItem}>
            <div className={css.courseFaqQuestion}>{faq?.question}</div>
            <p className={css.courseFaqAnswer}>{faq?.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ListingPageFaqs;

