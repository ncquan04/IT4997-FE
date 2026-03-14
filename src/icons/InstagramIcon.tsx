import * as React from "react";

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M17 3H7a4 4 0 00-4 4v10a4 4 0 004 4h10a4 4 0 004-4V7a4 4 0 00-4-4z"
        stroke="#000"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <path
        d="M12 16a4 4 0 100-8 4 4 0 000 8v0z"
        stroke="#000"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <path d="M17.5 7.5a1 1 0 100-2 1 1 0 000 2z" fill="#000" />
    </svg>
  );
}

export default InstagramIcon;
