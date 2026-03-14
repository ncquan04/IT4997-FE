import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../../shared/models/product-model";
import * as wishlistAsync from "../async-thunk/wishlist.thunk";

interface IWishlistState {
  wishlistItems: Product[];
  isLoading: boolean;
  error: boolean;
  checkStatus: Record<string, boolean>; // productId -> exists mapping
}

const initialState: IWishlistState = {
  wishlistItems: [],
  isLoading: false,
  error: false,
  checkStatus: {},
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch Wishlist
    builder.addCase(wishlistAsync.fetchWishlist.pending, (state) => {
      state.isLoading = true;
      state.error = false;
    });
    builder.addCase(
      wishlistAsync.fetchWishlist.fulfilled,
      (state, action: PayloadAction<Product[]>) => {
        state.isLoading = false;
        state.wishlistItems = action.payload;
      }
    );
    builder.addCase(wishlistAsync.fetchWishlist.rejected, (state) => {
      state.isLoading = false;
      state.error = true;
    });

    builder.addCase(wishlistAsync.removeFromWishlistThunk.fulfilled, (state, action) => {
        state.wishlistItems = state.wishlistItems.filter(item => item._id !== action.meta.arg);
    });

    // Check Wishlist
    builder.addCase(wishlistAsync.checkWishlistThunk.fulfilled, (state, action) => {
        state.checkStatus = {
            ...state.checkStatus,
            [action.payload.productId]: action.payload.exists
        };
    });
  },
});

export default wishlistSlice.reducer;
