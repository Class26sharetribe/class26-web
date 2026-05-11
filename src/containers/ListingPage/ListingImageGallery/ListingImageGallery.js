import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import MuxPlayer from '@mux/mux-player-react';
import ReactImageGallery from 'react-image-gallery';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { getMuxJwtToken } from '../../../util/api';
import {
  AspectRatioWrapper,
  Button,
  IconClose,
  IconArrowHead,
  IconSpinner,
  ResponsiveImage,
} from '../../../components';

// Copied directly from
// `node_modules/react-image-gallery/styles/image-gallery.css`. The
// copied file is left unedited, and all the overrides are defined in
// the component CSS file below.
import './image-gallery.css';

import css from './ListingImageGallery.module.css';

const IMAGE_GALLERY_OPTIONS = {
  showPlayButton: false,
  disableThumbnailScroll: true,
};
const MAX_LANDSCAPE_ASPECT_RATIO = 2; // 2:1
const MAX_PORTRAIT_ASPECT_RATIO = 4 / 3;
const FIGMA_GALLERY_WIDTH = 715;
const FIGMA_GALLERY_HEIGHT = 402;

const getIdString = id => id?.uuid || id;

/**
 * Build ordered slides from `publicData.mediaGallery` when present; otherwise
 * one slide per listing image.
 *
 * @param {Array} images
 * @param {Array<{ type?: string, imageId?: string, playbackId?: string, uploading?: boolean }>} [mediaGallery]
 * @returns {Array<{ kind: 'image', image: import('../../../util/types').propTypes.image } | { kind: 'video', playbackId: string }>}
 */
const buildGallerySlides = (images, mediaGallery) => {
  const imageList = images || [];
  const imageById = new Map(imageList.map(img => [String(getIdString(img?.id)), img]));

  if (!Array.isArray(mediaGallery) || mediaGallery.length === 0) {
    return imageList.map(image => ({ kind: 'image', image }));
  }

  const fromGallery = mediaGallery
    .filter(entry => entry && !entry.uploading)
    .map(entry => {
      if (entry.type === 'video' && typeof entry.playbackId === 'string' && entry.playbackId) {
        return { kind: 'video', playbackId: entry.playbackId };
      }
      if (entry.type === 'image' && entry.imageId) {
        const img = imageById.get(String(entry.imageId));
        return img ? { kind: 'image', image: img } : null;
      }
      return null;
    })
    .filter(Boolean);

  return fromGallery.length > 0 ? fromGallery : imageList.map(image => ({ kind: 'image', image }));
};

const muxPosterUrl = playbackId =>
  `https://image.mux.com/${playbackId}/thumbnail.jpg?width=960&height=540&fit_mode=crop`;

const getFirstImageAspectRatio = (firstImage, scaledVariant) => {
  if (!firstImage) {
    return { aspectWidth: 1, aspectHeight: 1 };
  }

  const v = firstImage?.attributes?.variants?.[scaledVariant];
  const w = v?.width;
  const h = v?.height;
  const hasDimensions = !!w && !!h;
  const aspectRatio = w / h;

  // We keep the fractions separated as these are given to AspectRatioWrapper
  // which expects separate width and height
  return hasDimensions && aspectRatio >= MAX_LANDSCAPE_ASPECT_RATIO
    ? { aspectWidth: 2, aspectHeight: 1 }
    : hasDimensions && aspectRatio <= MAX_PORTRAIT_ASPECT_RATIO
      ? { aspectWidth: 4, aspectHeight: 3 }
      : hasDimensions
        ? { aspectWidth: w, aspectHeight: h }
        : { aspectWidth: 1, aspectHeight: 1 };
};

const PlayIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M40 0C62.0914 0 80 17.9086 80 40C80 62.0914 62.0914 80 40 80C17.9086 80 0 62.0914 0 40C0 17.9086 17.9086 0 40 0ZM33.75 25.3281C32.0834 24.3966 30 25.5607 30 27.4238V52.5762C30 54.4393 32.0834 55.6034 33.75 54.6719L56.25 42.0957C57.9165 41.1641 57.9165 38.8359 56.25 37.9043L33.75 25.3281Z"
      fill="white"
      fillOpacity="0.3"
    />
  </svg>
);

/**
 * Mux video slide: poster + presentation chrome, then signed playback (ListingCard pattern).
 *
 * @param {Object} props
 * @param {string} props.playbackId
 * @param {number} props.aspectWidth
 * @param {number} props.aspectHeight
 * @param {string} props.itemWrapperClassName
 * @param {string} props.presentationLabel
 * @returns {JSX.Element}
 */
