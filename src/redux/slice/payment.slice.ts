import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IPaymentInitState } from "../../types/payment.types";
import { Contacts } from "../../shared/contacts";

const PAYMENT_METHOD = Contacts.PaymentMethod;

const initialState: IPaymentInitState = {
    userInfo: {
        name: "",
        numberPhone: "",
        streetAddress: "",
        city: "",
    },
    order: {
        listProduct: [],
        sumPrice: 0,
        method: PAYMENT_METHOD.COD,
    },
    isLoading: false,
    error: false,
};

const paymentSlice = createSlice({
    name: "payment",
    initialState,
    reducers: {
        updateUserInfo: <K extends keyof IPaymentInitState["userInfo"]>(
            state: IPaymentInitState,
            action: PayloadAction<{
                field: K;
                value: IPaymentInitState["userInfo"][K];
            }>,
        ) => {
            const { field, value } = action.payload;
            state.userInfo[field] = value;
        },

        updateOrder: <K extends keyof IPaymentInitState["order"]>(
            state: IPaymentInitState,
            action: PayloadAction<{ field: K; value: IPaymentInitState["order"][K] }>,
        ) => {
            state.order[action.payload.field] = action.payload.value;
        },
    },
    extraReducers: (builder) => {},
});
export type UserInfoType = keyof IPaymentInitState["userInfo"];

export const { updateUserInfo, updateOrder } = paymentSlice.actions;
export default paymentSlice.reducer;
