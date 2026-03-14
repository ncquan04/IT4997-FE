import * as React from "react"

function CameraIcon(props: React.SVGProps<SVGSVGElement>) {
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
        clipPath="url(#clip0_869_1959)"
        stroke={props.stroke || "#000"}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11.667 16.333H14a4.666 4.666 0 004.667-4.666A2.333 2.333 0 0121 9.333h14a2.333 2.333 0 012.333 2.334A4.666 4.666 0 0042 16.333h2.333A4.667 4.667 0 0149 21v21a4.667 4.667 0 01-4.667 4.667H11.667A4.667 4.667 0 017 42V21a4.667 4.667 0 014.667-4.667" />
        <path d="M28 37.333a7 7 0 100-14 7 7 0 000 14z" />
      </g>
      <defs>
        <clipPath id="clip0_869_1959">
          <path fill="#fff" d="M0 0H56V56H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default CameraIcon
