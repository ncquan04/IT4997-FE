import * as React from "react";

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M11.5 9.05c.917-.937 2.111-1.55 3.5-1.55a5.5 5.5 0 015.5 5.5v7.5h-2V13a3.5 3.5 0 10-7 0v7.5h-2V8h2v1.05zM4.5 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-1 2h2v12.5h-2V8z"
        fill="#000"
      />
    </svg>
  );
}

export default LinkedInIcon;
