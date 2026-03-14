import { useState } from "react";
import type { Category } from "../../../shared/models/category-model";
import ArrowDownIcon from "../../../icons/ArrowDownIcon";
import { useNavigate } from "react-router";

interface CategorySelectorProps {
  categories: Category[];
}

const CategorySelector = (props: CategorySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("Browse Categories");
  const navigate = useNavigate();

  const handleSelectCategory = (category: Category) => {
    navigate({
      pathname: "/search",
      search: `?categoryId=${category._id}`,
    });
  };

  const handleDropdownToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category.name);
    setIsOpen(false);
    handleSelectCategory(category);
  };

  return (
    <nav
      className="flex flex-col gap-4 w-full lg:w-auto"
      aria-label="Category navigation"
    >
      <div className="lg:hidden relative">
        <button
          onClick={handleDropdownToggle}
          className="w-full px-4 py-3 text-sm md:text-base text-black font-medium bg-transparent hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between gap-2"
          aria-expanded={isOpen}
          aria-label="Select category"
        >
          <span>{selectedCategory}</span>
          <ArrowDownIcon
            className={`w-4 h-4 transition-transform duration-300 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
            fill="currentColor"
          />
        </button>

        <div
          className={`absolute top-full left-0 w-full bg-white shadow-lg rounded-b-md overflow-hidden transition-all duration-300 ease-in-out z-10 ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <ul className="list-none p-0 m-0">
            {props.categories.map((category, index) => (
              <li key={index}>
                <button
                  onClick={() => handleCategoryClick(category)}
                  className="w-full px-4 py-3 text-sm md:text-base text-black font-medium hover:bg-gray-100 bg-transparent border-0 text-left transition-colors duration-150"
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ul className="hidden lg:flex list-none p-0 m-0 flex-col gap-4">
        {props.categories.map((category, index) => (
          <li key={index}>
            <button
              onClick={() => handleSelectCategory(category)}
              className="text-base text-black font-medium hover:cursor-pointer bg-transparent border-0 p-0 text-left w-full hover:underline"
              aria-label={`Select ${category.name} category`}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default CategorySelector;
