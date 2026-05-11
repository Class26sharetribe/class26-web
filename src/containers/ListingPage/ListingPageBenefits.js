import React from 'react';

import css from './ListingPage.module.css';

/**
 * Benefits section (publicData.benefits).
 *
 * @component
 * @param {Object} props
 * @param {Object} props.publicData
 * @returns {JSX.Element|null}
 */
const ListingPageBenefits = props => {
  const { publicData } = props;

  const benefits = typeof publicData?.benefits === 'string' ? publicData.benefits.trim() : '';
  if (!benefits) {
    return null;
  }

  return (
    <section className={css.courseBenefitsSection}>
      <h2 className={css.courseSectionTitle}>Benefits</h2>
      <p className={css.courseSectionBody}>{benefits}</p>
    </section>
  );
};

export default ListingPageBenefits;

