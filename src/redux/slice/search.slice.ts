import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ISearchInitState, ISearchProductResponse } from "../../types/search.types";
import searchAsync from "../async-thunk/search.thunk";

const initialState: ISearchInitState = {
    products: [],
    isLoading: false,
    error: false,
    page: 0,
    totalPages: 0,
};

const searchSlice = createSlice({
    name: "search slice",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(
            searchAsync.searchProducts.fulfilled,
            (state, action: PayloadAction<ISearchProductResponse>) => {
                (state.error = false), (state.isLoading = false);
                if (action.payload.page === 1) {
                    state.products = action.payload.products;
                } else {
                    state.products.push(...action.payload.products);
                }
                state.page = action.payload.page;
                state.totalPages = action.payload.totalPages;
            },
        );
        builder.addCase(searchAsync.searchProducts.pending, (state) => {
            (state.error = false), (state.isLoading = true);
        });
        builder.addCase(searchAsync.searchProducts.rejected, (state) => {
            (state.error = true), (state.isLoading = false);
        });
    },
});

export const {} = searchSlice.actions;
export default searchSlice.reducer;
