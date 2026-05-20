import React from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { LinkedLogo } from '../../../../components';

import Field from '../../Field';
import BlockBuilder from '../../BlockBuilder';

import SectionContainer from '../SectionContainer';
import css from './SectionFooter.module.css';

// The number of columns (numberOfColumns) affects styling

const GRID_CONFIG = [
  { contentCss: css.contentCol1, gridCss: css.gridCol1 },
  { contentCss: css.contentCol2, gridCss: css.gridCol2 },
  { contentCss: css.contentCol3, gridCss: css.gridCol3 },
  { contentCss: css.contentCol4, gridCss: css.gridCol4 },
];
const MAX_MOBILE_SCREEN_WIDTH = 1024;

const getIndex = numberOfColumns => numberOfColumns - 1;

const getContentCss = numberOfColumns => {
  const contentConfig = GRID_CONFIG[getIndex(numberOfColumns)];
  return contentConfig ? contentConfig.contentCss : GRID_CONFIG[0].contentCss;
};

const getGridCss = numberOfColumns => {
  const contentConfig = GRID_CONFIG[getIndex(numberOfColumns)];
  return contentConfig ? contentConfig.gridCss : GRID_CONFIG[0].gridCss;
};

/**
 * @typedef {Object} SocialMediaLinkConfig
 * @property {'socialMediaLink'} fieldType
 * @property {string} platform
 * @property {string} url
 */

/**
 * @typedef {Object} BlockConfig
 * @property {string} blockId
 * @property {string} blockName
 * @property {'defaultBlock' | 'footerBlock' | 'socialMediaLink'} blockType
 */

/**
 * @typedef {Object} FieldComponentConfig
 * @property {ReactNode} component
 * @property {Function} pickValidProps
 */

/**
 * Section component that's able to show blocks in multiple different columns (defined by "numberOfColumns" prop)
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to components own css.root
 * @param {string?} props.rootClassName overwrite components own css.root
 * @param {string} props.sectionId id of the section
 * @param {'footer'} props.sectionType
 * @param {number} props.numberOfColumns columns for blocks in footer (1-4)
 * @param {Array<SocialMediaLinkConfig>?} props.socialMediaLinks array of social media link configs
 * @param {Object?} props.slogan
 * @param {Object?} props.copyright
 * @param {Object?} props.appearance
 * @param {Array<BlockConfig>?} props.blocks array of block configs
 * @param {Object} props.options extra options for the section component (e.g. custom fieldComponents)
 * @param {Object<string,FieldComponentConfig>?} props.options.fieldComponents custom fields
 * @returns {JSX.Element} Section for article content
 */
