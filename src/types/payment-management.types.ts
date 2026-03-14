import { Contacts } from "../shared/contacts";
import type { IOrder } from "../shared/models/order-model";
import type { IPayment } from "../shared/models/payment-model";

const PAYMENT_STATUS = Contacts.Status.Payment;

export interface PaginationType {
    page: number;
    limit: number;
    totalPages: number;
    total: number;
}
export interface IPaymentManagementInitialState {
    orders: (IOrder & { payment: IPayment })[];
    paymentTab: (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
    pagination: PaginationType;
    isloading: boolean;
    error: boolean;
}

export interface IRefundReport {
    orderId: string;
    paymentId: string;
    reason: string;
    amount: number;
    images: string[];
    cusName: string;
    cusMail: string;
    cusPhone: string;
}
