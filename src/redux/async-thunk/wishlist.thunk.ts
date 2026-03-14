import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  addToWishlist,
  checkWishlist,
  getWishlist,
  removeFromWishlist,
} from "../../services/api/api.wishlist";

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async () => {
    const data = await getWishlist();
    return data;
  }
);

export const addToWishlistThunk = createAsyncThunk(
  "wishlist/addToWishlist",
  async (productId: string) => {
    const response = await addToWishlist(productId);
    return response;
  }
);

export const removeFromWishlistThunk = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (productId: string) => {
    const response = await removeFromWishlist(productId);
    return response;
  }
);

export const checkWishlistThunk = createAsyncThunk(
  "wishlist/checkWishlist",
  async (productId: string) => {
    const response = await checkWishlist(productId);
    return { productId, exists: response.exists };
  }
);
