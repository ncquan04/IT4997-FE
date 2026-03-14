import * as React from "react";

function DeliveryIcon(props: React.SVGProps<SVGSVGElement>) {
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
        clipPath="url(#clip0_864_335)"
        stroke={props.stroke || "#FAFAFA"}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11.667 31.667a3.333 3.333 0 100-6.667 3.333 3.333 0 000 6.667zM28.333 31.667a3.333 3.333 0 100-6.667 3.333 3.333 0 000 6.667z" />
        <path d="M8.333 28.334H7a2 2 0 01-2-2v-4.667M3.333 8.333h16.334a2 2 0 012 2v18m-6.667 0h10m6.667 0H33a2 2 0 002-2v-8m0 0H21.667m13.333 0l-4.417-7.362a2 2 0 00-1.715-.97h-7.201" />
        <path d="M8 28H6.667a2 2 0 01-2-2v-4.667M3 8h16.333a2 2 0 012 2v18M15 28h9.667M32 28h.667a2 2 0 002-2v-8m0 0H21.333m13.334 0l-4.418-7.362a2 2 0 00-1.715-.971h-7.2M5 11.818h6.667M1.818 15.455h6.667M5 19.09h6.667" />
      </g>
      <defs>
        <clipPath id="clip0_864_335">
          <path fill="#fff" d="M0 0H40V40H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}

export default DeliveryIcon;
