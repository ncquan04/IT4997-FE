import { createAsyncThunk } from "@reduxjs/toolkit";
import type { ISearchProduct, ISearchProductResponse } from "../../types/search.types";
import { SearchProducts } from "../../services/api/api.search";

class SearchAsync {
    searchProducts = createAsyncThunk<ISearchProductResponse, ISearchProduct, { rejectValue: any }>(
        "search/products",
        async (payload: ISearchProduct, { rejectWithValue }) => {
            try {
                const response = await SearchProducts(payload);

                if (!response) {
                    throw new Error("products is empty");
                }

                return {
                    products: response.products,
                    page: response.page,
                    totalPages: response.pageTotal,
                };
            } catch (err) {
                console.log("search products error: ", err);
                return rejectWithValue({
                    error: "search products error",
                });
            }
        },
    );
}
const searchAsync = new SearchAsync();
export default searchAsync;
