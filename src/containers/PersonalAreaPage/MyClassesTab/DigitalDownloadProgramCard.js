import { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useRouteConfiguration } from '../../../context/routeConfigurationContext';
import { getSecuredUrl } from '../../../util/api';
import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { createResourceLocatorString } from '../../../util/routes';

import { IconSpinner } from '../../../components';

import {
  isCustomerReviewPending
} from '../../../transactions/transactionProcessPurchase';
import css from './DigitalDownloadProgramCard.module.css';

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

/**
 * Digital download program card with lifetime access and download actions.
 *
 * @component
 * @returns {JSX.Element}
 */
const DigitalDownloadProgramCard = ({ tx, imageUrl, tags }) => {
  const intl = useIntl();
  const history = useHistory();
  const routes = useRouteConfiguration();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAssetsOpen, setIsAssetsOpen] = useState(false);
  const [loadingAssetKey, setLoadingAssetKey] = useState(null);
  const {
    attributes: { transitions },
    listing,
    provider,
  } = tx;
  const { displayName: providerName } = provider.attributes.profile;
  const { title, publicData } = listing.attributes;
  const { digitalAssets } = publicData;

  const showReview = isCustomerReviewPending(transitions);

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

          <p className={css.lifetimeAccess}>
            <CheckCircleIcon />
            <FormattedMessage id="MyClassesTab.lifetimeAccess" />
          </p>
        </div>
      </header>

      <footer className={css.cardFooter}>
        <div className={css.footerLeft}>
          {/* <button
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
          ) : null} */}
        </div>
        <div className={css.footerActions}>
          {/* <button type="button" className={css.footerOutlineButton}>
            <CertificateIcon />
            <FormattedMessage id="MyClassesTab.downloadCertificate" />
          </button> */}
          {showReview && (
            <button
              type="button"
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
          )}
          <button
            type="button"
            className={css.downloadButton}
            onClick={() => setIsAssetsOpen(prev => !prev)}
          >
            <FormattedMessage id="MyClassesTab.download" />
          </button>
        </div>
      </footer>

      {isAssetsOpen && digitalAssets?.length > 0 ? (
        <ul className={css.assetsList}>
          {digitalAssets.map((asset, i) => (
            <li key={asset.key || i} className={css.assetRow}>
              <p className={css.lifetimeAccess}>
                <CheckCircleIcon />
                <span className={css.assetName}>{asset.name}</span>
              </p>
              <button
                type="button"
                className={css.viewButton}
                disabled={loadingAssetKey === asset.key}
                onClick={() => {
                  setLoadingAssetKey(asset.key);
                  getSecuredUrl({ key: asset.key, txId: tx.id.uuid, listingId: listing.id.uuid })
                    .then(res => {
                      window.open(res.data.url, '_blank', 'noopener,noreferrer');
                    })
                    .catch(err => {
                      window.alert(err?.message || 'Failed to get download URL. Please try again.');
                    })
                    .finally(() => {
                      setLoadingAssetKey(null);
                    });
                }}
              >
                {loadingAssetKey === asset.key ? (
                  <IconSpinner />
                ) : (
                  <FormattedMessage id="MyClassesTab.viewAsset" />
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
};

export default DigitalDownloadProgramCard;
