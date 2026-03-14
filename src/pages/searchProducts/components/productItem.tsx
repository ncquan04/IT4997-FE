import { useRef, useCallback } from "react";
import ItemCard from "../../../components/common/itemCard/ItemCard";
import type { IProduct } from "../../../shared/models/product-model";

interface SearchItemListProps {
    items: IProduct[];
    isLoading: boolean;
    hasMore: boolean;
    loadMore: () => void;
}

const SearchItemList = ({ items, isLoading, hasMore, loadMore }: SearchItemListProps) => {
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[1024px] mx-auto p-[20px]">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <div key={item._id} ref={isLast ? lastItemRef : undefined}>
                            <ItemCard item={item} />
                        </div>
                    );
                })}
            </div>

            {isLoading && <p className="text-center py-4 text-gray-500">Đang tải thêm...</p>}

            {!hasMore && items.length > 0 && (
                <p className="text-center py-4 text-gray-400">Hết kết quả</p>
            )}
        </>
    );
};

export default SearchItemList;
