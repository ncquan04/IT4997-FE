import * as React from "react"

function SmartwatchIcon(props: React.SVGProps<SVGSVGElement>) {
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
        clipPath="url(#clip0_869_1297)"
        stroke={props.stroke || "#000"}
        strokeWidth={2}
        strokeLinecap="round"
      >
        <path
          d="M35 14H21a7 7 0 00-7 7v14a7 7 0 007 7h14a7 7 0 007-7V21a7 7 0 00-7-7zM21 42v7h14v-7M21 14V7h14v7"
          strokeLinejoin="round"
        />
        <path d="M24 23L24 34" />
        <path d="M28 28L28 34" />
        <path d="M32 26L32 34" />
      </g>
      <defs>
        <clipPath id="clip0_869_1297">
          <path fill="#fff" d="M0 0H56V56H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default SmartwatchIcon
