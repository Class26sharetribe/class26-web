import React from 'react';

export const linkedinFieldIcon = ({ ariaLabel = 'LinkedIn' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    role="img"
    aria-label={ariaLabel}
  >
    <g clipPath="url(#linkedin-field-clip)">
      <path
        d="M22.223 0H1.772C.792 0 0 .773 0 1.73v20.266C0 22.952.792 23.725 1.772 23.725H22.223C23.203 23.725 24 22.947 24 21.995V1.73C24 .773 23.203 0 22.223 0ZM7.12 20.177H3.558V8.72H7.12v11.457ZM5.339 7.159a1.843 1.843 0 1 1 0-3.686 1.843 1.843 0 0 1 0 3.686ZM20.452 20.177h-3.558v-5.57c0-1.327-.024-3.037-1.852-3.037-1.851 0-2.133 1.448-2.133 2.943v5.664H9.356V8.72h3.413v1.565h.047c.473-.899 1.636-1.845 3.365-1.845 3.605 0 4.27 2.372 4.27 5.456v6.281Z"
        fill="#414651"
      />
    </g>
    <defs>
      <clipPath id="linkedin-field-clip">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);
