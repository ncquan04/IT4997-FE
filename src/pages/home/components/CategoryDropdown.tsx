import type { Category } from "../../../shared/models/category-model";

interface CategoryDropdownProps {
  categories: Category[];
  onSelectCategory: (category: Category) => void;
}

const CategoryDropdown = ({
  categories,
  onSelectCategory,
}: CategoryDropdownProps) => {
  if (categories.length === 0) return null;

  return (
    <div className="absolute top-0 left-[calc(100%+1rem)] w-[600px] xl:w-[720px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 opacity-0 invisible group-hover/category:opacity-100 group-hover/category:visible transition-all duration-300 ease-out z-100 translate-x-3 group-hover/category:translate-x-0 before:content-[''] before:absolute before:inset-y-0 before:-left-4 before:w-4">
      <ul className="list-none p-5 m-0 grid grid-cols-3 gap-3">
        {categories.map((child, childIndex) => (
          <li key={childIndex}>
            <button
              onClick={() => onSelectCategory(child)}
              className="w-full px-4 py-3 text-sm text-gray-700 font-medium hover:bg-gray-50 hover:text-blue-600 rounded-lg text-left transition-all duration-200 cursor-pointer flex items-center"
            >
              <span className="line-clamp-2">{child.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryDropdown;
