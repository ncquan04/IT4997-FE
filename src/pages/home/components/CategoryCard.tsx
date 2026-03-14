import { useNavigate } from "react-router";
import { useState, type ComponentType } from "react";
import type { Category } from "../../../shared/models/category-model";
import PhoneIcon from "../../../icons/PhoneIcon";
import ComputerIcon from "../../../icons/ComputerIcon";
import SmartwatchIcon from "../../../icons/SmartwatchIcon";
import TabletIcon from "../../../icons/TabletIcon";

const CategoryCard = ({ category }: { category: Category }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent: ComponentType<{ stroke?: string }> | null = (() => {
    switch (category.name) {
      case "Điện thoại":
        return PhoneIcon;
      case "Laptop":
        return ComputerIcon;
      case "Đồng hồ":
        return SmartwatchIcon;
      case "Tablet":
        return TabletIcon;
      default:
        return PhoneIcon;
    }
  })();

  const handleCardClick = () => {
    navigate({
      pathname: "/search",
      search: `?categoryId=${category._id}`,
    });
  };

  return (
    <button
      className={`w-full h-full min-w-[140px] min-h-[120px] sm:min-w-[150px] sm:min-h-[130px] md:min-w-[160px] md:min-h-[135px] lg:w-[170px] lg:h-[145px] flex flex-col justify-center items-center gap-2 rounded-sm hover:bg-secondary2 hover:cursor-pointer bg-transparent`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      style={{
        borderWidth: 1,
        borderColor: isHovered ? "#DB4444" : "#00000033",
      }}
      aria-label={`View ${category.name} category`}
    >
      {IconComponent ? (
        <IconComponent stroke={isHovered ? "white" : "black"} />
      ) : null}
      <span
        className={`text-sm md:text-base font-medium ${
          isHovered ? "text-white" : "text-black"
        }`}
      >
        {category.name}
      </span>
    </button>
  );
};

export default CategoryCard;
