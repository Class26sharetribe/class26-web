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
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_4087_4438)">
            <path d="M3.33301 9.99998H2.66634C2.31272 9.99998 1.97358 9.8595 1.72353 9.60945C1.47348 9.35941 1.33301 9.02027 1.33301 8.66665V2.66665C1.33301 2.31302 1.47348 1.97389 1.72353 1.72384C1.97358 1.47379 2.31272 1.33331 2.66634 1.33331H8.66634C9.01996 1.33331 9.3591 1.47379 9.60915 1.72384C9.8592 1.97389 9.99967 2.31302 9.99967 2.66665V3.33331M7.33301 5.99998H13.333C14.0694 5.99998 14.6663 6.59693 14.6663 7.33331V13.3333C14.6663 14.0697 14.0694 14.6666 13.333 14.6666H7.33301C6.59663 14.6666 5.99967 14.0697 5.99967 13.3333V7.33331C5.99967 6.59693 6.59663 5.99998 7.33301 5.99998Z" stroke="#A4A7AE" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            <defs>
            <clipPath id="clip0_4087_4438">
            <rect width="16" height="16" fill="white"/>
            </clipPath>
            </defs>
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
