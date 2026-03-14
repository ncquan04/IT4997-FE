import { createAsyncThunk } from "@reduxjs/toolkit";
import type { IOrder } from "../../shared/models/order-model";
import type { IPayment } from "../../shared/models/payment-model";
import { getOrderPaymentStatus } from "../../services/api/api.order";
import type { PaginationType } from "../../types/payment-management.types";

class PaymentManagementAsync {
    ordersPaymentStatus = createAsyncThunk<
        { data: (IOrder & { payment: IPayment })[]; pagination: PaginationType },
        { page: number; paymentTab: number; search?: string },
        { rejectValue: any }
    >(
        "orders/order-payment-status",
        async (
            payload: { page: number; paymentTab: number; search?: string },
            { rejectWithValue },
        ) => {
            try {
                const response = await getOrderPaymentStatus({
                    page: payload.page,
                    paymentStatus: payload.paymentTab,
                    search: payload.search,
                });
                if (!response) {
                    throw new Error("");
                }
                return response;
            } catch (err) {
                return rejectWithValue({
                    error: "order-payment-status error",
                });
            }
        },
    );
}
const paymentManagementAsync = new PaymentManagementAsync();
export default paymentManagementAsync;