const GalleryMuxSlide = props => {
  const {
    playbackId,
    aspectWidth,
    aspectHeight,
    isActiveSlide,
    itemWrapperClassName,
    presentationLabel,
  } = props;
  const intl = useIntl();
  const [playing, setPlaying] = useState(false);


  useEffect(() => {
    if (!isActiveSlide) {
      setPlaying(false);
    }
  }, [isActiveSlide]);

  useEffect(() => {
    if (!playing || !playbackId) {
      return;
    }

    let cancelled = false;

    getMuxJwtToken({ playbackId })
      .then(data => {
        if (!cancelled) {
        }
      })
      .catch(() => {
        if (!cancelled) {
        }
      })
      .finally(() => {
        if (!cancelled) {
        }
      });

    return () => {
      cancelled = true;
    };
  }, [playing, playbackId, intl]);

  return (
    <AspectRatioWrapper
      width={aspectWidth || 1}
      height={aspectHeight || 1}
      className={itemWrapperClassName}
    >
      <div className={css.videoSlide}>
        <MuxPlayer
          className={css.muxPlayer}
          playbackId={playbackId}
          streamType="on-demand"
          autoPlay
          playsInline
          controls
          accentColor="#FFFFFF"
          primaryColor="#ddd"
          secondaryColor="transparent"

        />

      </div>
    </AspectRatioWrapper>
  );
};

/**
 * The ListingImageGallery component.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.rootClassName] - Custom class that overrides the default class for the root element
 * @param {Array} props.images - Listing images (SDK image entities)
 * @param {Array<string>} props.imageVariants - The image variants
 * @param {Array<string>} props.thumbnailVariants - The thumbnail variants
 * @param {Array<{ type?: string, imageId?: string, playbackId?: string, uploading?: boolean }>} [props.mediaGallery] - `publicData.mediaGallery` when media mode is used
 * @param {string} [props.listingTitle] - Listing title for video slide accessibility
 * @returns {JSX.Element} listing image gallery component
 */
