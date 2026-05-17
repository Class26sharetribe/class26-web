import React, { useState } from 'react';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';

import css from './DigitalDownloadProgramCard.module.css';

const CheckCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="12" fill="#A2F8CE" />
    <path fill-rule="evenodd" clip-rule="evenodd" d="M17.0965 7.39004L9.9365 14.3L8.0365 12.27C7.6865 11.94 7.1365 11.92 6.7365 12.2C6.3465 12.49 6.2365 13 6.4765 13.41L8.7265 17.07C8.9465 17.41 9.3265 17.62 9.7565 17.62C10.1665 17.62 10.5565 17.41 10.7765 17.07C11.1365 16.6 18.0065 8.41004 18.0065 8.41004C18.9065 7.49004 17.8165 6.68004 17.0965 7.38004V7.39004Z" fill="#008057" />
  </svg>

);

const EllipsisIcon = () => (
  <svg width="15" height="4" viewBox="0 0 15 4" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.50163 2.50163C7.96186 2.50163 8.33496 2.12853 8.33496 1.66829C8.33496 1.20806 7.96186 0.834961 7.50163 0.834961C7.04139 0.834961 6.66829 1.20806 6.66829 1.66829C6.66829 2.12853 7.04139 2.50163 7.50163 2.50163Z" stroke="#101828" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M13.335 2.50163C13.7952 2.50163 14.1683 2.12853 14.1683 1.66829C14.1683 1.20806 13.7952 0.834961 13.335 0.834961C12.8747 0.834961 12.5016 1.20806 12.5016 1.66829C12.5016 2.12853 12.8747 2.50163 13.335 2.50163Z" stroke="#101828" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M1.66829 2.50163C2.12853 2.50163 2.50163 2.12853 2.50163 1.66829C2.50163 1.20806 2.12853 0.834961 1.66829 0.834961C1.20806 0.834961 0.834961 1.20806 0.834961 1.66829C0.834961 2.12853 1.20806 2.50163 1.66829 2.50163Z" stroke="#101828" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round" />
  </svg>

);

const CertificateIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_4256_11170)">
      <path d="M6.84175 11.5749L5.83341 19.1666L10.0001 16.6666L14.1667 19.1666L13.1584 11.5666M15.8334 6.66659C15.8334 9.88825 13.2217 12.4999 10.0001 12.4999C6.77842 12.4999 4.16675 9.88825 4.16675 6.66659C4.16675 3.44492 6.77842 0.833252 10.0001 0.833252C13.2217 0.833252 15.8334 3.44492 15.8334 6.66659Z" stroke="#101828" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_4256_11170">
        <rect width="20" height="20" fill="white" />
      </clipPath>
    </defs>
  </svg>

);

const StarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path
      d="M10.0003 1.66667L12.5753 6.88334L18.3337 7.72501L14.167 11.7833L15.1503 17.5167L10.0003 14.8083L4.85033 17.5167L5.83366 11.7833L1.66699 7.72501L7.42533 6.88334L10.0003 1.66667Z"
      stroke="currentColor"
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Digital download program card with lifetime access and download actions.
 *
 * @component
 * @returns {JSX.Element}
 */
const DigitalDownloadProgramCard = () => {
  const intl = useIntl();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <article className={css.root}>
      <header className={css.cardHeader}>
        <div
          className={css.thumbnail}
          role="img"
          aria-label={intl.formatMessage({ id: 'MyClassesTab.digitalDownloadThumbnailAlt' })}
        />
        <div className={css.programInfo}>
          <h2 className={css.programTitle}>
            <FormattedMessage id="MyClassesTab.digitalDownloadTitle" />
          </h2>
          <p className={css.programAuthor}>
            <FormattedMessage
              id="MyClassesTab.programAuthor"
              values={{
                author: (
                  <span className={css.programAuthorName}>
                    <FormattedMessage id="MyClassesTab.videoCourseAuthorName" />
                  </span>
                ),
              }}
            />
          </p>
          <div className={css.tags}>
            <span className={classNames(css.tag, css.tagGreen)}>
              <FormattedMessage id="MyClassesTab.tagPersonalGrowth" />
            </span>
            <span className={classNames(css.tag, css.tagNeutral)}>
              <FormattedMessage id="MyClassesTab.tagDigitalDownload" />
            </span>
          </div>
          <p className={css.lifetimeAccess}>
            <CheckCircleIcon />
            <FormattedMessage id="MyClassesTab.lifetimeAccess" />
          </p>
        </div>
      </header>

      <footer className={css.cardFooter}>
        <div className={css.footerLeft}>
          <button
            type="button"
            className={css.menuButton}
            aria-label={intl.formatMessage({ id: 'MyClassesTab.moreActions' })}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(prev => !prev)}
          >
            <EllipsisIcon />
          </button>
          {isMenuOpen ? (
            <button type="button" className={css.cancelClassButton}>
              <FormattedMessage id="MyClassesTab.cancelClass" />
            </button>
          ) : null}
        </div>
        <div className={css.footerActions}>
          <button type="button" className={css.footerOutlineButton}>
            <CertificateIcon />
            <FormattedMessage id="MyClassesTab.downloadCertificate" />
          </button>
          <button type="button" className={css.footerOutlineButton}>
            <StarIcon />
            <FormattedMessage id="MyClassesTab.leaveReview" />
          </button>
          <button type="button" className={css.downloadButton}>
            <FormattedMessage id="MyClassesTab.download" />
          </button>
        </div>
      </footer>
    </article>
  );
};

export default DigitalDownloadProgramCard;
