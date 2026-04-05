import { useState } from "react";
import type { Category } from "../../../shared/models/category-model";
import ArrowDownIcon from "../../../icons/ArrowDownIcon";
import { useNavigate } from "react-router";
import CategoryDropdown from "./CategoryDropdown";

interface CategorySelectorProps {
  categories: Category[];
}

const CategorySelector = (props: CategorySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("Browse Categories");
  const navigate = useNavigate();

  const handleSelectCategory = (category: Category) => {
    navigate(`/categories/${category._id}`);
  };

  const handleDropdownToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category.name);
    setIsOpen(false);
    handleSelectCategory(category);
  };

  const parentCategories = props.categories.filter((c) => !c.parentCategoryId);
  const getChildren = (parentId: string) =>
    props.categories.filter((c) => c.parentCategoryId === parentId);

  return (
    <nav
      className="flex flex-col gap-4 w-full lg:w-auto relative z-50"
      aria-label="Category navigation"
    >
      <div className="lg:hidden relative">
        <button
          onClick={handleDropdownToggle}
          className="w-full px-4 py-3 text-sm md:text-base text-black font-medium bg-transparent hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between gap-2 border border-gray-200 rounded-md"
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
          className={`absolute top-full mt-1 left-0 w-full bg-white shadow-lg rounded-md overflow-hidden transition-all duration-300 ease-in-out z-50 border border-gray-100 ${
            isOpen
              ? "max-h-128 opacity-100 overflow-y-auto"
              : "max-h-0 opacity-0 border-transparent"
          }`}
        >
          <ul className="list-none p-0 m-0">
            {parentCategories.map((category, index) => {
              const children = getChildren(category._id);
              return (
                <li
                  key={index}
                  className="flex flex-col border-b border-gray-100 last:border-b-0"
                >
                  <button
                    onClick={() => handleCategoryClick(category)}
                    className="w-full px-4 py-3 text-sm md:text-base text-black font-semibold hover:bg-gray-50 bg-transparent border-0 text-left transition-colors duration-150 flex items-center justify-between"
                  >
                    <span>{category.name}</span>
                  </button>
                  {children.length > 0 && (
                    <ul className="list-none p-0 m-0 bg-gray-50 divide-y divide-gray-100">
                      {children.map((child, childIndex) => (
                        <li key={childIndex}>
                          <button
                            onClick={() => handleCategoryClick(child)}
                            className="w-full pl-8 pr-4 py-2.5 text-sm text-gray-600 font-medium hover:text-black hover:bg-gray-100 bg-transparent border-0 text-left transition-colors duration-150"
                          >
                            {child.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <ul className="hidden lg:flex list-none p-0 m-0 flex-col gap-5">
        {parentCategories.map((category, index) => {
          const children = getChildren(category._id);
          return (
            <li key={index} className="relative group/category">
              <div className="flex items-center justify-between gap-4 w-full cursor-pointer">
                <button
                  onClick={() => handleSelectCategory(category)}
                  className="text-base text-black font-medium hover:text-blue-600 bg-transparent border-0 p-0 text-left transition-colors duration-200"
                  aria-label={`Select ${category.name} category`}
                >
                  {category.name}
                </button>
                {children.length > 0 && (
                  <ArrowDownIcon
                    className="w-4 h-4 transform -rotate-90 text-gray-400 group-hover/category:text-blue-600 transition-colors pointer-events-none"
                    fill="currentColor"
                  />
                )}
              </div>

              <CategoryDropdown
                categories={children}
                onSelectCategory={handleSelectCategory}
              />
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default CategorySelector;
