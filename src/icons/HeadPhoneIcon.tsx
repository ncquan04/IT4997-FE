import * as React from "react"

function HeadphoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={56}
      height={56}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g
        clipPath="url(#clip0_869_1225)"
        stroke={props.stroke || "#000"}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16.334 30.333H14A4.667 4.667 0 009.334 35v7A4.667 4.667 0 0014 46.667h2.334A4.667 4.667 0 0021 42v-7a4.667 4.667 0 00-4.666-4.667zM42 30.333h-2.333A4.667 4.667 0 0035 35v7a4.667 4.667 0 004.667 4.667H42A4.667 4.667 0 0046.667 42v-7A4.667 4.667 0 0042 30.333z" />
        <path d="M9.334 35v-7a18.667 18.667 0 0137.333 0v7" />
      </g>
      <defs>
        <clipPath id="clip0_869_1225">
          <path fill="#fff" d="M0 0H56V56H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default HeadphoneIcon