const SectionFooter = props => {
  const {
    sectionId,
    className,
    rootClassName,
    numberOfColumns = 1,
    socialMediaLinks = [],
    slogan,
    appearance,
    copyright,
    blocks = [],
    options,
    linkLogoToExternalSite,
  } = props;

  const currentUser = useSelector(state => state.user.currentUser);
  const userType = currentUser?.attributes?.profile?.publicData?.userType;

  // Build role-specific legal links for the terms-and-privacy block
  const BASE_LEGAL_LINKS = [
    '[Terms of Service](/terms-of-service)',
    '[Additional Policy Compliance Protocols](/p/additional-policy-compliance-protocols)',
    '[Privacy Policy](/privacy-policy)',
    '[Cookie Policy](/p/cookie-policy)',
    '[Refund and Cancellation Policy](/p/refund-and-cancellation-policy)',
  ];
  const EXPERT_EXTRA_LINKS = [
    '[Expert Collaboration Agreement](/p/expert-collaboration-agreement)',
    '[Expert Conduct Policy](/p/expert-conduct-policy)',
    '[Quality Assurance Expert Review Cycle](/p/quality-assurance-expert-review-cycle)',
    '[Community Guidelines](/p/community-guidelines)',
    '[Complaints And Incidents Protocol](/p/complaints-and-incidents-protocol)',
    '[Checkout Consents & Legal Confirmations](/p/checkout-consents-legal-confirmations)',
  ];
  const CUSTOMER_EXTRA_LINKS = [
    '[User Agreements](/p/user-agreement)',
    '[Community Guidelines](/p/community-guidelines)',
    '[Complaints And Incidents Protocol](/p/complaints-and-incidents-protocol)',
    '[Checkout Consents & Legal Confirmations](/p/checkout-consents-legal-confirmations)',
  ];

  const legalLinks =
    userType === 'provider'
      ? [...BASE_LEGAL_LINKS, ...EXPERT_EXTRA_LINKS]
      : userType === 'customer'
      ? [...BASE_LEGAL_LINKS, ...CUSTOMER_EXTRA_LINKS]
      : BASE_LEGAL_LINKS;

  const legalMarkdown = `Legal\n${legalLinks.map(l => `- ${l}`).join('\n')}`;

  const resolvedBlocks = blocks.map(block =>
    block.blockId === 'terms-and-privacy'
      ? { ...block, text: { ...block.text, content: legalMarkdown } }
      : block
  );

  // If external mapping has been included for fields
  // E.g. { h1: { component: MyAwesomeHeader } }
  const fieldComponents = options?.fieldComponents;
  const fieldOptions = { fieldComponents };
  const linksWithBlockId = socialMediaLinks?.map(sml => {
    return {
      ...sml,
      blockId: sml.link.platform,
    };
  });

  const showSocialMediaLinks = socialMediaLinks?.length > 0;
  const hasMatchMedia = typeof window !== 'undefined' && window?.matchMedia;
  const isMobileLayout = hasMatchMedia
    ? window.matchMedia(`(max-width: ${MAX_MOBILE_SCREEN_WIDTH}px)`)?.matches
    : true;
  const logoLayout = isMobileLayout ? 'mobile' : 'desktop';

  return (
    <SectionContainer
      as="footer"
      id={sectionId}
      className={className || css.root}
      rootClassName={rootClassName}
      appearance={appearance}
      options={fieldOptions}
    >
      <div className={css.newsletterSection}>
        <div className={css.newsletterInner}>
          <div className={css.newsletterCopy}>
            <h2 className={css.newsletterTitle}>Never miss a learning opportunity again</h2>
            <p className={css.newsletterDescription}>
              Limited edition classes, special guests, and more: everything you need to boost your
              personal and professional growth. Monthly, in your inbox.
            </p>
          </div>
          <form
            className={css.newsletterForm}
            onSubmit={e => {
              e.preventDefault();
            }}
          >
            <input
              className={css.newsletterInput}
              type="email"
              name="email"
              placeholder="Enter your email"
              autoComplete="email"
              aria-label="Email address"
            />
            <button className={css.newsletterButton} type="submit">
              Subscribe
            </button>
          </form>
        </div>
      </div>
      <div className={css.footer}>
        <div className={classNames(css.content, getContentCss(numberOfColumns))}>
          <div>
            <LinkedLogo
              rootClassName={css.logoLink}
              logoClassName={css.logoWrapper}
              logoImageClassName={css.logoImage}
              linkToExternalSite={linkLogoToExternalSite}
              layout={logoLayout}
            />
          </div>
          <div className={css.sloganMobile}>
            <Field data={slogan} className={css.slogan} />
          </div>
          <div className={css.detailsInfo}>
            <div className={css.sloganDesktop}>
              <Field data={slogan} className={css.slogan} />
            </div>
          </div>
          <div className={classNames(css.grid, getGridCss(numberOfColumns))}>
            <BlockBuilder blocks={resolvedBlocks} sectionId={sectionId} options={options} />
          </div>
        </div>
        <div className={css.copyrightContainer}>
          <Field data={copyright} className={css.copyright} />
          {showSocialMediaLinks ? (
            <div className={css.icons}>
              <BlockBuilder blocks={linksWithBlockId} sectionId={sectionId} options={options} />
            </div>
          ) : null}
        </div>
      </div>
    </SectionContainer>
  );
};

export default SectionFooter;
