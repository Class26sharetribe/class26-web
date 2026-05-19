import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { getMuxJwtToken } from '../../../util/api';
import { createResourceLocatorString } from '../../../util/routes';
import { manageDisableScrolling } from '../../../ducks/ui.duck';
import { useRouteConfiguration } from '../../../context/routeConfigurationContext';

import { MuxPlayerModal } from '../../../components';

import css from './VideoCourseProgramCard.module.css';
import { isCustomerReviewPending } from '../../../transactions/transactionProcessPurchase';

const buildMuxThumbnailUrl = (playbackId, token) => {
  if (!playbackId) return null;
  const tokenParam = token ? `&token=${token}` : '';
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?time=1&width=960&height=540&fit_mode=crop${tokenParam}`;
};

const fetchMuxThumbnailToken = playbackId =>
  getMuxJwtToken({ playbackId, type: 'thumbnail' }).then(data => data.token);

const CheckCircleIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <circle cx="10" cy="10" r="8.33333" fill="#067647" />
    <path
      d="M6.66699 10L8.75033 12.0833L13.3337 7.5"
      stroke="white"
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronIcon = ({ expanded }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
    className={classNames(css.chevron, { [css.chevronExpanded]: expanded })}
  >
    <path
      d="M5 7.5L10 12.5L15 7.5"
      stroke="#717680"
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlayIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <circle cx="16" cy="16" r="16" fill="white" fillOpacity="0.85" />
    <path d="M13 10.5L22 16L13 21.5V10.5Z" fill="#101828" />
  </svg>
);

const SmallPlayIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path d="M2.5 1.5L10 6L2.5 10.5V1.5Z" fill="white" />
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
      d="M10 12.5V17.5L7.5 16.25L5 17.5V12.5M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
      stroke="currentColor"
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.8333 3.33334H4.16667C3.70643 3.33334 3.33333 3.70643 3.33333 4.16667V6.66667C3.33333 7.12691 3.70643 7.5 4.16667 7.5H15.8333C16.2936 7.5 16.6667 7.12691 16.6667 6.66667V4.16667C16.6667 3.70643 16.2936 3.33334 15.8333 3.33334Z"
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

const VideoItem = ({ video, onPlay }) => {
  const { title, description, variant } = video;
  const playbackId = video.video?.playback_id;

  const [thumbnailToken, setThumbnailToken] = useState(null);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [thumbnailUnavailable, setThumbnailUnavailable] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const [thumbnailRetry, setThumbnailRetry] = useState(0);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!playbackId || fetchedRef.current) return;
    fetchedRef.current = true;
    fetchMuxThumbnailToken(playbackId)
      .then(token => setThumbnailToken(token))
      .catch(() => setThumbnailError(true));
  }, [playbackId]);

  const thumbnailUrl =
    thumbnailError || !thumbnailToken ? null : buildMuxThumbnailUrl(playbackId, thumbnailToken);
  const thumbnailSrc =
    thumbnailUrl && !thumbnailUnavailable ? `${thumbnailUrl}&retry=${thumbnailRetry}` : null;

  const handleThumbnailError = () => {
    if (thumbnailRetry < 3) {
      setThumbnailRetry(prev => prev + 1);
    } else {
      setThumbnailUnavailable(true);
    }
  };

  return (
    <li className={css.videoItem}>
      <p className={css.videoItemTitle}>{title}</p>
      <button
        type="button"
        className={classNames(css.videoThumbnail, {
          [css.videoThumbnailGreen]: variant === 'green',
          [css.videoThumbnailGrey]: variant === 'grey' || !thumbnailSrc,
        })}
        onClick={() => playbackId && onPlay(playbackId)}
        disabled={!playbackId}
        aria-label={title}
      >
        {thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt=""
            aria-hidden
            className={classNames(css.videoThumbnailImg, {
              [css.videoThumbnailImgLoaded]: thumbnailLoaded,
            })}
            onLoad={() => setThumbnailLoaded(true)}
            onError={handleThumbnailError}
          />
        ) : null}
        <div className={css.videoPlayOverlay}>
          <PlayIcon />
        </div>
        <div className={css.videoProgressBar}>
          <SmallPlayIcon />
          <div className={css.videoProgressTrack}>
            <div className={css.videoProgressFill} />
          </div>
        </div>
      </button>
      {description ? <p className={css.videoDescription}>{description}</p> : null}
    </li>
  );
};

const AccordionSection = ({ section, isExpanded, onToggle, onPlay }) => {
  const { id, title, description, lessons } = section;
  const sectionId = `accordion-${id}`;

  return (
    <li className={css.accordionItem}>
      <button
        type="button"
        className={css.accordionTrigger}
        aria-expanded={isExpanded}
        aria-controls={sectionId}
        onClick={onToggle}
      >
        <span className={css.accordionTitle}>{title}</span>
        <ChevronIcon expanded={isExpanded} />
      </button>
      {isExpanded && lessons?.length ? (
        <div id={sectionId} className={css.accordionPanel}>
          <ul className={css.videoList}>
            {lessons.map(video => (
              <VideoItem key={video.id} video={video} onPlay={onPlay} />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
};

/**
 * Video course program card with accordion topics and footer actions.
 *
 * @component
 * @returns {JSX.Element}
 */
const VideoCourseProgramCard = ({ tx, tags, imageUrl }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [expandedSectionId, setExpandedSectionId] = useState('section-1');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [muxPlayerOpen, setMuxPlayerOpen] = useState(false);
  const [activePlaybackId, setActivePlaybackId] = useState(null);
  const history = useHistory();
  const routes = useRouteConfiguration();

  const onManageDisableScrolling = (id, shouldDisable) =>
    dispatch(manageDisableScrolling(id, shouldDisable));

  const {
    attributes: { transitions },
    listing,
    provider,
  } = tx;
  const { displayName: providerName } = provider.attributes.profile;
  const { title, publicData } = listing.attributes;
  const { courseModules } = publicData;

  const showReview = isCustomerReviewPending(transitions);

  const handleToggle = sectionId => {
    setExpandedSectionId(prev => (prev === sectionId ? null : sectionId));
  };

  const handlePlay = playbackId => {
    setActivePlaybackId(playbackId);
    setMuxPlayerOpen(true);
  };

  return (
    <article className={css.root}>
      {muxPlayerOpen ? (
        <MuxPlayerModal
          id={`video-course-player-${tx.id.uuid}`}
          playbackId={activePlaybackId}
          isOpen={muxPlayerOpen}
          onClose={() => {
            setMuxPlayerOpen(false);
            setActivePlaybackId(null);
          }}
          onManageDisableScrolling={onManageDisableScrolling}
        />
      ) : null}
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

          {/* <p className={css.availability}>
            <CheckCircleIcon />
            <span className={css.availabilityLabel}>
              <FormattedMessage id="MyClassesTab.availableUntilLabel" />
            </span>
            <span className={css.availabilityDate}>
              <FormattedMessage id="MyClassesTab.videoCourseAvailableUntil" />
            </span>
          </p> */}
        </div>
      </header>

      <ul className={css.accordionList}>
        {courseModules.map(section => (
          <AccordionSection
            key={section.id}
            section={section}
            isExpanded={expandedSectionId === section.id}
            onToggle={() => handleToggle(section.id)}
            onPlay={handlePlay}
          />
        ))}
      </ul>

      {showReview && (
        <footer className={css.cardFooter}>
          <div className={css.footerActions}>
            <button
              className={css.footerOutlineButton}
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
              <StarIcon />
              <FormattedMessage id="MyClassesTab.leaveReview" />
            </button>
          </div>
        </footer>
      )}
    </article>
  );
};

export default VideoCourseProgramCard;
