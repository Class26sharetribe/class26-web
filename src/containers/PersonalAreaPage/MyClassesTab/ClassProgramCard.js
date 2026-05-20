import React, { useState } from 'react';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { createResourceLocatorString } from '../../../util/routes';
import { useRouteConfiguration } from '../../../context/routeConfigurationContext';

import css from './ClassProgramCard.module.css';
import { useHistory } from 'react-router-dom';
import { transitions } from '../../../transactions/transactionProcessBooking';

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
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M10.0003 10.8333C10.4606 10.8333 10.8337 10.4602 10.8337 9.99999C10.8337 9.53975 10.4606 9.16666 10.0003 9.16666C9.54009 9.16666 9.16699 9.53975 9.16699 9.99999C9.16699 10.4602 9.54009 10.8333 10.0003 10.8333Z"
      stroke="#717680"
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.0003 4.99999C10.4606 4.99999 10.8337 4.6269 10.8337 4.16666C10.8337 3.70642 10.4606 3.33333 10.0003 3.33333C9.54009 3.33333 9.16699 3.70642 9.16699 4.16666C9.16699 4.6269 9.54009 4.99999 10.0003 4.99999Z"
      stroke="#717680"
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.0003 16.6667C10.4606 16.6667 10.8337 16.2936 10.8337 15.8333C10.8337 15.3731 10.4606 15 10.0003 15C9.54009 15 9.16699 15.3731 9.16699 15.8333C9.16699 16.2936 9.54009 16.6667 10.0003 16.6667Z"
      stroke="#717680"
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CertificateIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M6.66699 11.6667L8.33366 13.3333L13.3337 8.33334M18.3337 10C18.3337 14.6024 14.6027 18.3333 10.0003 18.3333C5.39795 18.3333 1.66699 14.6024 1.66699 10C1.66699 5.39763 5.39795 1.66667 10.0003 1.66667C14.6027 1.66667 18.3337 5.39763 18.3337 10Z"
      stroke="currentColor"
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StarIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M10.0003 1.66667L12.5753 6.88334L18.3337 7.72501L14.167 11.7833L15.1503 17.5167L10.0003 14.8083L4.85033 17.5167L5.83366 11.7833L1.66699 7.72501L7.42533 6.88334L10.0003 1.66667Z"
      stroke="currentColor"
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SESSION_STATUS = {
  COMPLETED: 'completed',
  ACTIVE: 'active',
  UPCOMING: 'upcoming',
};

/**
 * Returns SESSION_STATUS for a session based on current time.
 * Completed if now > startTime + 60 min.
 * Active if it is the first non-completed session.
 * Upcoming otherwise.
 */
const getSessionStatus = (session, hasActiveAlready) => {
  const { date, startTime } = session;
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = (startTime || '00:00').split(':').map(Number);
  const sessionStart = new Date(year, month - 1, day, hours, minutes || 0);
  const cutoff = new Date(sessionStart.getTime() + 60 * 60 * 1000);
  if (new Date() > cutoff) return SESSION_STATUS.COMPLETED;
  if (!hasActiveAlready) return SESSION_STATUS.ACTIVE;
  return SESSION_STATUS.UPCOMING;
};

