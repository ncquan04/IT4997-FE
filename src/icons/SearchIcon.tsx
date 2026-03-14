import * as React from "react";

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M17 17l-3.778-3.784m2.094-5.058A7.158 7.158 0 111 8.158a7.158 7.158 0 0114.316 0v0z"
        stroke="#000"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

export default SearchIcon;
