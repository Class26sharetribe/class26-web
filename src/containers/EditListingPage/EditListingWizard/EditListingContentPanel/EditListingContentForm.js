import * as UpChunk from '@mux/upchunk';
import React, { useEffect, useRef, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Field, Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';

// Import configs and util modules
import { FormattedMessage, useIntl } from '../../../../util/reactIntl';
import {
  generatePresignedUrl,
  getSecuredUrl,
  getMuxAsset,
  getMuxJwtToken,
  getMuxUploadUrl,
} from '../../../../util/api';

// Import shared components
import {
  Button,
  FieldTextInput,
  Form,
  IconArrowHead,
  IconFilePlus,
  IconMenu,
  InlineTextButton,
  IconPlay,
  IconPlaySolid,
  IconSpinner,
  IconTrash,
  IconVideo,
  IconZap,
  MuxPlayerModal,
} from '../../../../components';

// Import modules from this directory
import css from './EditListingContentForm.module.css';

const MUX_ASSET_POLL_ATTEMPTS = 20;
const MUX_ASSET_POLL_DELAY_MS = 1500;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const createId = prefix =>
  `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;

const formatFileSize = size => {
  if (!size) {
    return '';
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDuration = duration => {
  if (!duration && duration !== 0) {
    return null;
  }

  const totalSeconds = Math.max(0, Math.round(duration));
  if (totalSeconds < 60) {
    return `${totalSeconds} ${totalSeconds === 1 ? 'second' : 'seconds'}`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return seconds === 0
    ? `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
    : `${minutes}:${seconds.toString().padStart(2, '0')} minutes`;
};

const pollMuxAsset = async uploadId => {
  let lastError = null;

  for (let i = 0; i < MUX_ASSET_POLL_ATTEMPTS; i += 1) {
    try {
      const assetData = await getMuxAsset({ uploadId });
      if (assetData?.state === 'completed') {
        return assetData;
      }
    } catch (e) {
      lastError = e;
    }
    await delay(MUX_ASSET_POLL_DELAY_MS);
  }

  throw lastError || new Error('Mux asset was not ready in time');
};

