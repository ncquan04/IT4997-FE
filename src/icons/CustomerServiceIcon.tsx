import * as React from "react"

function CustomerServiceIcon(props: React.SVGProps<SVGSVGElement>) {
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
        clipPath="url(#clip0_864_352)"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13.333 25a3.333 3.333 0 00-6.666 0v3.333a3.333 3.333 0 006.666 0V25zM33.333 25a3.333 3.333 0 00-6.666 0v3.333a3.333 3.333 0 006.666 0V25z" />
        <path d="M6.667 25v-5a13.334 13.334 0 0126.666 0v5M30 31.666c0 1.327-1.054 2.598-2.929 3.536-1.875.938-4.419 1.465-7.071 1.465" />
      </g>
      <defs>
        <clipPath id="clip0_864_352">
          <path fill="#fff" d="M0 0H40V40H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default CustomerServiceIcon
