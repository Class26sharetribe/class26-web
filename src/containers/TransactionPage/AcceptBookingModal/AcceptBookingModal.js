import React, { useState } from 'react';

import { useIntl } from '../../../util/reactIntl';
import { Button, InlineTextButton } from '../../../components';
import { SingleDatePicker } from '../../../components/DatePicker/DatePickers/SingleDatePicker';
import { updateTransactionMetadata } from '../../../util/api';

import css from './AcceptBookingModal.module.css';

// Helpers
const sessionDateToString = d =>
  d
    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`
    : '';
const sessionDateStringToDate = str => (str ? new Date(`${str}T00:00:00`) : null);

/**
 * Form rendered inside the accept-booking modal.
 * Allows the provider to schedule individual coaching sessions.
 *
 * @param {string} transactionId - The transaction UUID, used to save metadata
 * @param {number} totalSessions - Number of sessions to schedule
 * @param {Date|string} bookingStart - Start date/time of the first (locked) session
 * @param {function} onSubmit - Called with sessionDates array after metadata is saved
 * @param {function} onClose - Callback to close the modal
 */
const AcceptBookingModal = ({ transactionId, totalSessions, bookingStart, onSubmit, onClose }) => {
  const intl = useIntl();

  const firstDate = bookingStart ? sessionDateToString(new Date(bookingStart)) : '';
  const firstTime = bookingStart
    ? `${String(new Date(bookingStart).getHours()).padStart(2, '0')}:00`
    : '';

  const [slots, setSlots] = useState(() =>
    Array.from({ length: totalSessions || 1 }, (_, i) =>
      i === 0
        ? { date: firstDate, startTime: firstTime, endTime: '' }
        : { date: '', startTime: '', endTime: '' }
    )
  );
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const slotError = (slot, i) => {
    if (i === 0) return null;
    if (!slot.date && !slot.startTime) return 'Date and time are required';
    if (!slot.date) return 'Date is required';
    if (!slot.startTime) return 'Time is required';
    return null;
  };

  const allValid = slots.every((slot, i) => !slotError(slot, i));

  const handleConfirm = () => {
    setSubmitted(true);
    if (!allValid) return;

    const sessionDates = slots.map(s => ({ date: s.date, startTime: s.startTime, endTime: s.endTime }));
    setIsLoading(true);
    setApiError(null);

    updateTransactionMetadata({ transactionId, metadata: { sessionDates } })
      .then(() => {
        setIsLoading(false);
        onSubmit(sessionDates);
      })
      .catch(e => {
        setIsLoading(false);
        setApiError(e?.message || 'Failed to save session dates. Please try again.');
      });
  };

  return (
    <div className={css.acceptBookingForm}>
      <p className={css.acceptBookingTitle}>Schedule Sessions</p>
      {slots.map((slot, i) => {
        const isLocked = i === 0;
        const error = submitted ? slotError(slot, i) : null;
        return (
          <div key={i} className={css.acceptSessionRow}>
            <span className={css.acceptSessionLabel}>Session {i + 1}</span>
            <div className={css.acceptSessionInputs}>
              {isLocked ? (
                <p className={css.acceptSessionLocked}>
                  {slot.date} &ndash; {slot.startTime}
                </p>
              ) : (
                <>
                  <div className={css.acceptSessionDatePicker}>
                    <SingleDatePicker
                      id={`acceptSessionDate_${i}`}
                      value={sessionDateStringToDate(slot.date)}
                      onChange={date => {
                        const updated = [...slots];
                        updated[i] = { ...slot, date: sessionDateToString(date) };
                        setSlots(updated);
                      }}
                      placeholderText={intl.formatMessage({
                        id: 'EditListingAvailabilityPanel.sessionDatePlaceholder',
                      })}
                    />
                  </div>
                  <select
                    className={`${css.acceptSessionTimeSelect}${!slot.startTime && submitted ? ` ${css.acceptSessionTimeSelectError}` : ''}`}
                    value={slot.startTime || ''}
                    onChange={e => {
                      const updated = [...slots];
                      updated[i] = { ...slot, startTime: e.target.value };
                      setSlots(updated);
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
                </>
              )}
            </div>
            {error ? <span className={css.acceptSessionError}>{error}</span> : null}
          </div>
        );
      })}
      {apiError ? <p className={css.acceptSessionError}>{apiError}</p> : null}
      <div className={css.acceptBookingActions}>
        <Button onClick={handleConfirm} disabled={isLoading}>
          {isLoading ? 'Saving…' : 'Confirm Sessions'}
        </Button>
        <InlineTextButton onClick={onClose} disabled={isLoading}>Cancel</InlineTextButton>
      </div>
    </div>
  );
};

export default AcceptBookingModal;
