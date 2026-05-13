import { SAVED_FOR_LATER_TAB } from './PersonalAreaPage';
import { loadData as loadSavedCourses } from '../SavedCoursesPage/SavedCoursesPage.duck';

// ================ Load data ================ //

/**
 * Load data for the PersonalAreaPage based on the active tab.
 * Delegates to tab-specific loadData functions as needed.
 */
export const loadData = (params, search, config) => dispatch => {
  if (params.tab === SAVED_FOR_LATER_TAB) {
    return dispatch(loadSavedCourses(params, search, config));
  }
  return Promise.resolve();
};

