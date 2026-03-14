import { createAsyncThunk } from "@reduxjs/toolkit";
import type { ICategory } from "../../shared/models/category-model";
import { fetchCategories } from "../../services/api/api.categories";
class CategoriesAsync {
    // fetch categories
    fectchCategories = createAsyncThunk<
        {
            categories: ICategory[];
        },
        void,
        { rejectValue: any }
    >("categories/fetch-list", async (_, { rejectWithValue }) => {
        try {
            const response = await fetchCategories();
            if (!response) {
                throw new Error("categories not found");
            }
            return { categories: response };
        } catch (err) {
            console.log("fetch categories error: ", err);
            return rejectWithValue({
                error: "fetch categories error",
            });
        }
    });
}
const categoriesAync = new CategoriesAsync();
export default categoriesAync;
