import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import { combineReducers } from "redux";
import productSlice from "./slice/product.slice";
import categoriesSlice from "./slice/categories.slice";
import searchSlice from "./slice/search.slice";
import cartSlice from "./slice/cart.slice";
import paymentSlice from "./slice/payment.slice";
import orderSlice from "./slice/order.slice";
import wishlistSlice from "./slice/wishlist.slice";
import paymentManagementSlice from "./slice/payment-management.slice";
import adminNotificationSlice from "./slice/admin-notification.slice";

const rootReducer = combineReducers({
    products: productSlice,
    categories: categoriesSlice,
    cart: cartSlice,
    payment: paymentSlice,
    search: searchSlice,
    order: orderSlice,
    wishlist: wishlistSlice,
    paymentManagement: paymentManagementSlice,
    adminNotification: adminNotificationSlice,
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
