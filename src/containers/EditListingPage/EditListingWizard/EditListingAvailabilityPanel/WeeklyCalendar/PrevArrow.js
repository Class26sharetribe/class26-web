import React from 'react';

import { isDateSameOrAfter } from '../../../../../util/dates';
import { IconArrowHead } from '../../../../../components';

// Component for the DatePicker calendar
const PrevArrow = props => {
  const { showUntilDate, startOfPrevRange, size = 'small', onClick, ...rest } = props;
  const canNavigateBack = isDateSameOrAfter(startOfPrevRange, showUntilDate);

  return canNavigateBack && onClick ? (
    <button onClick={onClick} {...rest}>
      <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M6.42259 0.244078C6.74803 0.569515 6.74803 1.09715 6.42259 1.42259L2.01184 5.83333L6.42259 10.2441C6.74803 10.5695 6.74803 11.0972 6.42259 11.4226C6.09715 11.748 5.56951 11.748 5.24408 11.4226L0.244078 6.42259C-0.0813592 6.09715 -0.0813592 5.56951 0.244078 5.24408L5.24408 0.244078C5.56951 -0.0813593 6.09715 -0.0813593 6.42259 0.244078Z" fill="#101828" />
      </svg>

    </button>
  ) : canNavigateBack ? (
    <IconArrowHead direction="left" size={size} />
  ) : null;
};

export default PrevArrow;
