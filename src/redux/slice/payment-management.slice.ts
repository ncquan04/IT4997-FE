import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
    IPaymentManagementInitialState,
    PaginationType,
} from "../../types/payment-management.types";
import { Contacts } from "../../shared/contacts";
import paymentManagementAsync from "../async-thunk/payment-management.thunk";
import type { IOrder } from "../../shared/models/order-model";
import type { IPayment } from "../../shared/models/payment-model";

const PAYMENT_STATUS = Contacts.Status.Payment;

const initialState: IPaymentManagementInitialState = {
    orders: [],
    paymentTab: PAYMENT_STATUS.PAID,
    isloading: false,
    error: false,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    },
};

const paymentManagementSlice = createSlice({
    name: "payment-management",
    initialState,
    reducers: {
        setPaymentTab: (
            state,
            action: PayloadAction<(typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]>,
        ) => {
            state.paymentTab = action.payload;
        },
        setPage: (state, action: PayloadAction<number>) => {
            state.pagination.page = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(paymentManagementAsync.ordersPaymentStatus.pending, (state) => {
            state.error = false;
            state.isloading = true;
        });
        builder.addCase(
            paymentManagementAsync.ordersPaymentStatus.fulfilled,
            (
                state,
                action: PayloadAction<{
                    data: (IOrder & { payment: IPayment })[];
                    pagination: PaginationType;
                }>,
            ) => {
                state.orders = action.payload.data;
                state.pagination = {
                    ...state.pagination,
                    ...action.payload.pagination,
                };
                state.error = false;
                state.isloading = false;
            },
        );
        builder.addCase(paymentManagementAsync.ordersPaymentStatus.rejected, (state) => {
            state.error = true;
            state.isloading = false;
        });
    },
});

export const { setPaymentTab, setPage } = paymentManagementSlice.actions;
export default paymentManagementSlice.reducer;
