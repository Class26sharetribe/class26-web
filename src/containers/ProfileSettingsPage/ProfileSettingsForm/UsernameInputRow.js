import React, { useRef, useState } from 'react';
import classNames from 'classnames';

import { useIntl } from '../../../util/reactIntl';
import { checkUsername } from '../../../util/api';

import css from './ProfileSettingsForm.module.css';

const USERNAME_DEBOUNCE_MS = 600;

/**
 * Renders the username input row with a URL prefix and a copy button.
 * Plugs into Final Form via the `input` prop provided by <Field>.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.input - Final Form field input props
 * @param {Object} props.meta - Final Form field meta props
 * @param {string} [props.marketplaceRootURL] - The marketplace root URL used to build the profile URL prefix
 * @param {string} [props.currentUsername] - The user's currently saved username (skips taken check for own value)
 * @param {Function} [props.onStatusChange] - Called with the new status whenever it changes
 * @returns {JSX.Element}
 */
const UsernameInputRow = props => {
  const { input, meta, marketplaceRootURL, currentUsername, onStatusChange } = props;
  const intl = useIntl();
  const [status, setStatus] = useState('idle'); // idle | checking | available | taken | error

  const updateStatus = newStatus => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  };
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef(null);
  const latestRef = useRef(input.value);

  const urlPrefix = (() => {
    if (!marketplaceRootURL) return '';
    try {
      return new URL(marketplaceRootURL).host + '/';
    } catch (_) {
      return marketplaceRootURL.replace(/^https?:\/\//, '').replace(/\/$/, '') + '/';
    }
  })();

  const fullUrl = `${marketplaceRootURL ? marketplaceRootURL.replace(/\/$/, '') : ''}/${
    input.value
  }`;

  const handleChange = e => {
    const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '');
    latestRef.current = sanitized;
    input.onChange(sanitized);

    if (!sanitized) {
      updateStatus('idle');
      return;
    }

    updateStatus('checking');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (latestRef.current !== sanitized) return;
      try {
        const { available } = await checkUsername(sanitized);
        const isSame = sanitized === currentUsername;
        updateStatus(available || isSame ? 'available' : 'taken');
      } catch (_) {
        updateStatus('error');
      }
    }, USERNAME_DEBOUNCE_MS);
  };

  const handleCopy = () => {
    if (!input.value) return;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const statusMsg =
    status === 'checking'
      ? intl.formatMessage({ id: 'ProfileSettingsForm.usernameChecking' })
      : status === 'available'
      ? intl.formatMessage({ id: 'ProfileSettingsForm.usernameAvailable' })
      : status === 'taken'
      ? intl.formatMessage({ id: 'ProfileSettingsForm.usernameTaken' })
      : status === 'error'
      ? intl.formatMessage({ id: 'ProfileSettingsForm.usernameError' })
      : null;

  return (
    <div>
      <div className={css.usernameInputRow}>
        <span className={css.usernamePrefix}>{urlPrefix}</span>
        <input
          {...input}
          onChange={handleChange}
          className={css.usernameInput}
          type="text"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          className={css.usernameCopyButton}
          onClick={handleCopy}
          disabled={!input.value}
          title={intl.formatMessage({ id: 'ProfileSettingsForm.usernameCopyTitle' })}
        >
          {copied ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M2 8l4 4 8-8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect
                x="5"
                y="5"
                width="9"
                height="9"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M4 11H3a1 1 0 01-1-1V3a1 1 0 011-1h7a1 1 0 011 1v1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          )}
        </button>
      </div>
      {statusMsg ? (
        <p
          className={classNames(css.usernameStatus, {
            [css.usernameStatusChecking]: status === 'checking',
            [css.usernameStatusAvailable]: status === 'available',
            [css.usernameStatusTaken]: status === 'taken' || status === 'error',
          })}
        >
          {statusMsg}
        </p>
      ) : null}
    </div>
  );
};

export default UsernameInputRow;
