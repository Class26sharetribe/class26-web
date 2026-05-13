import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

import { useIntl } from '../../../util/reactIntl';
import { checkUsername } from '../../../util/api';

import css from './UsernameField.module.css';

const DEBOUNCE_MS = 600;

/**
 * Trims marketplace root URL to just the hostname for display as prefix.
 * e.g. "https://class26.com/" → "class26.com/"
 *
 * @param {string} rootURL
 * @returns {string}
 */
const getUrlPrefix = rootURL => {
  if (!rootURL) return '';
  try {
    const { host } = new URL(rootURL);
    return `${host}/`;
  } catch (_) {
    return rootURL.replace(/^https?:\/\//, '').replace(/\/$/, '') + '/';
  }
};

/**
 * Standalone username input with:
 * - Static URL prefix (marketplace hostname)
 * - Editable username input
 * - Copy-full-URL button on the right
 * - Debounced uniqueness check via /api/check-username
 *
 * @param {Object} props
 * @param {string} props.currentUsername - Current saved username (from publicData)
 * @param {string} props.marketplaceRootURL - Marketplace root URL
 * @param {function} props.onUsernameChange - Called with (username, isAvailable) when debounce settles
 */
const UsernameField = ({ currentUsername = '', marketplaceRootURL, onUsernameChange }) => {
  const intl = useIntl();
  const [value, setValue] = useState(currentUsername);
  const [status, setStatus] = useState('idle'); // 'idle' | 'checking' | 'available' | 'taken' | 'error'
  const [copied, setCopied] = useState(false);
  const debounceTimer = useRef(null);
  const latestValue = useRef(value);

  const urlPrefix = getUrlPrefix(marketplaceRootURL);
  const fullUrl = `${marketplaceRootURL ? marketplaceRootURL.replace(/\/$/, '') : ''}/${value}`;

  // Sync if parent provides a new currentUsername (e.g. after save)
  useEffect(() => {
    setValue(currentUsername);
    latestValue.current = currentUsername;
    setStatus('idle');
  }, [currentUsername]);

  const handleChange = e => {
    const raw = e.target.value;
    // Allow only URL-safe characters
    const sanitized = raw.toLowerCase().replace(/[^a-z0-9-_]/g, '');
    setValue(sanitized);
    latestValue.current = sanitized;

    if (!sanitized) {
      setStatus('idle');
      onUsernameChange('', false);
      return;
    }

    setStatus('checking');
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      // Skip if input has changed while we waited
      if (latestValue.current !== sanitized) return;

      try {
        const { available } = await checkUsername(sanitized);
        // If it matches the saved username, treat as available (unchanged)
        const isSameAsCurrent = sanitized === currentUsername;
        const resolved = available || isSameAsCurrent;
        setStatus(resolved ? 'available' : 'taken');
        onUsernameChange(sanitized, resolved);
      } catch (_) {
        setStatus('error');
        onUsernameChange(sanitized, false);
      }
    }, DEBOUNCE_MS);
  };

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const statusMessage =
    status === 'checking'
      ? intl.formatMessage({ id: 'UsernameField.checking' })
      : status === 'available'
      ? intl.formatMessage({ id: 'UsernameField.available' })
      : status === 'taken'
      ? intl.formatMessage({ id: 'UsernameField.taken' })
      : status === 'error'
      ? intl.formatMessage({ id: 'UsernameField.error' })
      : null;

  const statusClass = classNames(css.statusMessage, {
    [css.statusChecking]: status === 'checking',
    [css.statusAvailable]: status === 'available',
    [css.statusTaken]: status === 'taken' || status === 'error',
  });

  return (
    <div className={css.root}>
      <div className={css.inputRow}>
        <span className={css.urlPrefix}>{urlPrefix}</span>
        <input
          className={css.input}
          type="text"
          id="username"
          name="username"
          value={value}
          onChange={handleChange}
          autoComplete="off"
          spellCheck={false}
          aria-label={intl.formatMessage({ id: 'UsernameField.label' })}
        />
        <button
          type="button"
          className={css.copyButton}
          onClick={handleCopy}
          disabled={!value}
          title={intl.formatMessage({ id: 'UsernameField.copyTitle' })}
          aria-label={intl.formatMessage({ id: 'UsernameField.copyTitle' })}
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
      {statusMessage ? <p className={statusClass}>{statusMessage}</p> : null}
    </div>
  );
};

export default UsernameField;
