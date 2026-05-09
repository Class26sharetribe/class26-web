/**
 * Calculate the total video duration (in seconds) across all lessons in all modules.
 *
 * @param {Array} courseModules - array of module objects, each with a `lessons` array
 * @returns {number} total duration in seconds
 */
export const getTotalCourseDurationSeconds = courseModules => {
  if (!Array.isArray(courseModules)) return 0;
  return courseModules.reduce((total, module) => {
    const lessons = Array.isArray(module.lessons) ? module.lessons : [];
    return lessons.reduce((sum, lesson) => {
      return sum + (lesson?.video?.duration ?? 0);
    }, total);
  }, 0);
};

/**
 * Format total course duration from an array of courseModules into a human-readable string.
 * e.g. "24 hours and 50 minutes of pure, experience-backed learning."
 *
 * @param {Array} courseModules - array of module objects
 * @returns {string}
 */
export const formatCourseDuration = courseModules => {
  const totalSeconds = getTotalCourseDurationSeconds(courseModules);
  const wholeSeconds = Math.floor(totalSeconds);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const remainingSeconds = wholeSeconds % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''} of pure, experience-backed learning.`;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} of pure, experience-backed learning.`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} of pure, experience-backed learning.`;
  } else if (wholeSeconds > 0) {
    return `${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''} of pure, experience-backed learning.`;
  }
  return 'No video content yet.';
};
