import * as React from "react"

function GamingIcon(props: React.SVGProps<SVGSVGElement>) {
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
        clipPath="url(#clip0_869_3077)"
        stroke={props.stroke || "#000"}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M46.666 14H9.334a4.667 4.667 0 00-4.667 4.667v18.666A4.667 4.667 0 009.334 42h37.334a4.667 4.667 0 004.666-4.667V18.667A4.667 4.667 0 0046.667 14zM14 28h9.333m-4.666-4.667v9.334"
          strokeWidth={2}
        />
        <path d="M35 25.667v.024M42 30.333v.024" strokeWidth={3} />
      </g>
      <defs>
        <clipPath id="clip0_869_3077">
          <path fill="#fff" d="M0 0H56V56H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default GamingIcon
