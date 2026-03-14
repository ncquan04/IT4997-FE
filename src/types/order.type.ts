import type { IOrder } from "../shared/models/order-model";
import type { IPayment } from "../shared/models/payment-model";
import { Contacts } from "../shared/contacts";

const ORDER_STATUS = Contacts.Status.Order;

export interface IOderInitialState {
    orders: (IOrder & { payment: IPayment })[];
    filterStatus: (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
    isloading: boolean;
    error: boolean;
    adminOrders: {
        data: (IOrder & {
            payment: IPayment;
            userId: {
                _id: string;
                email: string;
                fullName: string;
                phone: string;
            };
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}
