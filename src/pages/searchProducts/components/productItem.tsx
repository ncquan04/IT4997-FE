import { useRef, useCallback } from "react";
import ItemCard from "../../../components/common/itemCard/ItemCard";
import type { IProduct } from "../../../shared/models/product-model";

interface SearchItemListProps {
  items: IProduct[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
}

const SearchItemList = ({
  items,
  isLoading,
  hasMore,
  loadMore,
}: SearchItemListProps) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || !hasMore) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, hasMore, loadMore],
  );

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 w-full md:p-[20px]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const delay = (index % 20) * 50;

          return (
            <div
              key={item._id}
              ref={isLast ? lastItemRef : undefined}
              className="animate-fade-in-up"
              style={{
                animationDelay: `${delay}ms`,
                animationFillMode: "both",
              }}
            >
              <ItemCard item={item} />
            </div>
          );
        })}
      </div>

      {isLoading && (
        <div className="flex justify-center py-6">
          <div className="relative w-8 h-8">
            <div className="absolute w-full h-full border-4 border-gray-100 rounded-full"></div>
            <div className="absolute w-full h-full border-4 border-red-500 rounded-full animate-spin border-t-transparent"></div>
          </div>
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <p className="text-center py-4 text-gray-400">Hết kết quả</p>
      )}
    </>
  );
};

export default SearchItemList;
