import React, { useState } from 'react';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';

import css from './ClassProgramCard.module.css';

const CalendarIcon = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M12.6667 2.66667H3.33333C2.59695 2.66667 2 3.26362 2 4V13.3333C2 14.0697 2.59695 14.6667 3.33333 14.6667H12.6667C13.403 14.6667 14 14.0697 14 13.3333V4C14 3.26362 13.403 2.66667 12.6667 2.66667Z"
      stroke="currentColor"
      strokeWidth="1.33"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.666 1.33334V4.00001M5.33301 1.33334V4.00001M2 6.66667H14"
      stroke="currentColor"
      strokeWidth="1.33"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M8 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8C14.6667 4.3181 11.6819 1.33334 8 1.33334C4.3181 1.33334 1.33333 4.3181 1.33333 8C1.33333 11.6819 4.3181 14.6667 8 14.6667Z"
      stroke="currentColor"
      strokeWidth="1.33"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 4V8L10.6667 9.33334"
      stroke="currentColor"
      strokeWidth="1.33"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EllipsisIcon = () => (
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_d_4256_10854)">
<path d="M11.9999 11.8333C12.4602 11.8333 12.8333 11.4602 12.8333 11C12.8333 10.5397 12.4602 10.1666 11.9999 10.1666C11.5397 10.1666 11.1666 10.5397 11.1666 11C11.1666 11.4602 11.5397 11.8333 11.9999 11.8333Z" stroke="#101828" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M17.8333 11.8333C18.2935 11.8333 18.6666 11.4602 18.6666 11C18.6666 10.5397 18.2935 10.1666 17.8333 10.1666C17.373 10.1666 16.9999 10.5397 16.9999 11C16.9999 11.4602 17.373 11.8333 17.8333 11.8333Z" stroke="#101828" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6.16659 11.8333C6.62682 11.8333 6.99992 11.4602 6.99992 11C6.99992 10.5397 6.62682 10.1666 6.16659 10.1666C5.70635 10.1666 5.33325 10.5397 5.33325 11C5.33325 11.4602 5.70635 11.8333 6.16659 11.8333Z" stroke="#101828" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<filter id="filter0_d_4256_10854" x="0" y="0" width="24" height="24" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="1"/>
<feGaussianBlur stdDeviation="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.0392157 0 0 0 0 0.0496732 0 0 0 0 0.0705882 0 0 0 0.05 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4256_10854"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_4256_10854" result="shape"/>
</filter>
</defs>
</svg>

);

const CertificateIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g clip-path="url(#clip0_4256_10865)">
  <path d="M6.84175 11.575L5.83341 19.1667L10.0001 16.6667L14.1667 19.1667L13.1584 11.5667M15.8334 6.66671C15.8334 9.88837 13.2217 12.5 10.0001 12.5C6.77842 12.5 4.16675 9.88837 4.16675 6.66671C4.16675 3.44505 6.77842 0.833374 10.0001 0.833374C13.2217 0.833374 15.8334 3.44505 15.8334 6.66671Z" stroke="#D5D7DA" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <defs>
  <clipPath id="clip0_4256_10865">
  <rect width="20" height="20" fill="white"/>
  </clipPath>
  </defs>
  </svg>
  
);

const StarIcon = () => (
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.0001 1.66663L12.5751 6.88329L18.3334 7.72496L14.1667 11.7833L15.1501 17.5166L10.0001 14.8083L4.85008 17.5166L5.83341 11.7833L1.66675 7.72496L7.42508 6.88329L10.0001 1.66663Z" stroke="#D5D7DA" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

);

const SESSION_STATUS = {
  COMPLETED: 'completed',
  ACTIVE: 'active',
  UPCOMING: 'upcoming',
};

