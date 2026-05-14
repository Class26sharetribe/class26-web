import React, { useLayoutEffect, useState } from 'react';

import BlockBuilder from '../../BlockBuilder';

import FaqAccordionBlocks from './FaqAccordionBlocks';

const VIEWPORT_MEDIUM_MIN_PX = 768;

/**
 * FAQ section: accordion on small viewports only; original BlockBuilder layout from medium up.
 *
 * @param {Object} props — same props as BlockBuilder for this section
 * @returns {JSX.Element|null}
 */
const FaqSectionBlocks = props => {
  const [isDesktop, setIsDesktop] = useState(false);

  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return undefined;
    }
    const mq = window.matchMedia(`(min-width: ${VIEWPORT_MEDIUM_MIN_PX}px)`);
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  if (isDesktop) {
    return <BlockBuilder {...props} />;
  }

  return <FaqAccordionBlocks {...props} />;
};

export default FaqSectionBlocks;
