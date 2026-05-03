import { useEffect, useCallback } from "react";
import PageTransition from "../../components/common/PageTransition";
import { useSearchParams } from "react-router";
import {
  useAppDispatch,
  useAppSelector,
  type RootState,
} from "../../redux/store";
import searchAsync from "../../redux/async-thunk/search.thunk";
import SearchItemList from "./components/productItem";
import NotFoundPage from "../notFound/NotFoundPage";
import categoriesAync from "../../redux/async-thunk/categories.thunk";
import LoadingScreen from "../../components/common/LoadingScreen";
import { logEvent } from "../../utils/analytics";

const SearchPage = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  const { categories } = useAppSelector((state: RootState) => state.categories);
  const { products, page, totalPages, isLoading } = useAppSelector(
    (state: RootState) => state.search,
  );

  // ===== base query (từ SearchBar) =====
  const q = searchParams.get("q") || "";
  const categoryId = searchParams.get("categoryId") || "";
  //test dev
  const all = searchParams.get("all") || "";

  const buildPayload = (page: number) => ({
    userInput: q,
    page,
    categoryId,
  });

  /* ===== fetch page 1 khi q hoặc filter đổi ===== */
  useEffect(() => {
    if (all) {
      dispatch(searchAsync.searchProducts({ userInput: "" }));
      return;
    }
    if (!q && !categoryId) return;
    dispatch(searchAsync.searchProducts(buildPayload(1)));
  }, [q, categoryId, all]);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(categoriesAync.fectchCategories());
    }
  }, [categories]);

  /* ===== infinite scroll ===== */
  const loadMore = useCallback(() => {
    if (isLoading) return;
    if (page! >= totalPages) return;

    logEvent("load_more", {
      query: q,
      categoryId,
      currentPage: page,
      nextPage: page! + 1,
    });

    dispatch(searchAsync.searchProducts(buildPayload(page! + 1)));
  }, [isLoading, page, totalPages, q]);

  const hasMore = page! < totalPages;

  // Đang chờ fetch lần đầu hoặc đang loading
  if (isLoading || (page === 0 && (!!q || !!categoryId || !!all))) {
    return <LoadingScreen />;
  }

  if (products.length === 0) {
    return <NotFoundPage />;
  }

  return (
    <PageTransition>
    <div className="max-w-[1024px] mx-auto w-full">
      <div className="mb-3 text-sm text-gray-600 py-[20px]">
        {all ? (
          <span className="font-medium text-gray-900">Tất cả sản phẩm</span>
        ) : (
          <>
            Kết quả tìm kiếm cho{" "}
            <span className="font-medium text-gray-900">"{q}"</span>
          </>
        )}
      </div>
      <div className="flex flex-col gap-6">
        <SearchItemList
          items={products}
          isLoading={isLoading}
          hasMore={hasMore}
          loadMore={loadMore}
        />
      </div>
    </div>
    </PageTransition>
  );
};

export default SearchPage;
