import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../../util/reactIntl';

import css from './FindYourNextClass.module.css';

const CATEGORY_TAGS = [
  { id: 'personal-growth', labelId: 'MyClassesTab.tagPersonalGrowth', variant: 'green' },
  { id: 'leadership', labelId: 'MyClassesTab.tagLeadership', variant: 'green' },
  { id: 'ai-human-dev', labelId: 'MyClassesTab.tagAiHumanDevelopment', variant: 'green' },
  { id: 'innovation-change', labelId: 'MyClassesTab.tagInnovationChange', variant: 'green' },
  { id: 'emotional-intelligence', labelId: 'MyClassesTab.tagEmotionalIntelligence', variant: 'green' },
  { id: 'career-development', labelId: 'MyClassesTab.tagCareerDevelopment', variant: 'green' },
  { id: 'video-course', labelId: 'MyClassesTab.tagVideoCourse', variant: 'neutral' },
  { id: 'individual-coaching', labelId: 'MyClassesTab.tagIndividualCoaching', variant: 'neutral' },
  { id: 'group-coaching', labelId: 'MyClassesTab.tagGroupCoaching', variant: 'neutral' },
  { id: 'livestream', labelId: 'MyClassesTab.tagLivestream', variant: 'neutral' },
  { id: 'digital-download', labelId: 'MyClassesTab.tagDigitalDownload', variant: 'neutral' },
];

/**
 * Discovery section with category tags for finding new classes.
 *
 * @component
 * @returns {JSX.Element}
 */
const FindYourNextClass = () => {
  return (
    <section className={css.root} aria-labelledby="find-next-class-heading">
      <h2 id="find-next-class-heading" className={css.heading}>
        <FormattedMessage id="MyClassesTab.findNextClassHeading" />
      </h2>
      <ul className={css.tagList}>
        {CATEGORY_TAGS.map(({ id, labelId, variant }) => (
          <li key={id}>
            <button
              type="button"
              className={classNames(css.tag, {
                [css.tagGreen]: variant === 'green',
                [css.tagNeutral]: variant === 'neutral',
              })}
            >
              <FormattedMessage id={labelId} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default FindYourNextClass;
