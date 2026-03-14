import * as React from "react";

function ReturnIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={40}
      height={40}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g
        clipPath="url(#clip0_261_4865)"
        stroke="#000"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M33.333 18.333A13.5 13.5 0 007.499 15m-.833-6.667V15h6.667M6.666 21.667A13.5 13.5 0 0032.499 25m.834 6.667V25h-6.667" />
      </g>
      <defs>
        <clipPath id="clip0_261_4865">
          <path fill="#fff" d="M0 0H40V40H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}

export default ReturnIcon;
