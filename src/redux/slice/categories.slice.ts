import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import categoriesAync from "../async-thunk/categories.thunk";
import type { ICategoriesInitState } from "../../types/categories.types";
import type { ICategory } from "../../shared/models/category-model";

const initialState: ICategoriesInitState = {
    categories: [],
    error: false,
    isLoading: false,
};

const categoriesSlice = createSlice({
    name: "categories",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(
            categoriesAync.fectchCategories.fulfilled,
            (state, action: PayloadAction<{ categories: ICategory[] }>) => {
                (state.error = false), (state.isLoading = false);
                state.categories = action.payload.categories;
            },
        );
        builder.addCase(categoriesAync.fectchCategories.pending, (state) => {
            (state.error = false), (state.isLoading = false);
        });
        builder.addCase(categoriesAync.fectchCategories.rejected, (state) => {
            (state.error = true), (state.isLoading = false);
        });
    },
});

export const {} = categoriesSlice.actions;
export default categoriesSlice.reducer;
