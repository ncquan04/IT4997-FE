import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IOderInitialState } from "../../types/order.type";
import { Contacts } from "../../shared/contacts";
import orderAsync from "../async-thunk/order.thunk";
import type { IOrder } from "../../shared/models/order-model";
import type { IPayment } from "../../shared/models/payment-model";

const ORDER_STATUS = Contacts.Status.Order;

const initialState: IOderInitialState = {
    orders: [],
    filterStatus: ORDER_STATUS.SHIPPING,
    isloading: false,
    error: false,
    adminOrders: {
        data: [],
        pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
        },
    },
};

const orderSilce = createSlice({
    name: "order",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(orderAsync.userVisibleOrderAsync.pending, (state) => {
            state.error = false;
            state.isloading = true;
        });
        builder.addCase(
            orderAsync.userVisibleOrderAsync.fulfilled,
            (state, action: PayloadAction<(IOrder & { payment: IPayment })[]>) => {
                state.error = false;
                state.isloading = false;
                state.orders = action.payload;
            },
        );
        builder.addCase(orderAsync.userVisibleOrderAsync.rejected, (state) => {
            state.error = true;
            state.isloading = false;
        });
        //cancel-order
        builder.addCase(orderAsync.userCancelledOrders.pending, (state) => {
            state.error = false;
            state.isloading = true;
        });
        builder.addCase(
            orderAsync.userCancelledOrders.fulfilled,
            (state, action: PayloadAction<(IOrder & { payment: IPayment })[]>) => {
                state.error = false;
                state.isloading = false;
                state.orders = action.payload;
            },
        );
        builder.addCase(orderAsync.userCancelledOrders.rejected, (state) => {
            state.error = true;
            state.isloading = false;
        });
        // return order
        builder.addCase(orderAsync.userReturnedOrders.pending, (state) => {
            state.error = false;
            state.isloading = true;
        });
        builder.addCase(
            orderAsync.userReturnedOrders.fulfilled,
            (state, action: PayloadAction<(IOrder & { payment: IPayment })[]>) => {
                state.error = false;
                state.isloading = false;
                state.orders = action.payload;
            },
        );
        builder.addCase(orderAsync.userReturnedOrders.rejected, (state) => {
            state.error = true;
            state.isloading = false;
        });
        // admin fetch all orders
        builder.addCase(orderAsync.fetchAllOrders.pending, (state) => {
            state.error = false;
            state.isloading = true;
        });
        builder.addCase(orderAsync.fetchAllOrders.fulfilled, (state, action) => {
            state.error = false;
            state.isloading = false;
            state.adminOrders = {
                data: action.payload.data,
                pagination: action.payload.pagination,
            };
        });
        builder.addCase(orderAsync.fetchAllOrders.rejected, (state) => {
            state.error = true;
            state.isloading = false;
        });

        // update order
        builder.addCase(orderAsync.updateOrder.fulfilled, (state, action) => {
            const updatedOrder = action.payload;
            if (state.adminOrders.data) {
                const index = state.adminOrders.data.findIndex((o) => o._id === updatedOrder._id);
                if (index !== -1) {
                    state.adminOrders.data[index] = updatedOrder;
                }
            }
        });
        //delivered order
        builder.addCase(orderAsync.userDeliverydOrders.pending, (state) => {
            state.error = false;
            state.isloading = true;
        });
        builder.addCase(
            orderAsync.userDeliverydOrders.fulfilled,
            (state, action: PayloadAction<(IOrder & { payment: IPayment })[]>) => {
                state.error = false;
                state.isloading = false;
                state.orders = action.payload;
            },
        );
        builder.addCase(orderAsync.userDeliverydOrders.rejected, (state) => {
            state.error = true;
            state.isloading = false;
        });
    },
});

export const {} = orderSilce.actions;
export default orderSilce.reducer;
