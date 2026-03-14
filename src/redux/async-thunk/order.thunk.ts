import { createAsyncThunk } from "@reduxjs/toolkit";
import type { IOrder } from "../../shared/models/order-model";
import type { IPayment } from "../../shared/models/payment-model";
import {
    getOrderPaymentStatus,
    getUserCancelledOrders,
    getUserDeliveryOrdres,
    getUserReturnedOrders,
    userOrderVisible,
    getAllOrders,
    putChangeOrderStatus,
} from "../../services/api/api.order";
import type { PaginationType } from "../../types/payment-management.types";

class OrderAsync {
    userVisibleOrderAsync = createAsyncThunk<
        (IOrder & { payment: IPayment })[],
        void,
        { rejectValue: any }
    >("order/user-visible-order", async (_, { rejectWithValue }) => {
        try {
            const response = await userOrderVisible();
            if (!response) {
                throw new Error("");
            }
            return response;
        } catch (err) {
            return rejectWithValue({
                error: "user-visible-order error",
            });
        }
    });
    userCancelledOrders = createAsyncThunk<
        (IOrder & { payment: IPayment })[],
        void,
        { rejectValue: any }
    >("order/user-cancel-order", async (_, { rejectWithValue }) => {
        try {
            const response = await getUserCancelledOrders();
            if (!response) {
                throw new Error("");
            }
            return response;
        } catch (err: any) {
            return rejectWithValue({
                error: "user-cancel-order error",
            });
        }
    });

    userReturnedOrders = createAsyncThunk<
        (IOrder & { payment: IPayment })[],
        void,
        { rejectValue: any }
    >("order/user-return-order", async (_, { rejectWithValue }) => {
        try {
            const response = await getUserReturnedOrders();
            if (!response) {
                throw new Error("");
            }
            return response;
        } catch (err: any) {
            return rejectWithValue({
                error: "user-cancel-order error",
            });
        }
    });

    ordersPaymentStatus = createAsyncThunk<
        { data: (IOrder & { payment: IPayment })[]; pagination: PaginationType },
        { page: number; paymentTab: number },
        { rejectValue: any }
    >(
        "orders/order-payment-status",
        async (payload: { page: number; paymentTab: number }, { rejectWithValue }) => {
            try {
                const response = await getOrderPaymentStatus({
                    page: payload.page,
                    paymentStatus: payload.paymentTab,
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

    // ADMIN
    fetchAllOrders = createAsyncThunk<
        {
            data: (IOrder & {
                payment: IPayment;
                userId: {
                    _id: string;
                    email: string;
                    fullName: string;
                    phone: string;
                };
            })[];
            pagination: PaginationType;
        },
        { page: number; limit: number; search?: string; status?: string },
        { rejectValue: any }
    >("order/fetch-all-orders", async (payload, { rejectWithValue }) => {
        try {
            const response = await getAllOrders(payload);
            if (!response) {
                throw new Error("Failed to fetch orders");
            }
            return response;
        } catch (err: any) {
            return rejectWithValue({
                error: err.message || "Fetch all orders error",
            });
        }
    });

    userDeliverydOrders = createAsyncThunk<
        (IOrder & { payment: IPayment })[],
        void,
        { rejectValue: any }
    >("order/user-delivery-order", async (_, { rejectWithValue }) => {
        try {
            const response = await getUserDeliveryOrdres();
            if (!response) {
                throw new Error("");
            }
            return response;
        } catch (err: any) {
            return rejectWithValue({
                error: err.message || "Fetch all orders error",
            });
        }
    });

    updateOrder = createAsyncThunk<
        IOrder & {
            payment: IPayment;
            userId: {
                _id: string;
                email: string;
                fullName: string;
                phone: string;
            };
        },
        { orderId: string; status: number },
        { rejectValue: any }
    >("order/update-order", async ({ orderId, status }, { rejectWithValue }) => {
        try {
            const response = await putChangeOrderStatus({ orderId, statusOrder: status as any });
            if (!response) {
                throw new Error("Failed to update order");
            }
            return response as any;
        } catch (err: any) {
            return rejectWithValue({
                error: err.message || "Update order error",
            });
        }
    });
}
const orderAsync = new OrderAsync();
export default orderAsync;
