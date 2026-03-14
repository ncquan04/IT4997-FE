import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateQuantity,
} from "../../services/api/api.cart";

export const fetchCart = createAsyncThunk("cart/fetchCart", async () => {
  const response = await getCart();
  return response.data;
});

export const addToCartThunk = createAsyncThunk(
  "cart/addToCart",
  async ({
    productId,
    variantId,
    quantity,
  }: {
    productId: string;
    variantId: string;
    quantity: number;
  }) => {
    const response = await addToCart(productId, variantId, quantity);
    return response.data;
  }
);

export const updateCartItemThunk = createAsyncThunk(
  "cart/updateCartItem",
  async ({
    productId,
    variantId,
    quantity,
  }: {
    productId: string;
    variantId: string;
    quantity: number;
  }) => {
    const response = await updateQuantity(productId, variantId, quantity);
    return response.data;
  }
);

export const removeFromCartThunk = createAsyncThunk(
  "cart/removeFromCart",
  async ({
    productId,
    variantId,
  }: {
    productId: string;
    variantId: string;
  }) => {
    await removeFromCart(productId, variantId);
    return { productId, variantId };
  }
);

const cartAsync = {
  fetchCart,
  addToCartThunk,
  updateCartItemThunk,
  removeFromCartThunk,
};

export default cartAsync;
