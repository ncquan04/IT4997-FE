import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IProductInitState } from "../../types/product.types";
import type { IProduct } from "../../shared/models/product-model";
import productAsync from "../async-thunk/product.thunk";

const initialState: IProductInitState = {
    products: [],
    productDetail: null,
    error: false,
    isLoading: false,
    page: 1,
    totalPages: 1,
};

const productSlice = createSlice({
    name: "products",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        //products list
        builder.addCase(
            productAsync.fetchProduct.fulfilled,
            (
                state,
                action: PayloadAction<{
                    products: IProduct[];
                    page?: number;
                    totalPages?: number;
                }>,
            ) => {
                state.error = false;
                state.isLoading = false;
                state.products = action.payload.products;
                state.page = action.payload.page;
                state.totalPages = action.payload.totalPages;
            },
        );
        builder.addCase(productAsync.fetchProduct.pending, (state) => {
            (state.error = false), (state.isLoading = true);
        });
        builder.addCase(productAsync.fetchProduct.rejected, (state) => {
            (state.error = true), (state.isLoading = false);
        });
        // product detail
        builder.addCase(
            productAsync.fetchDetail.fulfilled,
            (state, action: PayloadAction<{ productDetail: IProduct }>) => {
                (state.error = false), (state.isLoading = false);
                state.productDetail = action.payload.productDetail;
            },
        );
        builder.addCase(productAsync.fetchDetail.pending, (state) => {
            (state.error = false), (state.isLoading = true);
        });
        builder.addCase(productAsync.fetchDetail.rejected, (state) => {
            (state.error = true), (state.isLoading = false);
        });

        // Create Product
        builder.addCase(productAsync.createProduct.fulfilled, (state, action) => {
            state.isLoading = false;
            state.error = false;
            state.products.unshift(action.payload);
        });
        builder.addCase(productAsync.createProduct.pending, (state) => {
            state.isLoading = true;
            state.error = false;
        });
        builder.addCase(productAsync.createProduct.rejected, (state) => {
            state.isLoading = false;
            state.error = true;
        });

        // Update Product
        builder.addCase(productAsync.updateProduct.fulfilled, (state, action) => {
            state.isLoading = false;
            state.error = false;
            if (state.productDetail && state.productDetail._id === action.payload._id) {
                state.productDetail = action.payload;
            }
            state.products = state.products.map((p) => 
                p._id === action.payload._id ? action.payload : p
            );
        });
        builder.addCase(productAsync.updateProduct.pending, (state) => {
            state.isLoading = true;
            state.error = false;
        });
        builder.addCase(productAsync.updateProduct.rejected, (state) => {
            state.isLoading = false;
            state.error = true;
        });

        // Delete Product
        builder.addCase(productAsync.deleteProduct.fulfilled, (state, action) => {
            state.isLoading = false;
            state.error = false;
            state.products = state.products.filter((p) => p._id !== action.payload);
        });
        builder.addCase(productAsync.deleteProduct.pending, (state) => {
            state.isLoading = true;
            state.error = false;
        });
        builder.addCase(productAsync.deleteProduct.rejected, (state) => {
            state.isLoading = false;
            state.error = true;
        });
    },
});

export const {} = productSlice.actions;
export default productSlice.reducer;
