import React, { useState, useEffect } from 'react';
import classNames from 'classnames';

// Import configs and util modules
import { FormattedMessage } from '../../../../util/reactIntl';
import { getDefaultTimeZoneOnBrowser, timestampToDate, getStartOf } from '../../../../util/dates';
import {
  AVAILABILITY_MULTIPLE_SEATS,
  LISTING_STATE_DRAFT,
  LISTING_TYPE_GROUP_COACHING,
} from '../../../../util/types';
import { DAY, isFullDay } from '../../../../transactions/transaction';

// Import shared components
import { Button, H3, InlineTextButton, ListingLink, Modal } from '../../../../components';
import { SingleDatePicker } from '../../../../components/DatePicker/DatePickers/SingleDatePicker';

// Import modules from this directory
import EditListingAvailabilityPlanForm from './EditListingAvailabilityPlanForm';
import EditListingAvailabilityExceptionForm from './EditListingAvailabilityExceptionForm';
import WeeklyCalendar from './WeeklyCalendar/WeeklyCalendar';
import { getExclusiveEndDate } from './availability.helpers';

import { types as sdkTypes } from '../../../../util/sdkLoader';

import css from './EditListingAvailabilityPanel.module.css';

// This is the order of days as JavaScript understands them
// The number returned by "new Date().getDay()" refers to day of week starting from sunday.
const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const EDIT_AVAILABILITY_PLAN_BUTTON = 'editAvailabilityPlanButton';
const EDIT_AVAILABILITY_EXCEPTIONS_BUTTON = 'editAvailabilityExceptionsButton';

// This is the order of days as JavaScript understands them
// The number returned by "new Date().getDay()" refers to day of week starting from sunday.
const rotateDays = (days, startOfWeek) => {
  return startOfWeek === 0 ? days : days.slice(startOfWeek).concat(days.slice(0, startOfWeek));
};

export const defaultTimeZone = () =>
  typeof window !== 'undefined' ? getDefaultTimeZoneOnBrowser() : 'Etc/UTC';

const { UUID } = sdkTypes;

