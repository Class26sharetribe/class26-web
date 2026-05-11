import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';

import css from './ListingPage.module.css';
import MuxPlayer from '@mux/mux-player-react';

const muxPosterUrl = playbackId =>
  `https://image.mux.com/${playbackId}/thumbnail.jpg?width=640&height=360&fit_mode=crop`;

const formatVideoDuration = seconds => {
  const n = Number(seconds);
  if (!Number.isFinite(n) || n <= 0) {
    return null;
  }
  const totalSeconds = Math.round(n);
  const minutes = Math.floor(totalSeconds / 60);
  const remaining = totalSeconds % 60;
  return minutes > 0
    ? `${minutes}:${String(remaining).padStart(2, '0')}`
    : `0:${String(remaining).padStart(2, '0')}`;
};

/**
 * Modules & Lessons accordion (publicData.courseModules).
 *
 * @component
 * @param {Object} props
 * @param {Object} props.publicData
 * @returns {JSX.Element|null}
 */
const ListingPageModulesAndLessons = props => {
  const { publicData } = props;

  const [openCourseModuleId, setOpenCourseModuleId] = useState(null);

  const courseModules = useMemo(() => {
    return Array.isArray(publicData?.courseModules) ? publicData.courseModules : [];
  }, [publicData]);

  useEffect(() => {
    if (openCourseModuleId) {
      const moduleStillExists = courseModules.some(m => m?.id === openCourseModuleId);
      if (!moduleStillExists) {
        setOpenCourseModuleId(null);
      }
    }
  }, [courseModules, openCourseModuleId]);

  if (courseModules.length === 0) {
    return null;
  }

  return (
    <section className={css.courseModulesSection}>
      <h2 className={classNames(css.courseSectionTitle, css.courseModulesSectionTitle)}>Modules and Lessons</h2>

      <div className={css.courseModuleList}>
        {courseModules.map((module, moduleIndex) => {
          const moduleId = module?.id || `module_${moduleIndex}`;
          const isOpen = openCourseModuleId === moduleId;
          const lessons = Array.isArray(module?.lessons) ? module.lessons : [];

          return (
            <div key={moduleId} className={css.courseModuleItem}>
              <button
                type="button"
                className={css.courseModuleHeader}
                aria-expanded={isOpen}
                onClick={() => setOpenCourseModuleId(isOpen ? null : moduleId)}
              >
                <span className={css.courseModuleHeaderLeft}>
                  <span className={css.courseModuleIndex}>{moduleIndex + 1}.</span>
                  <span className={css.courseModuleTitle}>{module?.title || 'Module'}</span>
                </span>
                <span
                  className={classNames(css.courseModuleChevron, {
                    [css.courseModuleChevronOpen]: isOpen,
                  })}
                  aria-hidden="true"
                >
                  <svg width="18" height="10" viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L9 9L17 1" stroke="#101828" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>

                </span>
              </button>

              {isOpen ? (
                <div className={css.courseModulePanel}>
                  {module?.description ? (
                    <p className={css.courseModuleDescription}>{module.description}</p>
                  ) : null}

                  {lessons.length > 0 ? (
                    <div className={css.courseLessonRow}>
                      {lessons.map((lesson, lessonIndex) => {
                        const lessonId = lesson?.id || `${moduleId}_lesson_${lessonIndex}`;
                        const lessonPlaybackId =
                          lesson?.video?.playback_id;
                        const lessonDurationSeconds = lesson?.video?.duration ?? lesson?.duration ?? null;
                        const durationLabel = formatVideoDuration(lessonDurationSeconds);

                        console.log(lessonPlaybackId, 'lessonPlaybackId');
                        return (
                          <div key={lessonId} className={css.courseLessonCard}>
                            <div className={css.courseLessonTitle}>
                              {lesson?.title || `Lesson ${lessonIndex + 1}`}
                            </div>
                            <div className={css.courseLessonThumbWrap}>
                              {lessonPlaybackId ?
                                <>
                                  <MuxPlayer
                                    className={css.courseMuxPlayer}
                                    playbackId={lessonPlaybackId}
                                    // tokens={{ playback: muxToken }}
                                    streamType="on-demand"
                                    autoPlay
                                    playsInline
                                  // skipJwt={true}
                                  />
                                </> : null}
                            </div>

                            <div className={css.courseLessonContent}>

                              {durationLabel ? (
                                <div className={css.courseLessonDuration}>
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="24" height="24" rx="10" fill="#A2F8CE" />
                                    <path d="M18.45 12.067C18.7833 12.2595 18.7833 12.7406 18.45 12.933L10.05 17.7828C9.71662 17.9752 9.29995 17.7347 9.29995 17.3498V7.65028C9.29995 7.26538 9.71662 7.02482 10.05 7.21727L18.45 12.067Z" fill="#00A069" />
                                  </svg>

                                  {durationLabel} minutes</div>
                              ) : null}
                              {lesson?.description ? (
                                <p className={css.courseLessonDescription}>{lesson.description}</p>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ListingPageModulesAndLessons;

