import { useEffect, useCallback, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import {
  useAppDispatch,
  useAppSelector,
  type RootState,
} from "../../redux/store";
import searchAsync from "../../redux/async-thunk/search.thunk";
import SearchItemList from "../searchProducts/components/productItem";
import categoriesAync from "../../redux/async-thunk/categories.thunk";
import { AppRoutes } from "../../navigation";
import { HORIZONTAL_PADDING_REM } from "../../constants";

type PriceSort = "" | "price_asc" | "price_desc";

const CategoryPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();

  const { categories } = useAppSelector((state: RootState) => state.categories);
  const { products, page, totalPages, isLoading } = useAppSelector(
    (state: RootState) => state.search,
  );

  // ===== Filter / Sort state =====
  const [priceSort, setPriceSort] = useState<PriceSort>("");
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string>
  >({});
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null);
  const [specValueMap, setSpecValueMap] = useState<Record<string, string[]>>(
    {},
  );
  const prevCategoryId = useRef<string | undefined>(undefined);

  // ===== Category tree =====
  const category = useMemo(
    () => categories.find((c) => c._id === categoryId),
    [categories, categoryId],
  );
  const isParent = !category?.parentCategoryId;
  const parentCategory = useMemo(
    () =>
      category?.parentCategoryId
        ? categories.find((c) => c._id === category.parentCategoryId)
        : null,
    [categories, category],
  );
  const children = useMemo(
    () =>
      isParent
        ? categories.filter((c) => c.parentCategoryId === categoryId)
        : [],
    [categories, categoryId, isParent],
  );
  const siblings = useMemo(
    () =>
      !isParent && category?.parentCategoryId
        ? categories.filter(
            (c) => c.parentCategoryId === category.parentCategoryId,
          )
        : [],
    [categories, category, isParent],
  );

  const tabs = useMemo(() => {
    if (isParent) {
      if (children.length === 0) return [];
      return [{ _id: categoryId!, name: "Tất cả" }, ...children];
    }
    if (!parentCategory) return [];
    return [{ _id: parentCategory._id, name: "Tất cả" }, ...siblings];
  }, [isParent, children, siblings, parentCategory, categoryId]);

  // ===== Reset state on category change =====
  useEffect(() => {
    if (prevCategoryId.current === categoryId) return;
    prevCategoryId.current = categoryId;
    setSelectedFilters({});
    setPriceSort("");
    setOpenFilterKey(null);
    setSpecValueMap({});
  }, [categoryId]);

  // ===== Accumulate spec values from every products load =====
  useEffect(() => {
    if (products.length === 0) return;
    setSpecValueMap((prev) => {
      const updated = { ...prev };
      products.forEach((p) =>
        p.specifications?.forEach((s) => {
          if (!s.key || !s.value) return;
          const existing = new Set(updated[s.key] ?? []);
          existing.add(s.value);
          updated[s.key] = Array.from(existing).sort();
        }),
      );
      return updated;
    });
  }, [products]);

  // ===== Data fetching =====
  useEffect(() => {
    if (categories.length === 0) dispatch(categoriesAync.fectchCategories());
  }, []);

  const specFilters = useMemo(
    () =>
      Object.entries(selectedFilters)
        .filter(([, v]) => v)
        .map(([k, v]) => ({ key: k, value: v })),
    [selectedFilters],
  );

  const specFiltersKey = useMemo(
    () => JSON.stringify(specFilters),
    [specFilters],
  );

  useEffect(() => {
    if (!categoryId) return;
    dispatch(
      searchAsync.searchProducts({
        userInput: "",
        categoryId,
        specFilters: specFilters.length > 0 ? specFilters : undefined,
        sortBy: priceSort || undefined,
        page: 1,
      }),
    );
  }, [categoryId, priceSort, specFiltersKey]);

  const loadMore = useCallback(() => {
    if (isLoading || page! >= totalPages) return;
    dispatch(
      searchAsync.searchProducts({
        userInput: "",
        categoryId,
        specFilters: specFilters.length > 0 ? specFilters : undefined,
        sortBy: priceSort || undefined,
        page: page! + 1,
      }),
    );
  }, [isLoading, page, totalPages, categoryId, specFiltersKey, priceSort]);

  const hasMore = page! < totalPages;

  // ===== Filter handlers =====
  const toggleFilter = (key: string, value: string) => {
    setSelectedFilters((prev) => {
      const updated = { ...prev };
      if (updated[key] === value) {
        delete updated[key];
      } else {
        updated[key] = value;
      }
      return updated;
    });
  };

  const clearFilter = (key: string) => {
    setSelectedFilters((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    setPriceSort("");
  };

  const specKeys = Object.keys(specValueMap);
  const activeFilterCount = specFilters.length + (priceSort ? 1 : 0);

  // ===== Breadcrumb =====
  const breadcrumbs = useMemo(() => {
    const crumbs: { name: string; path?: string }[] = [
      { name: "Trang chủ", path: AppRoutes.HOME },
    ];
    if (!isParent && parentCategory) {
      crumbs.push({
        name: parentCategory.name,
        path: `/categories/${parentCategory._id}`,
      });
    }
    crumbs.push({ name: category?.name ?? "Danh mục" });
    return crumbs;
  }, [isParent, parentCategory, category]);

  return (
    <div
      className="w-full px-4 sm:px-6 md:px-8 lg:px-(--horizontal-padding) py-5 flex flex-col gap-4"
      style={
        {
          "--horizontal-padding": `${HORIZONTAL_PADDING_REM}rem`,
        } as React.CSSProperties
      }
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-500">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-gray-300">/</span>}
            {crumb.path ? (
              <button
                onClick={() => navigate(crumb.path!)}
                className="hover:text-gray-900 bg-transparent border-0 p-0 cursor-pointer"
              >
                {crumb.name}
              </button>
            ) : (
              <span className="text-gray-900 font-medium">{crumb.name}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Title */}
      <h1 className="text-2xl font-bold">{category?.name ?? "Sản phẩm"}</h1>

      {/* Sub-category tabs */}
      {tabs.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
          {tabs.map((tab) => {
            const isActive = tab._id === categoryId;
            return (
              <button
                key={tab._id}
                onClick={() => navigate(`/categories/${tab._id}`)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                  isActive
                    ? "bg-secondary2 text-white border-secondary2"
                    : "bg-white text-gray-700 border-gray-300 hover:border-secondary2 hover:text-secondary2"
                }`}
              >
                {tab.name}
              </button>
            );
          })}
        </div>
      )}

      {/* ===== Filter & Sort Bar ===== */}
      <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
        {/* Top row */}
        <div className="flex items-center gap-2 px-4 py-3 flex-wrap">
          {/* Sort pills */}
          <span className="text-sm text-gray-500 font-medium shrink-0">
            Sắp xếp:
          </span>
          {(
            [
              { label: "Mặc định", val: "" as PriceSort },
              { label: "Giá thấp ↑", val: "price_asc" as PriceSort },
              { label: "Giá cao ↓", val: "price_desc" as PriceSort },
            ] as const
          ).map(({ label, val }) => (
            <button
              key={label}
              onClick={() => setPriceSort(val)}
              className={`px-3 py-1.5 text-sm rounded-full border font-medium transition-all cursor-pointer shrink-0 ${
                priceSort === val
                  ? "bg-secondary2 text-white border-secondary2"
                  : "bg-white text-gray-600 border-gray-300 hover:border-secondary2 hover:text-secondary2"
              }`}
            >
              {label}
            </button>
          ))}

          {specKeys.length > 0 && (
            <div className="h-5 w-px bg-gray-200 mx-1 shrink-0" />
          )}

          {/* Spec filter key buttons */}
          {specKeys.map((key) => {
            const isSelected = !!selectedFilters[key];
            const isOpen = openFilterKey === key;
            return (
              <button
                key={key}
                onClick={() => setOpenFilterKey(isOpen ? null : key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border font-medium transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-red-50 text-secondary2 border-secondary2"
                    : isOpen
                      ? "bg-gray-100 text-gray-700 border-gray-400"
                      : "bg-white text-gray-600 border-gray-300 hover:border-gray-400 hover:text-gray-800"
                }`}
              >
                {isSelected ? (
                  <>
                    <span className="font-semibold">
                      {key}: {selectedFilters[key]}
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFilter(key);
                      }}
                      className="text-secondary2 hover:text-red-700 font-bold leading-none"
                    >
                      ×
                    </span>
                  </>
                ) : (
                  <>
                    <span>{key}</span>
                    <svg
                      className={`w-3 h-3 text-gray-400 transition-transform shrink-0 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 10 6"
                      fill="none"
                    >
                      <path
                        d="M1 1l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                )}
              </button>
            );
          })}

          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="ml-auto text-sm text-secondary2 hover:text-red-700 cursor-pointer bg-transparent border-0 font-medium shrink-0"
            >
              Xóa tất cả ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Dropdown value panel */}
        {openFilterKey && specValueMap[openFilterKey] && (
          <div className="border-t border-gray-100 px-4 py-3 flex flex-wrap gap-2 bg-gray-50">
            <button
              onClick={() => clearFilter(openFilterKey)}
              className={`px-3 py-1.5 text-sm rounded-full border cursor-pointer transition-all font-medium ${
                !selectedFilters[openFilterKey]
                  ? "bg-secondary2 text-white border-secondary2"
                  : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
              }`}
            >
              Tất cả
            </button>
            {specValueMap[openFilterKey].map((val) => (
              <button
                key={val}
                onClick={() => toggleFilter(openFilterKey, val)}
                className={`px-3 py-1.5 text-sm rounded-full border cursor-pointer transition-all font-medium ${
                  selectedFilters[openFilterKey] === val
                    ? "bg-secondary2 text-white border-secondary2"
                    : "bg-white text-gray-600 border-gray-300 hover:border-secondary2 hover:text-secondary2"
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active filter chips */}
      {specFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Đang lọc:</span>
          {specFilters.map(({ key, value }) => (
            <span
              key={key}
              className="flex items-center gap-1 px-3 py-1 bg-red-50 text-secondary2 border border-secondary2 rounded-full text-sm font-medium"
            >
              {key}: {value}
              <button
                onClick={() => clearFilter(key)}
                className="hover:text-red-700 font-bold cursor-pointer bg-transparent border-0 p-0 leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Product grid */}
      {products.length === 0 && !isLoading ? (
        <p className="text-gray-500 text-center py-10">
          Không có sản phẩm nào trong danh mục này.
        </p>
      ) : (
        <SearchItemList
          items={products}
          isLoading={isLoading}
          hasMore={hasMore}
          loadMore={loadMore}
        />
      )}
    </div>
  );
};

export default CategoryPage;