const ListingImageGallery = props => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intl = useIntl();
  const {
    rootClassName,
    className,
    images,
    imageVariants,
    thumbnailVariants,
    mediaGallery,
    listingTitle = '',
  } = props;
  const thumbVariants = thumbnailVariants || imageVariants;

  const slides = useMemo(() => buildGallerySlides(images, mediaGallery), [images, mediaGallery]);

  const firstImageForAspect = useMemo(() => {
    const firstImgSlide = slides.find(s => s.kind === 'image');
    return firstImgSlide?.image || images?.[0];
  }, [slides, images]);

  const { aspectWidth, aspectHeight } =
    slides.length > 0 && slides.every(s => s.kind === 'video')
      ? { aspectWidth: 16, aspectHeight: 9 }
      : getFirstImageAspectRatio(firstImageForAspect, imageVariants?.[0]);

  const itemAspect = isFullscreen
    ? { aspectWidth, aspectHeight }
    : { aspectWidth: FIGMA_GALLERY_WIDTH, aspectHeight: FIGMA_GALLERY_HEIGHT };

  const presentationLabel = intl.formatMessage({ id: 'ListingImageGallery.presentationLabel' });

  const items = slides.map((slide, i) => {
    const count = slides.length;
    if (slide.kind === 'video') {
      return {
        kind: 'video',
        slideIndex: i,
        original: '',
        playbackId: slide.playbackId,
        thumbnail: muxPosterUrl(slide.playbackId),
        alt: listingTitle
          ? intl.formatMessage(
            { id: 'ListingImageGallery.videoAltText' },
            { title: listingTitle, index: i + 1, count }
          )
          : intl.formatMessage(
            { id: 'ListingImageGallery.videoAltTextNoTitle' },
            { index: i + 1, count }
          ),
        thumbAlt: intl.formatMessage(
          { id: 'ListingImageGallery.videoThumbnailAltText' },
          { index: i + 1, count }
        ),
      };
    }
    const img = slide.image;
    return {
      kind: 'image',
      slideIndex: i,
      original: '',
      alt: intl.formatMessage({ id: 'ListingImageGallery.imageAltText' }, { index: i + 1, count }),
      thumbAlt: intl.formatMessage(
        { id: 'ListingImageGallery.imageThumbnailAltText' },
        { index: i + 1, count }
      ),
      thumbnail: img.attributes?.variants?.[thumbVariants[0]],
      image: img,
    };
  });

  // Keep state index in bounds if items are loaded/changed dynamically.
  useEffect(() => {
    if (items.length === 0) {
      return;
    }
    setCurrentIndex(i => Math.min(i, items.length - 1));
  }, [items.length]);

  const imageSizesMaybe = isFullscreen
    ? {}
    : {
      sizes: `(max-width: 1024px) 100vw, (max-width: 1200px) calc(100vw - 192px), ${FIGMA_GALLERY_WIDTH}px`,
    };

  const renderItem = item => {
    const itemWrapperClass = isFullscreen ? css.itemWrapperFullscreen : css.itemWrapper;
    if (item.kind === 'video') {
      return (
        <GalleryMuxSlide
          playbackId={item.playbackId}
          aspectWidth={itemAspect.aspectWidth || 1}
          aspectHeight={itemAspect.aspectHeight || 1}
          isActiveSlide={currentIndex === item.slideIndex}
          itemWrapperClassName={itemWrapperClass}
          presentationLabel={presentationLabel}
        />
      );
    }
    return (
      <AspectRatioWrapper
        width={itemAspect.aspectWidth || 1}
        height={itemAspect.aspectHeight || 1}
        className={itemWrapperClass}
      >
        <div className={css.itemCentering}>
          <ResponsiveImage
            rootClassName={css.item}
            image={item.image}
            alt={item.alt}
            variants={imageVariants}
            {...imageSizesMaybe}
          />
        </div>
      </AspectRatioWrapper>
    );
  };

  const renderThumbInner = item => {
    if (item.kind === 'video') {
      return (
        <div>
          <img className={css.thumb} src={item.thumbnail} alt={item.thumbAlt} />
        </div>
      );
    }
    return (
      <div>
        <ResponsiveImage
          rootClassName={css.thumb}
          image={item.image}
          alt={item.thumbAlt}
          variants={thumbVariants}
          sizes="88px"
        />
      </div>
    );
  };

  const onScreenChange = isFull => {
    setIsFullscreen(isFull);
  };

  const onSlide = index => {
    setCurrentIndex(index);
  };

  const renderLeftNav = (onClick, disabled) => {
    return (
      <button
        type="button"
        data-listing-gallery-nav
        className={classNames(
          'image-gallery-icon',
          'image-gallery-left-nav',
          css.navBottom,
          css.navBottomLeft
        )}
        disabled={disabled}
        onClick={onClick}
        aria-label={intl.formatMessage({ id: 'ListingImageGallery.previousImage' })}
      >
        <IconArrowHead direction="left" size="small" className={css.navBottomArrow} />
      </button>
    );
  };
  const renderRightNav = (onClick, disabled) => {
    return (
      <button
        type="button"
        data-listing-gallery-nav
        className={classNames(
          'image-gallery-icon',
          'image-gallery-right-nav',
          css.navBottom,
          css.navBottomRight
        )}
        disabled={disabled}
        onClick={onClick}
        aria-label={intl.formatMessage({ id: 'ListingImageGallery.nextImage' })}
      >
        <IconArrowHead direction="right" size="small" className={css.navBottomArrow} />
      </button>
    );
  };
  const renderFullscreenButton = (onClick, isFullscreenState) => {
    return isFullscreenState ? (
      <Button
        onClick={onClick}
        rootClassName={css.close}
        title={intl.formatMessage({ id: 'ListingImageGallery.closeModalTitle' })}
      >
        <span className={css.closeText}>
          <FormattedMessage id="ListingImageGallery.closeModal" />
        </span>
        <IconClose rootClassName={css.closeIcon} />
      </Button>
    ) : (
      <button className={css.openFullscreen} onClick={onClick}>
        <FormattedMessage
          id="ListingImageGallery.viewImagesButton"
          values={{ count: items.length }}
        />
      </button>
    );
  };

  if (items.length === 0) {
    return <ResponsiveImage className={css.noImage} image={null} variants={[]} alt="" />;
  }

  const classes = classNames(rootClassName || css.root, className);

  return (
    <ReactImageGallery
      additionalClass={classes}
      items={items}
      renderItem={renderItem}
      // renderThumbInner={renderThumbInner}
      onScreenChange={onScreenChange}
      onSlide={onSlide}
      startIndex={currentIndex}
      renderLeftNav={renderLeftNav}
      renderRightNav={renderRightNav}
      // renderFullscreenButton={renderFullscreenButton}
      {...IMAGE_GALLERY_OPTIONS}
      showThumbnails={false}
      showFullscreenButton={false}
    />
  );
};

export default ListingImageGallery;
