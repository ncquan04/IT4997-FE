import * as React from "react"

function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={56}
      height={56}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_869_1693)" stroke={props.stroke || "#000"}>
        <path
          d="M38.938 6.125H17.061a2.734 2.734 0 00-2.734 2.734v38.282a2.734 2.734 0 002.735 2.734h21.875a2.734 2.734 0 002.734-2.734V8.859a2.734 2.734 0 00-2.734-2.734z"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M25.666 7h5.47"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M28 44.005v.026"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path strokeWidth={2} d="M15.1665 39.8334L40.8332 39.8334" />
      </g>
      <defs>
        <clipPath id="clip0_869_1693">
          <path fill="#fff" d="M0 0H56V56H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default PhoneIcon