const MOCK_SESSIONS = [
  {
    id: 'session-1',
    status: SESSION_STATUS.COMPLETED,
    titleId: 'MyClassesTab.sessionFirst',
    dateId: 'MyClassesTab.sessionFirstDate',
  },
  {
    id: 'session-2',
    status: SESSION_STATUS.COMPLETED,
    titleId: 'MyClassesTab.sessionSecond',
    dateId: 'MyClassesTab.sessionSecondDate',
  },
  {
    id: 'session-3',
    status: SESSION_STATUS.ACTIVE,
    titleId: 'MyClassesTab.sessionThird',
    durationId: 'MyClassesTab.sessionDuration',
    scheduleId: 'MyClassesTab.sessionThirdSchedule',
  },
  {
    id: 'session-4',
    status: SESSION_STATUS.UPCOMING,
    titleId: 'MyClassesTab.sessionFourth',
    durationId: 'MyClassesTab.sessionDuration',
    scheduleId: 'MyClassesTab.sessionFourthSchedule',
  },
  {
    id: 'session-5',
    status: SESSION_STATUS.UPCOMING,
    titleId: 'MyClassesTab.sessionFifth',
    durationId: 'MyClassesTab.sessionDuration',
    scheduleId: 'MyClassesTab.sessionFifthSchedule',
  },
];

const SessionRow = ({ session }) => {
  const { status, titleId, dateId, durationId, scheduleId } = session;
  const isCompleted = status === SESSION_STATUS.COMPLETED;
  const isActive = status === SESSION_STATUS.ACTIVE;

  return (
    <li className={css.sessionRow}>
      <div className={css.sessionMain}>
        <div className={css.sessionTitleRow}>
          <p className={css.sessionTitle}>
            <FormattedMessage id={titleId} />
          </p>
          {isCompleted && dateId ? (
            <span className={css.sessionCompletedDate}>
              <CalendarIcon className={css.sessionIconMuted} />
              <FormattedMessage id={dateId} />
            </span>
          ) : null}
        </div>
        {!isCompleted && durationId && scheduleId ? (
          <div className={css.sessionMeta}>
            <span
              className={classNames(css.sessionMetaItem, {
                [css.sessionMetaItemActive]: isActive,
              })}
            >
              <ClockIcon className={css.sessionIcon} />
              <FormattedMessage id={durationId} />
            </span>
            <span
              className={classNames(css.sessionMetaItem, {
                [css.sessionMetaItemActive]: isActive,
              })}
            >
              <CalendarIcon className={css.sessionIcon} />
              <FormattedMessage id={scheduleId} />
            </span>
          </div>
        ) : null}
      </div>
      <div className={css.sessionAction}>
        {isCompleted ? (
          <span className={css.sessionStatusCompleted}>
            <FormattedMessage id="MyClassesTab.sessionCompleted" />
          </span>
        ) : (
          <button
            type="button"
            className={classNames(css.enterButton, {
              [css.enterButtonActive]: isActive,
              [css.enterButtonDisabled]: !isActive,
            })}
            disabled={!isActive}
          >
            <FormattedMessage id="MyClassesTab.enterSession" />
          </button>
        )}
      </div>
    </li>
  );
};

/**
 * Program card with header, session list, and footer actions.
 *
 * @component
 * @returns {JSX.Element}
 */
const ClassProgramCard = () => {
  const intl = useIntl();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <article className={css.root}>
      <header className={css.cardHeader}>
        <div
          className={css.thumbnail}
          role="img"
          aria-label={intl.formatMessage({ id: 'MyClassesTab.thumbnailAlt' })}
        />
        <div className={css.programInfo}>
          <h2 className={css.programTitle}>
            <FormattedMessage id="MyClassesTab.programTitle" />
          </h2>
          <p className={css.programAuthor}>
            <FormattedMessage
              id="MyClassesTab.programAuthor"
              values={{
                author: (
                  <span className={css.programAuthorName}>
                    <FormattedMessage id="MyClassesTab.programAuthorName" />
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
              <FormattedMessage id="MyClassesTab.tagIndividualCoaching" />
            </span>
          </div>
        </div>
      </header>

      <ul className={css.sessionList}>
        {MOCK_SESSIONS.map(session => (
          <SessionRow key={session.id} session={session} />
        ))}
      </ul>

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
          <button type="button" className={css.footerButton} disabled>
            <CertificateIcon />
            <FormattedMessage id="MyClassesTab.downloadCertificate" />
          </button>
          <button type="button" className={css.footerButton} disabled>
            <StarIcon />
            <FormattedMessage id="MyClassesTab.leaveReview" />
          </button>
        </div>
      </footer>
    </article>
  );
};

export default ClassProgramCard;
