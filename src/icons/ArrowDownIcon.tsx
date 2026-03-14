import * as React from "react";

function ArrowDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={512}
      height={512}
      viewBox="0 0 128 128"
      {...props}
    >
      <path
        d="M64 88a3.988 3.988 0 01-2.828-1.172l-40-40c-1.563-1.563-1.563-4.094 0-5.656s4.094-1.563 5.656 0L64 78.344l37.172-37.172c1.563-1.563 4.094-1.563 5.656 0s1.563 4.094 0 5.656l-40 40A3.988 3.988 0 0164 88z"
        data-original="#000000"
        transform="matrix(1.4 0 0 1.4 -25.6 -25.6)"
      />
    </svg>
  );
}

export default ArrowDownIcon;
