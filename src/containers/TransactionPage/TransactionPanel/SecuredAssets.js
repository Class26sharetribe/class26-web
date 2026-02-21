import classNames from 'classnames';
import { useState } from 'react';
import { Heading, MuxPlayerModal } from '../../../components';
import { FormattedMessage } from '../../../util/reactIntl';
import css from './TransactionPanel.module.css';

/**
 * SecuredAssets renders the list of digital assets attached to a transaction.
 * - Videos (Mux): clicking the name opens the MuxPlayerModal which fetches a
 *   signed JWT token and plays the video in-app.
 * - Images / Documents: clicking the name opens the file in a new tab.
 *
 * Each `digitalAsset` in protectedData has the shape:
 *   { name, type, playback_id }  – video
 *   { name, type, url }   – image / document
 */
const SecuredAssets = props => {
  const { className, rootClassName, protectedData, onManageDisableScrolling } = props;
  const classes = classNames(rootClassName || css.deliveryInfoContainer, className);

  const [muxPlayerOpen, setMuxPlayerOpen] = useState(false);
  const [activePlaybackId, setActivePlaybackId] = useState(null);

  const { digitalAssets } = protectedData || {};

  if (!digitalAssets || digitalAssets.length === 0) {
    return null;
  }

  const handleVideoClick = playbackId => {
    setActivePlaybackId(playbackId);
    setMuxPlayerOpen(true);
  };

  const handlePlayerClose = () => {
    setMuxPlayerOpen(false);
    setActivePlaybackId(null);
  };

  return (
    <div className={classes}>
      {muxPlayerOpen && (
        <MuxPlayerModal
          id="secured-assets-mux-player-modal"
          playbackId={activePlaybackId}
          isOpen={muxPlayerOpen}
          onClose={handlePlayerClose}
          onManageDisableScrolling={onManageDisableScrolling}
        />
      )}

      <Heading as="h3" rootClassName={css.sectionHeading}>
        <FormattedMessage id="TransactionPanel.securedAssetsHeading" />
      </Heading>
      <FormattedMessage
        id="TransactionPanel.securedAssetsNote"
        values={{ validFor: 432000 / 86400 }}
      />
      <div className={css.shippingInfoContent}>
        {digitalAssets.map(asset => {
          const playbackId = asset.playback_id;
          const fileUrl = asset.url;
          const isVideo = asset.type === 'video' && !!playbackId;

          console.log('SecuredAssets: rendering asset', asset);
          return (
            <div key={asset.name}>
              <li>
                {isVideo ? (
                  <button
                    type="button"
                    onClick={() => handleVideoClick(playbackId)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      color: 'inherit',
                      textDecoration: 'underline',
                      font: 'inherit',
                    }}
                  >
                    {asset.name}
                  </button>
                ) : (
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    {asset.name}
                  </a>
                )}{' '}
                ({asset.type})
              </li>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SecuredAssets;
