import React from 'react';
import classNames from 'classnames';

import css from './IconArrowUp.module.css';

/**
 * Arrow up/right icon.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to components own root class
 * @param {string?} props.rootClassName overwrite components own root class
 * @returns {JSX.Element} SVG icon
 */
const IconArrowUp = props => {
  const { className, rootClassName, ariaLabel } = props;
  const classes = classNames(rootClassName || css.root, className);
  const ariaLabelMaybe = ariaLabel ? { ['aria-label']: ariaLabel } : {};
  const role = ariaLabel ? 'img' : 'none';

  return (
    <svg
      className={classes}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={role}
      {...ariaLabelMaybe}
    >
      <path d="M7 17L17 7M17 17V7H7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default IconArrowUp;
