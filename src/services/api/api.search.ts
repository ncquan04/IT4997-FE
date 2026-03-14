import { Contacts } from "../../shared/contacts";
import { apiService } from "./api.config";
import type { ISearchProduct } from "../../types/search.types";
import type { IProduct } from "../../shared/models/product-model";

export const SearchProducts = async ({
    userInput,
    brand,
    categoryId,
    specKey,
    specValue,
    minPrice,
    maxPrice,
    page,
}: ISearchProduct) => {
    const query = new URLSearchParams();
    if (userInput) query.append("query", userInput);
    if (brand) query.append("brand", brand);
    if (categoryId) query.append("categoryId", categoryId);
    if (specKey && specValue) {
        query.append("specKey", specKey);
        query.append("specValue", specValue);
    }
    if (minPrice) query.append("minPrice", String(minPrice));
    if (maxPrice) query.append("maxPrice", String(maxPrice));
    if (page) query.append("page", String(page));

    try {
        const response = await apiService.get<{
            page: number;
            size: number;
            total: number;
            pageTotal: number;
            data: IProduct[];
        }>(Contacts.API_CONFIG.SEARCH.SEARCH_PRODUCTS.URL + "?" + query);
        return {
            products: response.data || [],
            page: response.page || 1,
            pageTotal: response.pageTotal || 1,
        };
    } catch (err) {
        console.log("Search product error: ", err);
        return null;
    }
};
