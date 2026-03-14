import { useEffect, useState } from "react";
import { Product } from "../../../shared/models/product-model";
import SectionTag from "../../../components/common/sectionTag/SectionTag";
import ItemSwiper from "../../../components/common/itemSwiper/ItemSwiper";
import { useAppSelector } from "../../../redux/store";
import { fetchProducts } from "../../../services/api/api.products";

const JustForYou = () => {
    const { wishlistItems } = useAppSelector((state) => state.wishlist);
    const [personalizedItems, setPersonalizedItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (wishlistItems.length === 0) return;

            setLoading(true);
            try {
                // 1. Analyze Wishlist
                const categoryCounts: Record<string, number> = {};

                wishlistItems.forEach((item) => {
                    if (item.categoryId) {
                        categoryCounts[item.categoryId] = (categoryCounts[item.categoryId] || 0) + 1;
                    }
                });

                // Find top category
                let topCategory = "";
                let maxCategoryCount = 0;
                for (const [cat, count] of Object.entries(categoryCounts)) {
                    if (count > maxCategoryCount) {
                        maxCategoryCount = count;
                        topCategory = cat;
                    }
                }

                // 2. Fetch Products
                let recommendations: Product[] = [];
                const LIMIT = 10;
                const idsToExclude = new Set(wishlistItems.map((item) => item._id));

                const addProducts = (products: Product[]) => {
                    for (const p of products) {
                        if (recommendations.length >= LIMIT) break;
                        if (!idsToExclude.has(p._id)) {
                            recommendations.push(p);
                            idsToExclude.add(p._id);
                        }
                    }
                };

                // a. Fetch by Top Category (Prioritize over Brand since we use fetchProducts)
                if (topCategory) {
                    const categoryResponse = await fetchProducts(topCategory, 1);
                    if (categoryResponse && categoryResponse.products) {
                        addProducts(categoryResponse.products);
                    }
                }

                // b. Fetch random/generic if needed just to fill
                if (recommendations.length < LIMIT) {
                     const genericResponse = await fetchProducts(undefined, 1); 
                     if (genericResponse && genericResponse.products) {
                        addProducts(genericResponse.products);
                     }
                }

                setPersonalizedItems(recommendations);
            } catch (error) {
                console.error("Failed to calculate recommendations", error);
            } finally {
                setLoading(false);
            }
        };

        if (wishlistItems.length > 0) {
             fetchRecommendations();
        }
    }, [wishlistItems]);

    if (!loading && personalizedItems.length === 0) return null; 

    return (
        <section
            className="flex flex-col gap-6 md:gap-8 lg:gap-12 px-0 sm:px-2 md:px-4"
            aria-labelledby="just-for-you-section-heading"
        >
            <h2 id="just-for-you-section-heading" className="sr-only">
                Just For You
            </h2>
            <SectionTag title="Just For You" />
            <div className="w-full">
                {loading ? (
                    <div className="flex justify-center items-center w-full py-12">
                         <div className="relative w-12 h-12">
                            <div className="absolute w-full h-full border-4 border-gray-100 rounded-full"></div>
                            <div className="absolute w-full h-full border-4 border-red-500 rounded-full animate-spin border-t-transparent"></div>
                        </div>
                    </div>
                ) : (
                    <ItemSwiper items={personalizedItems} />
                )}
            </div>
        </section>
    );
};
export default JustForYou;
