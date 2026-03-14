interface MenuIconProps {
  width?: number;
  height?: number;
  fill?: string;
}

const MenuIcon = ({ width = 24, height = 24, fill = "black" }: MenuIconProps) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 12H21M3 6H21M3 18H21"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default MenuIcon;
