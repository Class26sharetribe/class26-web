import React from 'react';

import { FormattedMessage } from '../../../util/reactIntl';

import css from './LearningCurveBanner.module.css';

/**
 * Promotional banner for the learning curve feature.
 *
 * @component
 * @returns {JSX.Element}
 */
const LearningCurveBanner = () => {
  return (
    <section className={css.root} aria-labelledby="learning-curve-heading">
      <h2 id="learning-curve-heading" className={css.heading}>
        <FormattedMessage id="MyClassesTab.learningCurveHeading" />
      </h2>
      <p className={css.description}>
        <FormattedMessage id="MyClassesTab.learningCurveDescription" />
      </p>
      <button type="button" className={css.ctaButton}>
        <FormattedMessage id="MyClassesTab.learningCurveCta" />
      </button>
    </section>
  );
};

export default LearningCurveBanner;
