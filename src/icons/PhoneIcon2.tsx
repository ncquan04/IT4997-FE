import * as React from "react";

function PhoneIcon2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M9.305 4.991L5.922 1.086c-.39-.45-1.105-.448-1.558.006L1.582 3.88C.754 4.71.517 5.94.996 6.926a29.207 29.207 0 0013.561 13.58c.986.48 2.216.242 3.044-.587l2.808-2.813c.455-.455.456-1.174.002-1.564l-3.92-3.365c-.41-.352-1.047-.306-1.458.106L13.67 13.65a.462.462 0 01-.553.088 14.557 14.557 0 01-5.36-5.367.463.463 0 01.088-.554l1.36-1.36c.412-.415.457-1.055.101-1.466v.001z"
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default PhoneIcon2;
