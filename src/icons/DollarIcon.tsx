import * as React from "react";

function DollarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={40}
      height={40}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M20 37.273c9.54 0 17.273-7.734 17.273-17.273 0-9.54-7.733-17.273-17.273-17.273S2.728 10.461 2.728 20c0 9.54 7.733 17.273 17.272 17.273z"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M25.091 14.547a3.637 3.637 0 00-3.272-1.818h-3.637a3.637 3.637 0 00-2.571 6.206A3.637 3.637 0 0018.182 20h3.637a3.637 3.637 0 012.57 6.206 3.637 3.637 0 01-2.57 1.065h-3.637a3.638 3.638 0 01-3.272-1.818M20 8.182v3.94m0 15.757v3.94"
        stroke="#fff"
        strokeWidth={2.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default DollarIcon;