const buildMuxThumbnailUrl = (playbackId, token) => {
  if (!playbackId) {
    return null;
  }
  const tokenParam = token ? `&token=${token}` : '';
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?time=1&width=960&height=540&fit_mode=crop${tokenParam}`;
};

const fetchMuxThumbnailToken = playbackId =>
  getMuxJwtToken({ playbackId, type: 'thumbnail' }).then(data => data.token);

const UpdateListingError = props => {
  return props.error ? (
    <p className={css.error}>
      <FormattedMessage id="EditListingContentForm.updateFailed" />
    </p>
  ) : null;
};

const PublishListingError = props => {
  return props.error ? (
    <p className={css.error}>
      <FormattedMessage id="EditListingContentForm.publishListingFailed" />
    </p>
  ) : null;
};

const VideoUploadField = props => {
  const { disabled, video, onChange, onUploadingChange, onVideoUploaded = () => {} } = props;
  const intl = useIntl();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);

  const setUploadingState = value => {
    setUploading(value);
    onUploadingChange(value);
  };

  const handleFileChange = async e => {
    const file = e.target.files[0];
    e.target.value = '';

    if (!file) {
      return;
    }

    try {
      setUploadError(null);
      setUploadProgress(0);
      setUploadingState(true);
      onChange({
        name: file.name,
        size: file.size,
        uploading: true,
      });

      const uploadData = await getMuxUploadUrl({ playback_policy: ['signed'] });
      if (!uploadData?.url || !uploadData?.id) {
        throw new Error('Failed to get upload URL from server');
      }

      const upload = UpChunk.createUpload({
        endpoint: uploadData.url,
        file,
        chunkSize: 5120,
      });

      upload.on('progress', progress => {
        setUploadProgress(Math.round(progress.detail));
      });

      upload.on('error', err => {
        console.error('Mux upload error:', err.detail);
        setUploadError(intl.formatMessage({ id: 'EditListingContentForm.videoUploadFailed' }));
        setUploadProgress(0);
        setUploadingState(false);
        onChange(null);
      });

      upload.on('success', async () => {
        try {
          const assetData = await pollMuxAsset(uploadData.id);
          onChange({
            asset_id: assetData.asset_id,
            playback_id: assetData.playback_id,
            duration: assetData.duration,
            name: file.name,
            size: file.size,
          });
          onVideoUploaded(assetData.asset_id);
          setUploadProgress(100);
          setUploadingState(false);
        } catch (err) {
          console.error('Error processing Mux asset:', err);
          setUploadError(intl.formatMessage({ id: 'EditListingContentForm.videoProcessFailed' }));
          setUploadProgress(0);
          setUploadingState(false);
          onChange(null);
        }
      });
    } catch (err) {
      console.error('Error starting Mux upload:', err);
      setUploadError(intl.formatMessage({ id: 'EditListingContentForm.videoUploadFailed' }));
      setUploadingState(false);
      onChange(null);
    }
  };

  const progress = video?.playback_id ? 100 : uploadProgress;
  const hasVideo = !!video;

  return (
    <div className={css.videoUploadRoot}>
      <div className={css.lessonAssetButtons}>
        <label
          className={classNames(css.lessonAssetButton, {
            [css.disabledAssetButton]: disabled || uploading,
          })}
        >
          <span className={css.assetIcon}>
            <IconVideo />
          </span>
          <span>
            <FormattedMessage id="EditListingContentForm.videoUpload" />
          </span>
          <input
            className={css.fileInput}
            type="file"
            accept="video/*"
            disabled={disabled || uploading}
            onChange={handleFileChange}
          />
        </label>
        {/* <button className={css.lessonAssetButton} type="button" disabled>
          <span className={css.assetIcon}>
            <IconFilePlus />
          </span>
          <span>
            <FormattedMessage id="EditListingContentForm.resource" />
          </span>
        </button>
        <button className={css.lessonAssetButton} type="button" disabled>
          <span className={css.assetIcon}>
            <IconZap />
          </span>
          <span>
            <FormattedMessage id="EditListingContentForm.quiz" />
          </span>
        </button> */}
      </div>

      {hasVideo ? (
        <div className={css.uploadCard}>
          <div className={css.uploadCardHeader}>
            <span>{video.name}</span>
            <button
              type="button"
              className={css.iconButton}
              onClick={() => onChange(null)}
              disabled={disabled || uploading}
              aria-label={intl.formatMessage({ id: 'EditListingContentForm.deleteVideo' })}
            >
              <IconTrash className={css.deleteIcon} />
            </button>
          </div>
          <div className={css.uploadProgressRow}>
            <div className={css.progressBar}>
              <div className={css.progressBarFill} style={{ width: `${progress}%` }} />
            </div>
            <span className={css.progressText}>
              <FormattedMessage
                id="EditListingContentForm.uploadingProgress"
                values={{ progress }}
              />
            </span>
          </div>
          <div className={css.fileSize}>{formatFileSize(video.size)}</div>
        </div>
      ) : null}

      {uploadError ? <p className={css.error}>{uploadError}</p> : null}
    </div>
  );
};

const ModuleEditor = props => {
  const { module, onCancel, onSave, isEditing } = props;
  const intl = useIntl();
  const [title, setTitle] = useState(module?.title || '');
  const [description, setDescription] = useState(module?.description || '');
  const [showError, setShowError] = useState(false);

  const submit = () => {
    if (!title.trim()) {
      setShowError(true);
      return;
    }

    onSave({
      ...(module || {}),
      id: module?.id || createId('module'),
      title: title.trim(),
      description: description.trim(),
      lessons: module?.lessons || [],
    });
  };

  return (
    <div className={css.inlineEditor}>
      <div className={css.field}>
        <label className={css.label}>
          <FormattedMessage id="EditListingContentForm.moduleTitleLabel" />
        </label>
        <input
          className={css.textInput}
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={intl.formatMessage({
            id: 'EditListingContentForm.moduleTitlePlaceholder',
          })}
        />
        {showError && !title.trim() ? (
          <p className={css.error}>
            <FormattedMessage id="EditListingContentForm.moduleTitleRequired" />
          </p>
        ) : null}
      </div>
      <div className={css.field}>
        <label className={css.label}>
          <FormattedMessage id="EditListingContentForm.moduleDescriptionLabel" />
        </label>
        <textarea
          className={classNames(css.textInput, css.textarea)}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={intl.formatMessage({
            id: 'EditListingContentForm.moduleDescriptionPlaceholder',
          })}
        />
      </div>
      <div className={css.inlineEditorActions}>
        <InlineTextButton
          type="button"
          onClick={onCancel}
          className={css.inlineEditorActionsButton}
        >
          <FormattedMessage id="EditListingContentForm.cancel" />
        </InlineTextButton>
        <Button type="button" className={css.smallPrimaryButton} onClick={submit}>
          <FormattedMessage
            id={
              isEditing
                ? 'EditListingContentForm.saveModule'
                : 'EditListingContentForm.createModule'
            }
          />
        </Button>
      </div>
    </div>
  );
};

const LessonEditor = props => {
  const { lesson, onCancel, onSave, onUploadingChange, onVideoUploaded } = props;
  const intl = useIntl();
  const [title, setTitle] = useState(lesson?.title || '');
  const [description, setDescription] = useState(lesson?.description || '');
  const [video, setVideo] = useState(lesson?.video || null);
  const [isUploading, setIsUploading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const submit = () => {
    if (!title.trim() || !video?.playback_id) {
      setShowErrors(true);
      return;
    }

    onSave({
      ...(lesson || {}),
      id: lesson?.id || createId('lesson'),
      title: title.trim(),
      description: description.trim(),
      type: 'video',
      video,
    });
  };

  const handleUploadingChange = value => {
    setIsUploading(value);
    onUploadingChange(value);
  };

  const titleInvalid = showErrors && !title.trim();
  const videoInvalid = showErrors && !video?.playback_id;

  return (
    <div className={css.lessonEditor}>
      <div className={css.field}>
        <label className={css.label}>
          <FormattedMessage id="EditListingContentForm.lessonTitleLabel" />
        </label>
        <input
          className={css.textInput}
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={intl.formatMessage({
            id: 'EditListingContentForm.lessonTitlePlaceholder',
          })}
        />
        {titleInvalid ? (
          <p className={css.error}>
            <FormattedMessage id="EditListingContentForm.lessonTitleRequired" />
          </p>
        ) : null}
      </div>
      <div className={css.field}>
        <label className={css.label}>
          <FormattedMessage id="EditListingContentForm.lessonDescriptionLabel" />
        </label>
        <textarea
          className={classNames(css.textInput, css.lessonTextarea)}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={intl.formatMessage({
            id: 'EditListingContentForm.lessonDescriptionPlaceholder',
          })}
        />
      </div>
      <VideoUploadField
        video={video}
        onChange={setVideo}
        disabled={false}
        onUploadingChange={handleUploadingChange}
        onVideoUploaded={onVideoUploaded}
      />
      {videoInvalid ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingContentForm.videoRequired" />
        </p>
      ) : null}
      <div className={css.lessonEditorActions}>
        <InlineTextButton type="button" onClick={onCancel}>
          <FormattedMessage id="EditListingContentForm.cancel" />
        </InlineTextButton>
        <Button
          type="button"
          className={css.lessonSubmitButton}
          onClick={submit}
          disabled={isUploading}
        >
          <FormattedMessage
            id={
              lesson?.id
                ? 'EditListingContentForm.saveLesson'
                : 'EditListingContentForm.createLesson'
            }
          />
        </Button>
      </div>
    </div>
  );
};

const LessonPreview = props => {
  const { lesson, onEdit, onDelete, onPreview, thumbnailToken, thumbnailError, dragHandle } = props;
  const intl = useIntl();
  const playbackId = lesson.video?.playback_id;
  const formattedDuration = formatDuration(lesson.video?.duration);
  const [thumbnailRetry, setThumbnailRetry] = useState(0);
  const [thumbnailUnavailable, setThumbnailUnavailable] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);

  useEffect(() => {
    if (!playbackId) {
      return;
    }

    setThumbnailRetry(0);
    setThumbnailUnavailable(false);
    setThumbnailLoaded(false);
  }, [playbackId]);

  const thumbnailUrl =
    thumbnailError || !thumbnailToken ? null : buildMuxThumbnailUrl(playbackId, thumbnailToken);
  const thumbnailSrc =
    thumbnailUrl && !thumbnailUnavailable ? `${thumbnailUrl}&retry=${thumbnailRetry}` : null;
  const handleThumbnailError = () => {
    setThumbnailLoaded(false);

    if (thumbnailRetry < 8) {
      window.setTimeout(() => {
        setThumbnailRetry(currentRetry => currentRetry + 1);
      }, 1500);
    } else {
      setThumbnailUnavailable(true);
    }
  };
  const handleThumbnailLoad = () => {
    setThumbnailLoaded(true);
  };
  const showThumbnail = thumbnailSrc && !thumbnailUnavailable;

  return (
    <div className={css.lessonPreview}>
      <div className={css.videoPreviewSlot}>
        {dragHandle}
        <button
          type="button"
          className={css.videoPreview}
          onClick={onPreview}
          disabled={!playbackId}
          aria-label={intl.formatMessage({ id: 'EditListingContentForm.previewVideo' })}
        >
          {showThumbnail ? (
            <img
              className={classNames(css.videoThumbnail, {
                [css.videoThumbnailLoaded]: thumbnailLoaded,
              })}
              src={thumbnailSrc}
              alt=""
              aria-hidden="true"
              onLoad={handleThumbnailLoad}
              onError={handleThumbnailError}
            />
          ) : null}
          <span className={css.videoPlayButton}>
            <IconPlay />
          </span>
        </button>
      </div>
      <div className={css.lessonPreviewContent}>
        <div className={css.lessonTitleRow}>
          <h4 className={css.lessonTitle}>{lesson.title}</h4>
          <div className={css.lessonActions}>
            <button
              type="button"
              className={css.iconButton}
              onClick={onDelete}
              aria-label={intl.formatMessage({ id: 'EditListingContentForm.deleteLesson' })}
            >
              <IconTrash className={css.deleteIcon} />
            </button>
            <button type="button" className={css.editButton} onClick={onEdit}>
              <FormattedMessage id="EditListingContentForm.edit" />
            </button>
          </div>
        </div>
        <div className={css.videoMeta}>
          {formattedDuration ? (
            <>
              <span className={css.assetIcon}>
                <IconPlaySolid />
              </span>
              <span>{formattedDuration}</span>
            </>
          ) : null}
        </div>
        {lesson.description ? <p className={css.lessonDescription}>{lesson.description}</p> : null}
      </div>
    </div>
  );
};

const SortableLessonPreview = props => {
  const { lesson } = props;
  const intl = useIntl();
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const classes = classNames(css.sortableLesson, {
    [css.sortableLessonDragging]: isDragging,
  });

  return (
    <div ref={setNodeRef} style={style} className={classes}>
      <LessonPreview
        {...props}
        dragHandle={
          <button
            type="button"
            ref={setActivatorNodeRef}
            className={css.lessonDragHandle}
            aria-label={intl.formatMessage({ id: 'EditListingContentForm.reorderLesson' })}
            {...attributes}
            {...listeners}
          >
            <IconMenu />
          </button>
        }
      />
    </div>
  );
};

const CourseBuilder = props => {
  const { modules, onChange, onUploadingChange, onManageDisableScrolling, onVideoUploaded } = props;
  const intl = useIntl();
  const [expandedModuleId, setExpandedModuleId] = useState(modules[0]?.id || null);
  const [moduleEditor, setModuleEditor] = useState(null);
  const [lessonEditor, setLessonEditor] = useState(null);
  const [muxPlayerOpen, setMuxPlayerOpen] = useState(false);
  const [activePlaybackId, setActivePlaybackId] = useState(null);
  const [thumbnailTokensByPlaybackId, setThumbnailTokensByPlaybackId] = useState({});
  const [thumbnailErrorsByPlaybackId, setThumbnailErrorsByPlaybackId] = useState({});
  const thumbnailRequestsByPlaybackId = useRef({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const prefetchThumbnailToken = playbackId => {
    if (
      !playbackId ||
      thumbnailTokensByPlaybackId[playbackId] ||
      thumbnailErrorsByPlaybackId[playbackId] ||
      thumbnailRequestsByPlaybackId.current[playbackId]
    ) {
      return Promise.resolve();
    }

    thumbnailRequestsByPlaybackId.current[playbackId] = true;

    return fetchMuxThumbnailToken(playbackId)
      .then(token => {
        setThumbnailTokensByPlaybackId(prev =>
          prev[playbackId] ? prev : { ...prev, [playbackId]: token }
        );
      })
      .catch(e => {
        console.error('Failed to fetch course lesson Mux thumbnail token', e);
        setThumbnailErrorsByPlaybackId(prev => ({ ...prev, [playbackId]: true }));
      })
      .finally(() => {
        delete thumbnailRequestsByPlaybackId.current[playbackId];
      });
  };

  useEffect(() => {
    modules.forEach(module => {
      (module.lessons || [])
        .filter(lesson => lesson.type === 'video' && lesson.video?.playback_id)
        .forEach(lesson => {
          prefetchThumbnailToken(lesson.video.playback_id);
        });
    });
  }, [modules, thumbnailTokensByPlaybackId, thumbnailErrorsByPlaybackId]);

  const setModules = nextModules => {
    onChange(nextModules);
  };

  const saveModule = module => {
    const existingIndex = modules.findIndex(m => m.id === module.id);
    const nextModules =
      existingIndex >= 0
        ? modules.map(m => (m.id === module.id ? module : m))
        : [...modules, module];
    setModules(nextModules);
    setExpandedModuleId(module.id);
    setModuleEditor(null);
  };

  const deleteModule = moduleId => {
    setModules(modules.filter(module => module.id !== moduleId));
    if (expandedModuleId === moduleId) {
      setExpandedModuleId(null);
    }
  };

  const saveLesson = (moduleId, lesson) => {
    setModules(
      modules.map(module => {
        if (module.id !== moduleId) {
          return module;
        }
        const lessons = module.lessons || [];
        const existingIndex = lessons.findIndex(item => item.id === lesson.id);
        const nextLessons =
          existingIndex >= 0
            ? lessons.map(item => (item.id === lesson.id ? lesson : item))
            : [...lessons, lesson];
        return { ...module, lessons: nextLessons };
      })
    );
    setLessonEditor(null);
  };

  const deleteLesson = (moduleId, lessonId) => {
    setModules(
      modules.map(module =>
        module.id === moduleId
          ? { ...module, lessons: (module.lessons || []).filter(lesson => lesson.id !== lessonId) }
          : module
      )
    );
  };

  const reorderLesson = (moduleId, activeLessonId, overLessonId) => {
    if (!overLessonId || activeLessonId === overLessonId) {
      return;
    }

    setModules(
      modules.map(module => {
        if (module.id !== moduleId) {
          return module;
        }

        const lessons = module.lessons || [];
        const oldIndex = lessons.findIndex(lesson => lesson.id === activeLessonId);
        const newIndex = lessons.findIndex(lesson => lesson.id === overLessonId);

        return oldIndex >= 0 && newIndex >= 0
          ? { ...module, lessons: arrayMove(lessons, oldIndex, newIndex) }
          : module;
      })
    );
  };

  const onLessonDragEnd = moduleId => event => {
    const { active, over } = event;
    reorderLesson(moduleId, active.id, over?.id);
  };

  const previewVideo = playbackId => {
    setActivePlaybackId(playbackId);
    setMuxPlayerOpen(true);
  };

  return (
    <div className={css.courseBuilder}>
      {muxPlayerOpen ? (
        <MuxPlayerModal
          id="content-form-mux-player-modal"
          playbackId={activePlaybackId}
          isOpen={muxPlayerOpen}
          onClose={() => {
            setMuxPlayerOpen(false);
            setActivePlaybackId(null);
          }}
          onManageDisableScrolling={onManageDisableScrolling}
        />
      ) : null}

      {modules.map((module, index) => {
        const isExpanded = expandedModuleId === module.id;
        const isEditingModule = moduleEditor?.id === module.id;
        const activeLessonEditor =
          lessonEditor?.moduleId === module.id ? lessonEditor.lesson : null;

        return (
          <div key={module.id} className={css.moduleCard}>
            {isEditingModule ? (
              <ModuleEditor
                module={module}
                isEditing
                onSave={saveModule}
                onCancel={() => setModuleEditor(null)}
              />
            ) : (
              <>
                <div className={css.moduleHeader}>
                  <button
                    type="button"
                    className={css.moduleTitleButton}
                    onClick={() => setExpandedModuleId(isExpanded ? null : module.id)}
                  >
                    {index + 1}. {module.title}
                  </button>
                  {!isExpanded ? (
                    <div className={css.moduleHeaderActions}>
                      <button
                        type="button"
                        className={css.iconButton}
                        onClick={() => deleteModule(module.id)}
                        aria-label={intl.formatMessage({
                          id: 'EditListingContentForm.deleteModule',
                        })}
                      >
                        <IconTrash className={css.deleteIcon} />
                      </button>
                      <button
                        type="button"
                        className={css.editButton}
                        onClick={() => setModuleEditor(module)}
                      >
                        <FormattedMessage id="EditListingContentForm.edit" />
                      </button>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    className={css.chevronButton}
                    onClick={() => setExpandedModuleId(isExpanded ? null : module.id)}
                    aria-label={intl.formatMessage({
                      id: isExpanded
                        ? 'EditListingContentForm.collapseModule'
                        : 'EditListingContentForm.expandModule',
                    })}
                  >
                    <IconArrowHead direction={isExpanded ? 'up' : 'down'} size="small" />
                  </button>
                </div>

                {isExpanded ? (
                  <div className={css.moduleBody}>
                    {module.description ? (
                      <p className={css.moduleDescription}>{module.description}</p>
                    ) : null}
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={onLessonDragEnd(module.id)}
                    >
                      <SortableContext
                        items={(module.lessons || []).map(lesson => lesson.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {(module.lessons || []).map(lesson => (
                          <SortableLessonPreview
                            key={lesson.id}
                            lesson={lesson}
                            onEdit={() => setLessonEditor({ moduleId: module.id, lesson })}
                            onDelete={() => deleteLesson(module.id, lesson.id)}
                            onPreview={() => previewVideo(lesson.video?.playback_id)}
                            thumbnailToken={thumbnailTokensByPlaybackId[lesson.video?.playback_id]}
                            thumbnailError={thumbnailErrorsByPlaybackId[lesson.video?.playback_id]}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                    <InlineTextButton
                      type="button"
                      className={css.addLessonButton}
                      onClick={() => setLessonEditor({ moduleId: module.id, lesson: null })}
                    >
                      <FormattedMessage id="EditListingContentForm.addLesson" />
                    </InlineTextButton>
                    {lessonEditor?.moduleId === module.id ? (
                      <LessonEditor
                        lesson={activeLessonEditor}
                        onUploadingChange={onUploadingChange}
                        onVideoUploaded={onVideoUploaded}
                        onCancel={() => {
                          onUploadingChange(false);
                          setLessonEditor(null);
                        }}
                        onSave={lesson => {
                          onUploadingChange(false);
                          saveLesson(module.id, lesson);
                        }}
                      />
                    ) : null}
                  </div>
                ) : null}
              </>
            )}
          </div>
        );
      })}

      {moduleEditor?.isNew ? (
        <div className={css.moduleCard}>
          <ModuleEditor module={null} onSave={saveModule} onCancel={() => setModuleEditor(null)} />
        </div>
      ) : null}

      <InlineTextButton
        type="button"
        className={css.addModuleButton}
        onClick={() => setModuleEditor({ isNew: true })}
      >
        <FormattedMessage id="EditListingContentForm.addModule" />
      </InlineTextButton>
    </div>
  );
};

const ACCEPTED_ASSET_TYPES =
  'image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/aac,audio/flac,audio/x-m4a,application/pdf,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,application/zip';

const DigitalAssetUploader = props => {
  const { assets, onChange, onUploadingChange, listingId, disabled } = props;
  const intl = useIntl();
  const fileInputRef = useRef(null);
  // uploadingFiles: [{ id, name, size, progress, error }]
  const [uploadingFiles, setUploadingFiles] = useState([]);

  const handleFiles = async files => {
    if (!files?.length) return;

    const fileArray = Array.from(files);

    const entries = fileArray.map((f, i) => ({
      id: `uploading-${Date.now()}-${i}`,
      name: f.name,
      size: f.size,
      progress: 0,
      error: false,
    }));

    setUploadingFiles(prev => [...prev, ...entries]);
    onUploadingChange(true);

    try {
      const response = await generatePresignedUrl({
        storagePath: `listings/${listingId}`,
        files: fileArray.map(f => ({ name: f.name, type: f.type })),
      });

      if (!response.success || !response.data?.length) {
        throw new Error('Failed to get upload URLs');
      }

      const uploaded = await Promise.all(
        response.data.map(
          (urlData, i) =>
            new Promise((resolve, reject) => {
              const xhr = new XMLHttpRequest();
              xhr.open('PUT', urlData.url);
              xhr.setRequestHeader('Content-Type', fileArray[i].type);

              xhr.upload.onprogress = e => {
                if (e.lengthComputable) {
                  const pct = Math.round((e.loaded / e.total) * 100);

                  setUploadingFiles(prev =>
                    prev.map(f => (f.id === entries[i].id ? { ...f, progress: pct } : f))
                  );
                }
              };

              xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                  setUploadingFiles(prev =>
                    prev.map(f => (f.id === entries[i].id ? { ...f, progress: 100 } : f))
                  );
                  resolve({
                    key: urlData.key,
                    name: fileArray[i].name,
                    type: fileArray[i].type,
                    size: fileArray[i].size,
                  });
                } else {
                  reject(new Error('Upload failed'));
                }
              };

              xhr.onerror = () => reject(new Error('Network error'));
              xhr.send(fileArray[i]);
            })
        )
      );

      // Move from uploading → saved
      setUploadingFiles(prev => prev.filter(f => !entries.find(e => e.id === f.id)));
      onChange([...(assets || []), ...uploaded]);
    } catch (err) {
      console.error('Digital asset upload error:', err);
      setUploadingFiles(prev =>
        prev.map(f => (entries.find(e => e.id === f.id) ? { ...f, error: true, progress: 0 } : f))
      );
    } finally {
      onUploadingChange(false);
    }
  };

  const handleInputChange = e => {
    const files = Array.from(e.target.files).filter(f => !f.type.startsWith('video/'));
    handleFiles(files);
    e.target.value = '';
  };

  const dismissError = id => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id));
  };

  const removeAsset = key => {
    onChange((assets || []).filter(a => a.key !== key));
  };

  const viewAsset = async (key, listingId) => {
    setLoadingKey(key);
    try {
      const result = await getSecuredUrl({ key, listingId });
      if (result?.data?.url) {
        window.open(result.data.url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('Failed to fetch secured URL:', err);
      window.alert(err?.message || 'Failed to get download URL. Please try again.');
    } finally {
      setLoadingKey(null);
    }
  };

  const allItems = assets || [];
  const isUploading = uploadingFiles.some(f => !f.error);
  const [loadingKey, setLoadingKey] = useState(null);

  return (
    <div className={css.assetUploader}>
      <button
        type="button"
        className={css.uploadZone}
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isUploading}
      >
        <span className={css.uploadZoneIconWrapper}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="16 16 12 12 8 16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
          </svg>
        </span>
        <span className={css.uploadZoneLabel}>
          <FormattedMessage id="EditListingContentForm.clickToUpload" />
        </span>
        <span className={css.uploadZoneHint}>
          <FormattedMessage id="EditListingContentForm.assetTypes" />
        </span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_ASSET_TYPES}
        multiple
        className={css.fileInput}
        onChange={handleInputChange}
        disabled={disabled || isUploading}
      />

      {uploadingFiles.length > 0 || allItems.length > 0 ? (
        <ul className={css.assetList}>
          {/* In-progress / errored uploads */}
          {uploadingFiles.map(f => (
            <li key={f.id} className={css.assetItem}>
              <div className={css.assetItemBody}>
                <div className={css.assetItemInfo}>
                  <span className={css.assetItemName}>{f.name}</span>
                  <div className={css.assetProgressBar}>
                    {f.error ? (
                      <div className={css.progressBarFillError} style={{ width: '100%' }} />
                    ) : (
                      <div className={css.progressBarFill} style={{ width: `${f.progress}%` }} />
                    )}
                  </div>
                  <span className={css.assetItemSize}>
                    {f.error ? (
                      <FormattedMessage id="EditListingContentForm.assetUploadFailed" />
                    ) : (
                      formatFileSize(f.size)
                    )}
                  </span>
                </div>
                <div className={css.assetItemActions}>
                  {f.error ? (
                    <button
                      type="button"
                      className={css.assetItemDelete}
                      onClick={() => dismissError(f.id)}
                      aria-label="Dismiss"
                    >
                      <IconTrash className={css.deleteIcon} />
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}

          {/* Saved assets */}
          {allItems.map(asset => (
            <li key={asset.key} className={css.assetItem}>
              <div className={css.assetItemBody}>
                <div className={css.assetItemInfo}>
                  <span className={css.assetItemName}>{asset.name}</span>
                  {asset.size ? (
                    <span className={css.assetItemSize}>{formatFileSize(asset.size)}</span>
                  ) : null}
                </div>
                <div className={css.assetItemActions}>
                  <button
                    type="button"
                    className={css.assetItemView}
                    onClick={() => viewAsset(asset.key, listingId)}
                    disabled={disabled || loadingKey === asset.key}
                    aria-label={intl.formatMessage({ id: 'EditListingContentForm.viewAsset' })}
                  >
                    {loadingKey === asset.key ? (
                      <IconSpinner className={css.viewSpinner} />
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                  <button
                    type="button"
                    className={css.assetItemDelete}
                    onClick={() => removeAsset(asset.key)}
                    disabled={disabled}
                    aria-label={intl.formatMessage(
                      { id: 'EditListingContentForm.deleteAsset' },
                      { name: asset.name }
                    )}
                  >
                    <IconTrash className={css.deleteIcon} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

const GenericContent = props => {
  const { listingId, onUploadingChange, disabled } = props;
  return (
    <Field name="digitalAssets">
      {({ input }) => (
        <DigitalAssetUploader
          assets={input.value || []}
          onChange={input.onChange}
          onUploadingChange={onUploadingChange}
          listingId={listingId}
          disabled={disabled}
        />
      )}
    </Field>
  );
};

/**
 * The EditListingContentForm component.
 *
 * @component
 * @param {Object} props
 * @returns {JSX.Element}
 */
export const EditListingContentForm = props => {
  const { onManageDisableScrolling } = props;
  const [uploading, setUploading] = useState(false);

  return (
    <FinalForm
      {...props}
      keepDirtyOnReinitialize
      render={formRenderProps => {
        const {
          className,
          fetchErrors,
          handleSubmit,
          ready,
          saveActionMsg,
          updated,
          updateInProgress,
          isVideoCourse,
          onVideoUploaded,
          listingId,
          values,
        } = formRenderProps;

        const { publishListingError, updateListingError } = fetchErrors || {};
        const submitReady = updated || ready;
        const submitInProgress = updateInProgress;
        const content = values?.courseModules || values?.digitalAssets || [];
        const submitDisabled = submitInProgress || uploading;
        const classes = classNames(css.root, className);

        return (
          <Form className={classes} onSubmit={handleSubmit}>
            {isVideoCourse ? (
              <Field name="courseModules">
                {({ input }) => (
                  <CourseBuilder
                    modules={input.value || []}
                    onChange={input.onChange}
                    onUploadingChange={setUploading}
                    onManageDisableScrolling={onManageDisableScrolling}
                    onVideoUploaded={onVideoUploaded}
                  />
                )}
              </Field>
            ) : (
              <GenericContent
                listingId={listingId}
                onUploadingChange={setUploading}
                disabled={submitDisabled}
              />
            )}

            <PublishListingError error={publishListingError} />
            <UpdateListingError error={updateListingError} />

            <Button
              className={css.submitButton}
              inProgress={submitInProgress}
              ready={submitReady}
              disabled={submitDisabled || content.length === 0}
              type="submit"
            >
              {saveActionMsg}
            </Button>
          </Form>
        );
      }}
    />
  );
};

export default EditListingContentForm;
