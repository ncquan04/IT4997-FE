import { useEffect, useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
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
import LoadingScreen from "../../components/common/LoadingScreen";

type PriceSort = "" | "price_asc" | "price_desc";

const AllProductsPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { categories } = useAppSelector((state: RootState) => state.categories);
  const { products, page, totalPages, isLoading } = useAppSelector(
    (state: RootState) => state.search,
  );

  // ===== URL-driven category state =====
  const activeCategoryId = searchParams.get("categoryId") || "";

  // ===== Filter / Sort state =====
  const [priceSort, setPriceSort] = useState<PriceSort>("");
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string>
  >({});
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null);
  const [specValueMap, setSpecValueMap] = useState<Record<string, string[]>>(
    {},
  );

  // ===== Category tree =====
  const parentCategories = useMemo(
    () => categories.filter((c) => !c.parentCategoryId),
    [categories],
  );

  const activeCategory = useMemo(
    () => categories.find((c) => c._id === activeCategoryId) ?? null,
    [categories, activeCategoryId],
  );

  const isParent = !activeCategory?.parentCategoryId;

  const childCategories = useMemo(() => {
    if (!activeCategoryId) return [];
    if (isParent)
      return categories.filter((c) => c.parentCategoryId === activeCategoryId);
    return categories.filter(
      (c) => c.parentCategoryId === activeCategory?.parentCategoryId,
    );
  }, [categories, activeCategoryId, isParent, activeCategory]);

  // ===== Reset filters on category change =====
  const prevCatRef = useMemo(() => ({ current: activeCategoryId }), []);
  useEffect(() => {
    if (prevCatRef.current === activeCategoryId) return;
    prevCatRef.current = activeCategoryId;
    setSelectedFilters({});
    setPriceSort("");
    setOpenFilterKey(null);
    setSpecValueMap({});
  }, [activeCategoryId]);

  // ===== Accumulate spec values =====
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

  // ===== Fetch categories =====
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

  const specFiltersKey = JSON.stringify(specFilters);

  // ===== Fetch products =====
  useEffect(() => {
    dispatch(
      searchAsync.searchProducts({
        userInput: "",
        categoryId: activeCategoryId || undefined,
        specFilters: specFilters.length > 0 ? specFilters : undefined,
        sortBy: priceSort || undefined,
        page: 1,
      }),
    );
  }, [activeCategoryId, priceSort, specFiltersKey]);

  const loadMore = useCallback(() => {
    if (isLoading || page! >= totalPages) return;
    dispatch(
      searchAsync.searchProducts({
        userInput: "",
        categoryId: activeCategoryId || undefined,
        specFilters: specFilters.length > 0 ? specFilters : undefined,
        sortBy: priceSort || undefined,
        page: page! + 1,
      }),
    );
  }, [
    isLoading,
    page,
    totalPages,
    activeCategoryId,
    specFiltersKey,
    priceSort,
  ]);

  const hasMore = page! < totalPages;

  // ===== Filter handlers =====
  const selectCategory = (id: string) => {
    setSelectedFilters({});
    setPriceSort("");
    setOpenFilterKey(null);
    setSpecValueMap({});
    if (id) {
      setSearchParams({ categoryId: id });
    } else {
      setSearchParams({});
    }
  };

  const toggleFilter = (key: string, value: string) => {
    setSelectedFilters((prev) => {
      const updated = { ...prev };
      if (updated[key] === value) delete updated[key];
      else updated[key] = value;
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

  if (page === 0 && isLoading) return <LoadingScreen />;

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
        <button
          onClick={() => navigate(AppRoutes.HOME)}
          className="hover:text-gray-900 bg-transparent border-0 p-0 cursor-pointer"
        >
          Trang chủ
        </button>
        <span className="text-gray-300">/</span>
        {activeCategory ? (
          <>
            <button
              onClick={() => selectCategory("")}
              className="hover:text-gray-900 bg-transparent border-0 p-0 cursor-pointer"
            >
              Tất cả sản phẩm
            </button>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">
              {activeCategory.name}
            </span>
          </>
        ) : (
          <span className="text-gray-900 font-medium">Tất cả sản phẩm</span>
        )}
      </nav>

      {/* Title */}
      <h1 className="text-2xl font-bold">
        {activeCategory ? activeCategory.name : "Tất cả sản phẩm"}
      </h1>

      {/* Parent category tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => selectCategory("")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
            !activeCategoryId
              ? "bg-secondary2 text-white border-secondary2"
              : "bg-white text-gray-700 border-gray-300 hover:border-secondary2 hover:text-secondary2"
          }`}
        >
          Tất cả
        </button>
        {parentCategories.map((cat) => {
          const isActive =
            activeCategoryId === cat._id ||
            categories.find((c) => c._id === activeCategoryId)
              ?.parentCategoryId === cat._id;
          return (
            <button
              key={cat._id}
              onClick={() => selectCategory(cat._id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                isActive
                  ? "bg-secondary2 text-white border-secondary2"
                  : "bg-white text-gray-700 border-gray-300 hover:border-secondary2 hover:text-secondary2"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Sub-category tabs */}
      {childCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-fade-in-down">
          {(() => {
            const parentId = isParent
              ? activeCategoryId
              : activeCategory?.parentCategoryId;
            return (
              <>
                <button
                  onClick={() => selectCategory(parentId!)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors cursor-pointer ${
                    isParent && activeCategoryId === parentId
                      ? "bg-gray-800 text-white border-gray-800"
                      : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"
                  }`}
                >
                  Tất cả
                </button>
                {childCategories.map((sub) => (
                  <button
                    key={sub._id}
                    onClick={() => selectCategory(sub._id)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors cursor-pointer ${
                      activeCategoryId === sub._id
                        ? "bg-gray-800 text-white border-gray-800"
                        : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </>
            );
          })()}
        </div>
      )}

      {/* Filter & Sort Bar */}
      <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 flex-wrap">
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
                      className={`w-3 h-3 text-gray-400 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}
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

        {openFilterKey && specValueMap[openFilterKey] && (
          <div className="border-t border-gray-100 px-4 py-3 flex flex-wrap gap-2 bg-gray-50 animate-fade-in-down">
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
            {specValueMap[openFilterKey].map((val, i) => (
              <button
                key={val}
                onClick={() => toggleFilter(openFilterKey, val)}
                style={{
                  animationDelay: `${i * 20}ms`,
                  animationFillMode: "both",
                }}
                className={[
                  "px-3 py-1.5 text-sm rounded-full border cursor-pointer transition-all font-medium animate-scale-in",
                  selectedFilters[openFilterKey] === val
                    ? "bg-secondary2 text-white border-secondary2"
                    : "bg-white text-gray-600 border-gray-300 hover:border-secondary2 hover:text-secondary2",
                ].join(" ")}
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
              className="flex items-center gap-1 px-3 py-1 bg-red-50 text-secondary2 border border-secondary2 rounded-full text-sm font-medium animate-scale-in"
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
          Không có sản phẩm nào phù hợp.
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

export default AllProductsPage;