// Helper: convert 'YYYY-MM-DD' string to a Date object (local midnight)
const dateStringToDate = str => (str ? new Date(`${str}T00:00:00`) : null);
// Helper: convert a Date object to 'YYYY-MM-DD' string
const dateToString = d =>
  d
    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`
    : '';

const SESSION_DATE_MAX_DAYS = 90;

const isSessionDayBlocked = day => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + SESSION_DATE_MAX_DAYS);
  return day < today || day > maxDate;
};

///////////////////////////////////////////////////
// EditListingAvailabilityExceptionPanel - utils //
///////////////////////////////////////////////////

// Create initial entry mapping for form's initial values
const createEntryDayGroups = (entries = {}) => {
  // Collect info about which days are active in the availability plan form:
  let activePlanDays = [];
  return entries.reduce((groupedEntries, entry) => {
    const { startTime, endTime: endHour, dayOfWeek, seats } = entry;
    const dayGroup = groupedEntries[dayOfWeek] || [];
    activePlanDays = activePlanDays.includes(dayOfWeek)
      ? activePlanDays
      : [...activePlanDays, dayOfWeek];
    return {
      ...groupedEntries,
      [dayOfWeek]: [
        ...dayGroup,
        {
          startTime,
          endTime: endHour === '00:00' ? '24:00' : endHour,
          seats,
        },
      ],
      activePlanDays,
    };
  }, {});
};

// Create initial values for the availability plan
const createInitialPlanValues = availabilityPlan => {
  const { timezone, entries } = availabilityPlan || {};
  const tz = timezone || defaultTimeZone();
  return {
    timezone: tz,
    ...createEntryDayGroups(entries),
  };
};

// Create entries from submit values
const createEntriesFromSubmitValues = values =>
  WEEKDAYS.reduce((allEntries, dayOfWeek) => {
    const dayValues = values[dayOfWeek] || [];
    const dayEntries = dayValues.map(dayValue => {
      const { startTime, endTime, seats } = dayValue;
      // Note: This template doesn't support seats yet.
      return startTime && endTime
        ? {
            dayOfWeek,
            seats: seats ?? 1,
            startTime,
            endTime: endTime === '24:00' ? '00:00' : endTime,
          }
        : null;
    });

    return allEntries.concat(dayEntries.filter(e => !!e));
  }, []);

// Create availabilityPlan from submit values
const createAvailabilityPlan = values => ({
  availabilityPlan: {
    type: 'availability-plan/time',
    timezone: values.timezone,
    entries: createEntriesFromSubmitValues(values),
  },
});

//////////////////////////////////
// EditListingAvailabilityPanel //
//////////////////////////////////

/**
 * @typedef {Object} AvailabilityException
 * @property {string} id
 * @property {'availabilityException'} type 'availabilityException'
 * @property {Object} attributes attributes
 * @property {Date} attributes.start The start of availability exception (inclusive)
 * @property {Date} attributes.end The end of availability exception (exclusive)
 * @property {Number} attributes.seats the number of seats available (0 means 'unavailable')
 */
/**
 * @typedef {Object} ExceptionQueryInfo
 * @property {Object|null} fetchExceptionsError
 * @property {boolean} fetchExceptionsInProgress
 */

/**
 * A panel where provider can set availabilityPlan (weekly default schedule)
 * and AvailabilityExceptions.
 * In addition, it combines the set values of both of those and shows a weekly schedule.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className
 * @param {string?} props.rootClassName
 * @param {Object} props.params pathparams
 * @param {Object?} props.locationSearch parsed search params
 * @param {Object?} props.listing listing entity from API (draft/published/etc.)
 * @param {Array<Object>} props.listingTypes listing type config from asset delivery API
 * @param {boolean} props.disabled
 * @param {boolean} props.ready
 * @param {Object.<string, ExceptionQueryInfo>?} props.monthlyExceptionQueries E.g. '2022-12': { fetchExceptionsError, fetchExceptionsInProgress }
 * @param {Object.<string, ExceptionQueryInfo>?} props.weeklyExceptionQueries E.g. '2022-12-14': { fetchExceptionsError, fetchExceptionsInProgress }
 * @param {Array<AvailabilityException>} props.allExceptions
 * @param {Function} props.onAddAvailabilityException
 * @param {Function} props.onDeleteAvailabilityException
 * @param {Function} props.onFetchExceptions
 * @param {Function} props.onSubmit
 * @param {Function} props.onManageDisableScrolling
 * @param {Function} props.onNextTab
 * @param {string} props.submitButtonText
 * @param {boolean} props.updateInProgress
 * @param {Object} props.errors
 * @param {Object} props.config app config
 * @param {Object} props.routeConfiguration
 * @param {Object} props.history history from React Router
 * @returns {JSX.Element} containing form that allows adding availability exceptions
 */
const EditListingAvailabilityPanel = props => {
  const {
    className,
    rootClassName,
    params,
    locationSearch,
    listing,
    listingTypes,
    monthlyExceptionQueries,
    weeklyExceptionQueries,
    allExceptions = [],
    onAddAvailabilityException,
    onDeleteAvailabilityException,
    disabled,
    ready,
    onFetchExceptions,
    onSubmit,
    onManageDisableScrolling,
    onNextTab,
    submitButtonText,
    updateInProgress,
    errors,
    config,
    routeConfiguration,
    history,
    updatePageTitle: UpdatePageTitle,
    intl,
  } = props;
  // Hooks
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);
  const [isEditExceptionsModalOpen, setIsEditExceptionsModalOpen] = useState(false);
  const [valuesFromLastSubmit, setValuesFromLastSubmit] = useState(null);
  const [totalSessions, setTotalSessions] = useState(
    listing?.attributes?.publicData?.totalSessions ?? 1
  );
  const [sessionSlots, setSessionSlots] = useState(() => {
    const saved = listing?.attributes?.publicData?.sessionDates;
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
    const count = listing?.attributes?.publicData?.totalSessions ?? 1;
    return Array.from({ length: count }, () => ({ date: '', startTime: '', endTime: '' }));
  });
  const [sessionSeats, setSessionSeats] = useState(
    listing?.attributes?.publicData?.sessionSeats ?? 1
  );
  const [saveSessionsInProgress, setSaveSessionsInProgress] = useState(false);
  const [saveSessionsError, setSaveSessionsError] = useState(null);

  const firstDayOfWeek = config.localization.firstDayOfWeek;
  const classes = classNames(rootClassName || css.root, className);
  const listingAttributes = listing?.attributes;
  const { listingType, unitType } = listingAttributes?.publicData || {};
  const listingTypeConfig = listingTypes.find(conf => conf.listingType === listingType);

  const useFullDays = isFullDay(unitType);
  const useMultipleSeats = listingTypeConfig?.availabilityType === AVAILABILITY_MULTIPLE_SEATS;

  const savedExceptionId = listingAttributes?.publicData?.sessionExceptionId || null;

  // Keep session slots in sync when totalSessions changes
  useEffect(() => {
    if (listingType !== LISTING_TYPE_GROUP_COACHING) {
      return;
    }
    
    setSessionSlots(prev => {
      if (prev.length === totalSessions) return prev;
      if (prev.length < totalSessions) {
        const empty = { date: '', startTime: '', endTime: '' };
        return [
          ...prev,
          ...Array.from({ length: totalSessions - prev.length }, () => ({ ...empty })),
        ];
      }
      return prev.slice(0, totalSessions);
    });
  }, [totalSessions]);

  const hasAvailabilityPlan = !!listingAttributes?.availabilityPlan;
  const isPublished = listing?.id && listingAttributes?.state !== LISTING_STATE_DRAFT;
  const defaultAvailabilityPlan = {
    type: 'availability-plan/time',
    timezone: defaultTimeZone(),
    entries: [
      // { dayOfWeek: 'mon', startTime: '09:00', endTime: '17:00', seats: 1 },
      // { dayOfWeek: 'tue', startTime: '09:00', endTime: '17:00', seats: 1 },
      // { dayOfWeek: 'wed', startTime: '09:00', endTime: '17:00', seats: 1 },
      // { dayOfWeek: 'thu', startTime: '09:00', endTime: '17:00', seats: 1 },
      // { dayOfWeek: 'fri', startTime: '09:00', endTime: '17:00', seats: 1 },
      // { dayOfWeek: 'sat', startTime: '09:00', endTime: '17:00', seats: 1 },
      // { dayOfWeek: 'sun', startTime: '09:00', endTime: '17:00', seats: 1 },
    ],
  };
  const availabilityPlan = listingAttributes?.availabilityPlan || defaultAvailabilityPlan;
  const initialPlanValues = valuesFromLastSubmit
    ? valuesFromLastSubmit
    : createInitialPlanValues(availabilityPlan);

  const handleNextTab = () => {
    onSubmit({ publicData: { totalSessions } }).then(() => {
      if (!isPublished) {
        onNextTab();
      }
    });
  };

  const handleSaveSessions = async () => {
    const tz = availabilityPlan.timezone;
    const allFilled = sessionSlots.every(slot => slot.date && slot.startTime);
    if (!allFilled) {
      setSaveSessionsError(
        intl.formatMessage({ id: 'EditListingAvailabilityPanel.sessionDateRequired' })
      );
      return;
    }

    // Skip if nothing has changed since last save
    const savedDates = listing?.attributes?.publicData?.sessionDates;
    const savedSeats = listing?.attributes?.publicData?.sessionSeats;
    const alreadySaved =
      savedExceptionId &&
      sessionSeats === savedSeats &&
      JSON.stringify(sessionSlots) === JSON.stringify(savedDates);

    if (alreadySaved) {
      return;
    }

    setSaveSessionsInProgress(true);
    setSaveSessionsError(null);

    try {
      // Compute exception range as full days covering all session dates
      const dates = sessionSlots.map(s => new Date(`${s.date}T12:00:00`));
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
      const start = getStartOf(minDate, 'day', tz);
      const end = getExclusiveEndDate(maxDate, tz);

      // Delete old exception before creating a new one (only if data changed)
      if (savedExceptionId) {
        await onDeleteAvailabilityException({ id: new UUID(savedExceptionId) });
      }

      const result = await onAddAvailabilityException({
        listingId: listing.id,
        seats: sessionSeats,
        start,
        end,
      });
      const newExceptionId = result?.data?.id?.uuid || null;

      await onSubmit({
        publicData: {
          sessionDates: sessionSlots,
          sessionSeats,
          sessionExceptionId: newExceptionId,
          totalSessions,
        },
      });

      if (!isPublished) {
        onNextTab();
      }
    } catch (e) {
      setSaveSessionsError(
        intl.formatMessage({ id: 'EditListingAvailabilityPanel.saveSessionDatesError' })
      );
    } finally {
      setSaveSessionsInProgress(false);
    }
  };

  const handlePlanSubmit = values => {
    setValuesFromLastSubmit(values);

    // Final Form can wait for Promises to return.
    return onSubmit(createAvailabilityPlan(values))
      .then(() => {
        setIsEditPlanModalOpen(false);
        document.getElementById(EDIT_AVAILABILITY_PLAN_BUTTON)?.focus();
      })
      .catch(e => {
        // Don't close modal if there was an error
      });
  };

  const sortedAvailabilityExceptions = allExceptions;

  // Save exception click handler
  const saveException = values => {
    const { availability, exceptionStartTime, exceptionEndTime, exceptionRange, seats } = values;

    const seatCount = seats != null ? seats : availability === 'available' ? 1 : 0;

    // Exception date/time range is given through FieldDateRangeInput or
    // separate time fields.
    const range = useFullDays
      ? {
          start: exceptionRange?.startDate,
          end: exceptionRange?.endDate,
        }
      : {
          start: timestampToDate(exceptionStartTime),
          end: timestampToDate(exceptionEndTime),
        };

    const params = {
      listingId: listing.id,
      seats: seatCount,
      ...range,
    };

    return onAddAvailabilityException(params)
      .then(() => {
        setIsEditExceptionsModalOpen(false);
      })
      .catch(e => {
        // Don't close modal if there was an error
      });
  };

  const panelHeadingProps = isPublished
    ? {
        id: 'EditListingAvailabilityPanel.title',
        values: { listingTitle: <ListingLink listing={listing} />, lineBreak: <br /> },
        messageProps: { listingTitle: listing.attributes.title },
      }
    : {
        id: 'EditListingAvailabilityPanel.createListingTitle',
        values: { lineBreak: <br /> },
        messageProps: {},
      };

  return (
    <main className={classes}>
      <UpdatePageTitle
        panelHeading={intl.formatMessage(
          { id: panelHeadingProps.id },
          { ...panelHeadingProps.messageProps }
        )}
      />
      <H3 as="h1">
        <FormattedMessage id={panelHeadingProps.id} values={{ ...panelHeadingProps.values }} />
      </H3>

      <div className={css.totalSessionsWrapper}>
        <label className={css.totalSessionsLabel}>
          <FormattedMessage id="EditListingAvailabilityPanel.totalSessionsLabel" />
        </label>
        <div className={css.totalSessionsStepper}>
          <button
            type="button"
            className={css.stepperButton}
            onClick={() => setTotalSessions(v => Math.max(1, v - 1))}
            aria-label="Decrease sessions"
          >
            &minus;
          </button>
          <span className={css.stepperValue}>{totalSessions}</span>
          <button
            type="button"
            className={css.stepperButton}
            onClick={() => setTotalSessions(v => v + 1)}
            aria-label="Increase sessions"
          >
            +
          </button>
        </div>
        <p className={css.totalSessionsHelp}>
          <FormattedMessage id="EditListingAvailabilityPanel.totalSessionsHelp" />
        </p>
      </div>

      {listingType === LISTING_TYPE_GROUP_COACHING ? (
        <div className={css.sessionScheduler}>
          <h4 className={css.sessionSchedulerTitle}>
            <FormattedMessage id="EditListingAvailabilityPanel.sessionDatesTitle" />
          </h4>
          <p className={css.sessionSchedulerHelp}>
            <FormattedMessage
              id="EditListingAvailabilityPanel.sessionDatesHelp"
              values={{ count: totalSessions }}
            />
          </p>

          {sessionSlots.map((slot, i) => (
            <div key={i} className={css.sessionSlot}>
              <span className={css.sessionSlotLabel}>
                <FormattedMessage
                  id="EditListingAvailabilityPanel.sessionLabel"
                  values={{ number: i + 1 }}
                />
              </span>
              <div className={css.sessionSlotInputs}>
                <div className={css.sessionDatePickerWrapper}>
                  <SingleDatePicker
                    id={`sessionDate_${i}`}
                    value={dateStringToDate(slot.date)}
                    onChange={date => {
                      const updated = [...sessionSlots];
                      updated[i] = { ...slot, date: dateToString(date) };
                      setSessionSlots(updated);
                    }}
                    isDayBlocked={isSessionDayBlocked}
                    placeholderText={intl.formatMessage({
                      id: 'EditListingAvailabilityPanel.sessionDatePlaceholder',
                    })}
                  />
                </div>
                <select
                  className={css.sessionTimeSelect}
                  value={slot.startTime || ''}
                  onChange={e => {
                    const updated = [...sessionSlots];
                    updated[i] = { ...slot, startTime: e.target.value };
                    setSessionSlots(updated);
                  }}
                >
                  <option value="" disabled>
                    {intl.formatMessage({
                      id: 'EditListingAvailabilityPanel.sessionTimePlaceholder',
                    })}
                  </option>
                  {Array.from({ length: 24 }, (_, h) => {
                    const value = `${String(h).padStart(2, '0')}:00`;
                    const label =
                      h === 0
                        ? '12:00 AM'
                        : h < 12
                        ? `${h}:00 AM`
                        : h === 12
                        ? '12:00 PM'
                        : `${h - 12}:00 PM`;
                    return (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          ))}

          <div className={css.sessionSeatsWrapper}>
            <label className={css.sessionSeatsLabel}>
              <FormattedMessage id="EditListingAvailabilityPanel.sessionSeatsLabel" />
            </label>
            <input
              type="number"
              className={css.sessionSeatsInput}
              min={1}
              value={sessionSeats}
              onChange={e => setSessionSeats(Math.max(1, parseInt(e.target.value, 10) || 1))}
            />
          </div>

          {saveSessionsError ? <p className={css.sessionError}>{saveSessionsError}</p> : null}

          <Button
            className={css.saveSessionsButton}
            onClick={handleSaveSessions}
            inProgress={saveSessionsInProgress}
            disabled={saveSessionsInProgress}
          >
            <FormattedMessage id="EditListingAvailabilityPanel.saveSessionDates" />
          </Button>

          {savedExceptionId && !saveSessionsError ? (
            <p className={css.sessionSavedNote}>
              <FormattedMessage id="EditListingAvailabilityPanel.sessionDatesSaved" />
            </p>
          ) : null}
        </div>
      ) : (
        <>
          <div className={css.planInfo}>
            <span>
              <h4>Availability</h4>
            </span>
            {!hasAvailabilityPlan ? (
              <p>
                <FormattedMessage id="EditListingAvailabilityPanel.availabilityPlanInfo" />
              </p>
            ) : null}

            <InlineTextButton
              id={EDIT_AVAILABILITY_PLAN_BUTTON}
              className={css.editPlanButton}
              onClick={() => setIsEditPlanModalOpen(true)}
            >
              {hasAvailabilityPlan ? (
                <FormattedMessage id="EditListingAvailabilityPanel.editAvailabilityPlan" />
              ) : (
                <FormattedMessage id="EditListingAvailabilityPanel.setAvailabilityPlan" />
              )}
            </InlineTextButton>
          </div>

          {hasAvailabilityPlan ? (
            <>
              <WeeklyCalendar
                className={css.section}
                headerClassName={css.sectionHeader}
                listingId={listing.id}
                availabilityPlan={availabilityPlan}
                availabilityExceptions={sortedAvailabilityExceptions}
                weeklyExceptionQueries={weeklyExceptionQueries}
                isDaily={unitType === DAY}
                useFullDays={useFullDays}
                useMultipleSeats={useMultipleSeats}
                onDeleteAvailabilityException={onDeleteAvailabilityException}
                onFetchExceptions={onFetchExceptions}
                params={params}
                locationSearch={locationSearch}
                firstDayOfWeek={firstDayOfWeek}
                routeConfiguration={routeConfiguration}
                history={history}
              />

              <section className={css.section}>
                <InlineTextButton
                  id={EDIT_AVAILABILITY_EXCEPTIONS_BUTTON}
                  className={css.addExceptionButton}
                  onClick={() => setIsEditExceptionsModalOpen(true)}
                  disabled={disabled || !hasAvailabilityPlan}
                  ready={ready}
                >
                  <FormattedMessage id="EditListingAvailabilityPanel.addException" />
                </InlineTextButton>
              </section>
            </>
          ) : null}

          {errors.showListingsError ? (
            <p className={css.error}>
              <FormattedMessage id="EditListingAvailabilityPanel.showListingFailed" />
            </p>
          ) : null}

          <Button
            className={css.goToNextTabButton}
            onClick={handleNextTab}
            disabled={!hasAvailabilityPlan}
            inProgress={updateInProgress}
          >
            {submitButtonText}
          </Button>
        </>
      )}

      {onManageDisableScrolling && isEditPlanModalOpen ? (
        <Modal
          id="EditAvailabilityPlan"
          isOpen={isEditPlanModalOpen}
          onClose={() => setIsEditPlanModalOpen(false)}
          onManageDisableScrolling={onManageDisableScrolling}
          focusElementId={EDIT_AVAILABILITY_PLAN_BUTTON}
          containerClassName={css.modalContainer}
          usePortal
        >
          <EditListingAvailabilityPlanForm
            formId="EditListingAvailabilityPlanForm"
            listingTitle={listingAttributes?.title}
            availabilityPlan={availabilityPlan}
            weekdays={rotateDays(WEEKDAYS, firstDayOfWeek)}
            onSubmit={handlePlanSubmit}
            initialValues={initialPlanValues}
            inProgress={updateInProgress}
            fetchErrors={errors}
            useFullDays={useFullDays}
            useMultipleSeats={useMultipleSeats}
            unitType={unitType}
          />
        </Modal>
      ) : null}

      {onManageDisableScrolling && isEditExceptionsModalOpen ? (
        <Modal
          id="EditAvailabilityExceptions"
          isOpen={isEditExceptionsModalOpen}
          onClose={() => setIsEditExceptionsModalOpen(false)}
          onManageDisableScrolling={onManageDisableScrolling}
          focusElementId={EDIT_AVAILABILITY_EXCEPTIONS_BUTTON}
          containerClassName={css.modalContainer}
          usePortal
        >
          <EditListingAvailabilityExceptionForm
            formId="EditListingAvailabilityExceptionForm"
            listingId={listing.id}
            allExceptions={allExceptions}
            monthlyExceptionQueries={monthlyExceptionQueries}
            fetchErrors={errors}
            onFetchExceptions={onFetchExceptions}
            onSubmit={saveException}
            timeZone={availabilityPlan.timezone}
            unitType={unitType}
            updateInProgress={updateInProgress}
            useFullDays={useFullDays}
            listingTypeConfig={listingTypeConfig}
          />
        </Modal>
      ) : null}
    </main>
  );
};

export default EditListingAvailabilityPanel;
