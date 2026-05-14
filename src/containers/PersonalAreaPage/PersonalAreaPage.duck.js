import { SAVED_FOR_LATER_TAB, ACCOUNT_SETTINGS_TAB } from './PersonalAreaPage';
import { loadData as loadSavedCourses } from '../SavedCoursesPage/SavedCoursesPage.duck';
import { loadData as loadAccountSettings } from '../AccountSettingsPage/AccountSettingsPage.duck';

// ================ Load data ================ //

/**
 * Load data for the PersonalAreaPage based on the active tab.
 * Delegates to tab-specific loadData functions as needed.
 */
export const loadData = (params, search, config) => dispatch => {
  if (params.tab === SAVED_FOR_LATER_TAB) {
    return dispatch(loadSavedCourses(params, search, config));
  }
  if (params.tab === ACCOUNT_SETTINGS_TAB) {
    return dispatch(loadAccountSettings(params, search, config));
  }
  return Promise.resolve();
};

