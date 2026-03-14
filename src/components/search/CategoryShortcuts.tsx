import type { ICategory } from "../../shared/models/category-model";

interface Props {
    categories: ICategory[];
    selected: ICategory | null;
    onSelect: (c: ICategory) => void;
}

const CategoryShortcuts = ({ categories, selected, onSelect }: Props) => {
    return (
        <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-[11px] font-semibold text-gray-400 uppercase mb-2">Categories</p>

            <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                    <button
                        key={cat._id}
                        onClick={() => onSelect(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
              ${
                  selected?._id === cat._id
                      ? "bg-blue-50 text-blue-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryShortcuts;