const SessionRow = ({ session, index, status, handleVideoCall, timezone }) => {
  const intl = useIntl();
  const isCompleted = status === SESSION_STATUS.COMPLETED;
  const isActive = status === SESSION_STATUS.ACTIVE;

  const { date, startTime } = session;
  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day, 12, 0, 0);
  const formattedDate = intl.formatDate(dateObj, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: timezone || undefined,
  });
  let formattedTime = null;
  if (startTime) {
    const [h, m] = startTime.split(':').map(Number);
    const timeObj = new Date(year, month - 1, day, h, m || 0);
    formattedTime = intl.formatTime(timeObj, {
      hour: 'numeric',
      hour12: true,
      timeZone: timezone || undefined,
      timeZoneName: 'short',
    });
  }
  const label = intl.formatMessage({ id: 'OrderPanel.sessionLabel' }, { index: index + 1 });
  const dateTimeStr = `${formattedDate}${formattedTime ? ` – ${formattedTime}` : ''}`;

  return (
    <li className={css.sessionRow}>
      <div className={css.sessionMain}>
        <div className={css.sessionTitleRow}>
          <p className={css.sessionTitle}>{label}</p>
          <span
            className={classNames(css.sessionCompletedDate, {
              [css.sessionMetaItemActive]: isActive,
            })}
          >
            <CalendarIcon className={css.sessionIconMuted} />
            {dateTimeStr}
          </span>
        </div>
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
            onClick={isActive ? handleVideoCall : undefined}
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
const ClassProgramCard = ({ tx, tags, imageUrl }) => {
  const intl = useIntl();
  const history = useHistory();
  const routes = useRouteConfiguration();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const {
    attributes: { metadata, lastTransition },
    booking: {
      attributes: { start },
    },
    listing,
    provider,
  } = tx;
  const { displayName: providerName } = provider.attributes.profile;
  const {
    title,
    publicData: { sessionDates: listingSessionDates },
    availabilityPlan: { timezone },
  } = listing.attributes;

  const sessionDates = listingSessionDates || metadata?.sessionDates;

  const handleVideoCall = () => {
    history.push(`/video-meeting?roomCode=${metadata.customerCode}`);
  };

  const sorted = [...(sessionDates || [])].sort((a, b) =>
    `${a.date}T${a.startTime || '00:00'}`.localeCompare(`${b.date}T${b.startTime || '00:00'}`)
  );
  let hasActive = false;
  const sessionsWithStatus = sorted.map(session => {
    const status = getSessionStatus(session, hasActive);
    if (status === SESSION_STATUS.ACTIVE) hasActive = true;
    return { session, status };
  });

  const canCancel = start ? new Date() < new Date(start) : false;
  const isCancelled = lastTransition === transitions.CANCEL;
  const showReview = lastTransition === transitions.COMPLETE;

  return (
    <article className={css.root}>
      <header className={css.cardHeader}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={intl.formatMessage({ id: 'MyClassesTab.digitalDownloadThumbnailAlt' })}
            className={css.thumbnailImage}
          />
        ) : (
          <div className={css.thumbnailPlaceholder} aria-hidden />
        )}
        <div className={css.programInfo}>
          <h2 className={css.programTitle}>{title}</h2>
          <p className={css.programAuthor}>
            <FormattedMessage
              id="MyClassesTab.programAuthor"
              values={{
                author: <span className={css.programAuthorName}>{providerName}</span>,
              }}
            />
          </p>
          {tags}
        </div>
      </header>

      {!isCancelled && (
        <ul className={css.sessionList}>
          {sessionsWithStatus.map(({ session, status }, i) => (
            <SessionRow
              key={session.date + i}
              session={session}
              index={i}
              status={status}
              handleVideoCall={handleVideoCall}
              timezone={timezone}
            />
          ))}
        </ul>
      )}

      {!isCancelled && (
        <footer className={css.cardFooter}>
          {canCancel && (
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
                <button
                  type="button"
                  className={css.cancelClassButton}
                  onClick={() => {
                    const path = createResourceLocatorString(
                      'OrderDetailsPage',
                      routes,
                      { id: tx.id.uuid },
                      {}
                    );
                    history.push(path);
                  }}
                >
                  <FormattedMessage id="MyClassesTab.cancelClass" />
                </button>
              ) : null}
            </div>
          )}
          {showReview && (
            <div className={css.footerActions}>
              {/* <button type="button" className={css.footerButton} disabled>
            <CertificateIcon />
            <FormattedMessage id="MyClassesTab.downloadCertificate" />
          </button> */}
              <button type="button" className={css.footerOutlineButton} disabled>
                <StarIcon />
                <FormattedMessage id="MyClassesTab.leaveReview" />
              </button>
            </div>
          )}
        </footer>
      )}
    </article>
  );
};

export default ClassProgramCard;
