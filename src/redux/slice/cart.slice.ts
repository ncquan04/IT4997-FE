import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ICartInitState } from "../../types/cart.types";
import cartAsync from "../async-thunk/cart.thunk";
import type { ICartResponseItem } from "../../services/api/api.cart";

const initialState: ICartInitState = {
  cartItems: [],
  totalPrice: 0,
  isLoading: false,
  error: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    calculateTotal: (state) => {
      state.totalPrice = state.cartItems.reduce((total, item) => {
        const price = item.product.selectedVariant?.price || 0;
        return total + price * item.quantity;
      }, 0);
    },
  },
  extraReducers: (builder) => {
    // Fetch Cart
    builder.addCase(cartAsync.fetchCart.pending, (state) => {
      state.isLoading = true;
      state.error = false;
    });
    builder.addCase(
      cartAsync.fetchCart.fulfilled,
      (state, action: PayloadAction<ICartResponseItem[]>) => {
        state.isLoading = false;
        state.cartItems = action.payload;
        // Calculate total immediately
        state.totalPrice = action.payload.reduce((total, item) => {
          const price = item.product.selectedVariant?.price || 0;
          return total + price * item.quantity;
        }, 0);
      }
    );
    builder.addCase(cartAsync.fetchCart.rejected, (state) => {
      state.isLoading = false;
      state.error = true;
    });

    // Add to Cart
    builder.addCase(cartAsync.addToCartThunk.fulfilled, (state) => {
      state.isLoading = false;
    });

    // Remove from Cart
    builder.addCase(
      cartAsync.removeFromCartThunk.fulfilled,
      (state, action) => {
        state.cartItems = state.cartItems.filter(
          (item) =>
            !(
              item.product._id === action.payload.productId &&
              item.product.selectedVariant?._id === action.payload.variantId
            )
        );
        state.totalPrice = state.cartItems.reduce((total, item) => {
          const price = item.product.selectedVariant?.price || 0;
          return total + price * item.quantity;
        }, 0);
      }
    );

    // Update Cart Item
    builder.addCase(cartAsync.updateCartItemThunk.fulfilled, (state) => {
      state.isLoading = false;
    });
  },
});

export const { calculateTotal } = cartSlice.actions;
export default cartSlice.reducer;
