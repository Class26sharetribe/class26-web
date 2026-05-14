import React, { useState } from 'react';
import classNames from 'classnames';
import { useIntl } from 'react-intl';

import Field, { hasDataInFields } from '../../Field';
import BlockBuilder from '../../BlockBuilder';
import BlockContainer from '../../BlockBuilder/BlockContainer';

import blockDefaultCss from '../../BlockBuilder/BlockDefault/BlockDefault.module.css';
import css from './FaqAccordionBlocks.module.css';

const alignmentClasses = {
  left: blockDefaultCss.alignLeft,
  center: blockDefaultCss.alignCenter,
  right: blockDefaultCss.alignRight,
};

/**
 * FAQ blocks as a single-open accordion (mobile-only; desktop uses BlockBuilder via FaqSectionBlocks).
 *
 * @param {Object} props
 * @param {Array<Object>} props.blocks
 * @param {string} props.sectionId
 * @param {string} props.ctaButtonClass
 * @param {string} props.responsiveImageSizes
 * @param {Object} [props.options]
 * @returns {JSX.Element|null}
 */
const FaqAccordionBlocks = props => {
  const { blocks = [], sectionId, ctaButtonClass, responsiveImageSizes, options } = props;
  const intl = useIntl();
  const [openIndex, setOpenIndex] = useState(0);

  const fieldOptions = options?.fieldComponents ? { fieldComponents: options.fieldComponents } : {};

  if (!blocks.length) {
    return null;
  }

  const toggleItem = index => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <div className={css.root}>
      {blocks.map((block, index) => {
        const blockId = block.blockId || `${sectionId}-block-${index + 1}`;

        if (block.blockType !== 'defaultBlock') {
          return (
            <BlockBuilder
              key={`${blockId}_i${index}`}
              blocks={[block]}
              sectionId={sectionId}
              options={options}
              responsiveImageSizes={responsiveImageSizes}
              ctaButtonClass={ctaButtonClass}
            />
          );
        }

        const { title, text, callToAction, media, alignment } = block;
        const hasMediaField = hasDataInFields([media], fieldOptions);
        const hasTextComponentFields = hasDataInFields([title, text, callToAction], fieldOptions);
        const questionLabel =
          title?.content?.trim() ||
          block.blockName ||
          intl.formatMessage({ id: 'SectionColumns.faq.fallbackQuestion' });
        const isOpen = openIndex === index;
        const alignmentClass = alignmentClasses[alignment] || alignmentClasses.left;

        return (
          <BlockContainer key={`${blockId}_i${index}`} id={blockId} className={css.item}>
            {hasMediaField ? (
              <div className={css.media}>
                <Field data={media} sizes={responsiveImageSizes} options={fieldOptions} />
              </div>
            ) : null}
            {hasTextComponentFields ? (
              <>
                <h3 className={css.questionHeading}>
                  <button
                    type="button"
                    className={css.questionButton}
                    aria-expanded={isOpen}
                    aria-controls={`${blockId}-panel`}
                    id={`${blockId}-label`}
                    onClick={() => toggleItem(index)}
                  >
                    <span className={css.questionText}>{questionLabel}</span>
                    <span
                      className={classNames(css.toggleIcon, { [css.toggleIconOpen]: isOpen })}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <div
                  id={`${blockId}-panel`}
                  role="region"
                  aria-labelledby={`${blockId}-label`}
                  className={classNames(css.panel, alignmentClass, {
                    [css.panelOpen]: isOpen,
                  })}
                >
                  <div className={blockDefaultCss.text}>
                    <Field data={text} options={fieldOptions} />
                    <Field data={callToAction} className={ctaButtonClass} options={fieldOptions} />
                  </div>
                </div>
              </>
            ) : null}
          </BlockContainer>
        );
      })}
    </div>
  );
};

export default FaqAccordionBlocks;
