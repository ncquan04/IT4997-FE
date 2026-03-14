import * as React from "react";

function MarketIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M34.142 5h-6.654l.834 8.333S29.988 15 32.488 15a5.384 5.384 0 003.565-1.343.838.838 0 00.25-.775l-1.176-7.049A1 1 0 0034.142 5v0z"
        stroke="#fff"
        strokeWidth={2}
      />
      <path
        d="M27.488 5l.834 8.333S26.655 15 24.155 15s-4.167-1.667-4.167-1.667V5h7.5z"
        stroke="#FAFAFA"
        strokeWidth={2}
      />
      <path
        d="M19.989 5v8.333S18.322 15 15.822 15s-4.167-1.667-4.167-1.667L12.49 5h7.5z"
        stroke="#FAFAFA"
        strokeWidth={2}
      />
      <path
        d="M12.488 5H5.837a1 1 0 00-.987.835l-1.175 7.048a.84.84 0 00.25.775 5.386 5.386 0 003.563 1.344c2.5 0 4.167-1.667 4.167-1.667l.833-8.333V5z"
        stroke="#FAFAFA"
        strokeWidth={2}
      />
      <path
        d="M5 15v16.667A3.333 3.333 0 008.333 35h23.334A3.333 3.333 0 0035 31.667V15"
        stroke="#FAFAFA"
        strokeWidth={2}
      />
      <path
        d="M24.722 35V25a3.334 3.334 0 00-3.334-3.333h-3.333A3.333 3.333 0 0014.722 25v10"
        stroke="#FAFAFA"
        strokeWidth={2}
        strokeMiterlimit={16}
      />
    </svg>
  );
}

export default MarketIcon;
