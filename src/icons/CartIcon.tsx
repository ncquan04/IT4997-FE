import * as React from "react";

function CartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={32}
      height={32}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M11 27a1 1 0 100-2 1 1 0 000 2zM25 27a1 1 0 100-2 1 1 0 000 2zM3 5h4l3 17h16"
        stroke="#000"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 16.667h15.59a.501.501 0 00.49-.402l1.8-9a.5.5 0 00-.49-.598H8"
        stroke="#000"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default CartIcon;
