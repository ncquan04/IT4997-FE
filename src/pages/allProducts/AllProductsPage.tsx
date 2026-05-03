import { useEffect, useCallback, useMemo, useState } from "react";
import PageTransition from "../../components/common/PageTransition";
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

const SORT_OPTIONS: { label: string; val: PriceSort }[] = [
  { label: "Mặc định", val: "" },
  { label: "Giá thấp ↑", val: "price_asc" },
  { label: "Giá cao ↓", val: "price_desc" },
];

const AllProductsPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { categories } = useAppSelector((state: RootState) => state.categories);
  const { products, page, totalPages, isLoading } = useAppSelector(
    (state: RootState) => state.search,
  );

  const activeCategoryId = searchParams.get("categoryId") || "";

  const [priceSort, setPriceSort] = useState<PriceSort>("");
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string>
  >({});
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null);
  const [specValueMap, setSpecValueMap] = useState<Record<string, string[]>>(
    {},
  );
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileOpenKey, setMobileOpenKey] = useState<string | null>(null);

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

  // ===== Reset on category change =====
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

  const selectCategory = (id: string) => {
    setSelectedFilters({});
    setPriceSort("");
    setOpenFilterKey(null);
    setSpecValueMap({});
    if (id) setSearchParams({ categoryId: id });
    else setSearchParams({});
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
    <PageTransition>
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
      <h1 className="text-xl md:text-2xl font-bold">
        {activeCategory ? activeCategory.name : "Tất cả sản phẩm"}
      </h1>

      {/* Parent category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 border-b border-gray-200 scrollbar-none">
        <button
          onClick={() => selectCategory("")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer shrink-0 ${
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
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer shrink-0 ${
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
        <div className="flex gap-2 overflow-x-auto scrollbar-none animate-fade-in-down">
          {(() => {
            const parentId = isParent
              ? activeCategoryId
              : activeCategory?.parentCategoryId;
            return (
              <>
                <button
                  onClick={() => selectCategory(parentId!)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors cursor-pointer shrink-0 ${
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
                    className={`px-3 py-1 rounded-full text-sm border transition-colors cursor-pointer shrink-0 ${
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

      {/* ===== MOBILE: compact sort + filter button ===== */}
      <div className="flex items-center gap-2 md:hidden">
        {/* Sort select */}
        <select
          value={priceSort}
          onChange={(e) => setPriceSort(e.target.value as PriceSort)}
          className="flex-1 h-10 rounded-xl border border-gray-300 px-3 text-sm bg-white text-gray-700 cursor-pointer"
        >
          {SORT_OPTIONS.map(({ label, val }) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>

        {/* Filter button */}
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="relative flex items-center gap-2 h-10 px-4 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 cursor-pointer shrink-0"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 4h18M7 8h10M10 12h4"
            />
          </svg>
          Bộ lọc
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-secondary2 text-white text-xs flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Active filter chips — mobile only */}
      {specFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 md:hidden">
          {specFilters.map(({ key, value }) => (
            <span
              key={key}
              className="flex items-center gap-1 px-3 py-1 bg-red-50 text-secondary2 border border-secondary2 rounded-full text-xs font-medium animate-scale-in"
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

      {/* ===== DESKTOP: Filter & Sort Bar ===== */}
      <div className="hidden md:block border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col gap-2 px-4 py-3">
          {/* Sort row */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-sm text-gray-500 font-medium shrink-0">
              Sắp xếp:
            </span>
            {SORT_OPTIONS.map(({ label, val }) => (
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
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="ml-auto text-sm text-secondary2 hover:text-red-700 cursor-pointer bg-transparent border-0 font-medium shrink-0"
              >
                Xóa tất cả ({activeFilterCount})
              </button>
            )}
          </div>

          {/* Spec filter row */}
          {specKeys.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
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
            </div>
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

      {/* Desktop active filter chips */}
      {specFilters.length > 0 && (
        <div className="hidden md:flex flex-wrap items-center gap-2">
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

      {/* ===== MOBILE BOTTOM SHEET DRAWER ===== */}
      {mobileDrawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMobileDrawerOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed inset-x-0 bottom-0 z-50 md:hidden bg-white rounded-t-2xl shadow-2xl flex flex-col animate-fade-in-up max-h-[80vh]">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <span className="text-base font-semibold text-gray-900">
                Bộ lọc & Sắp xếp
              </span>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer bg-transparent border-0 text-gray-500 text-xl"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-5 py-4 flex flex-col gap-5">
              {/* Sort section */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Sắp xếp theo giá
                </p>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map(({ label, val }) => (
                    <button
                      key={val}
                      onClick={() => setPriceSort(val)}
                      className={`px-4 py-2 rounded-xl text-sm border font-medium transition-all cursor-pointer ${
                        priceSort === val
                          ? "bg-secondary2 text-white border-secondary2"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spec filter sections */}
              {specKeys.map((key) => (
                <div key={key}>
                  <button
                    onClick={() =>
                      setMobileOpenKey(mobileOpenKey === key ? null : key)
                    }
                    className="w-full flex items-center justify-between py-1 cursor-pointer bg-transparent border-0"
                  >
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {key}
                      {selectedFilters[key] && (
                        <span className="ml-2 text-secondary2 normal-case font-normal">
                          ({selectedFilters[key]})
                        </span>
                      )}
                    </p>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${mobileOpenKey === key ? "rotate-180" : ""}`}
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
                  </button>
                  {mobileOpenKey === key && (
                    <div className="flex flex-wrap gap-2 mt-2 animate-fade-in-down">
                      <button
                        onClick={() => clearFilter(key)}
                        className={`px-3 py-1.5 rounded-xl text-sm border cursor-pointer transition-all font-medium ${
                          !selectedFilters[key]
                            ? "bg-secondary2 text-white border-secondary2"
                            : "bg-gray-50 text-gray-600 border-gray-200"
                        }`}
                      >
                        Tất cả
                      </button>
                      {specValueMap[key].map((val) => (
                        <button
                          key={val}
                          onClick={() => toggleFilter(key, val)}
                          className={`px-3 py-1.5 rounded-xl text-sm border cursor-pointer transition-all font-medium ${
                            selectedFilters[key] === val
                              ? "bg-secondary2 text-white border-secondary2"
                              : "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
              {activeFilterCount > 0 && (
                <button
                  onClick={() => {
                    clearAllFilters();
                    setMobileDrawerOpen(false);
                  }}
                  className="flex-1 h-11 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 cursor-pointer bg-white"
                >
                  Xóa tất cả
                </button>
              )}
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="flex-1 h-11 rounded-xl bg-secondary2 text-white text-sm font-semibold cursor-pointer border-0"
              >
                Xem {products.length > 0 ? `${products.length}+` : ""} sản phẩm
              </button>
            </div>
          </div>
        </>
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
    </PageTransition>
  );
};

export default AllProductsPage;
