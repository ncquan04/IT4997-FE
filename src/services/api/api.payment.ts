import { apiService } from "./api.config";
import { Contacts } from "../../shared/contacts";

const API_PATH = Contacts.API_CONFIG;
const PAYMENT_METHOD = Contacts.PaymentMethod;
const PAYMENT_STATUS = Contacts.Status.Payment;
const PAYMENT_STATUS_CHECK = Contacts.Status.Payment_check_update;

export const createPayment = async ({
    orderId,
    method,
}: {
    orderId: string;
    method: (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];
}) => {
    try {
        const params = new URLSearchParams();
        params.append("method", method);
        params.append("order", orderId);
        const response = await apiService.post<string>(
            API_PATH.PAYMENT.CREATE.URL + "?" + params.toString(),
        );
        return response;
    } catch (err) {
        console.log("create payment error: ", err);
        return null;
    }
};

export const CheckUpdatePayment = async ({ id }: { id: string }) => {
    try {
        const response = await apiService.get<
            (typeof PAYMENT_STATUS_CHECK)[keyof typeof PAYMENT_STATUS_CHECK]
        >(API_PATH.PAYMENT.CHECKUPDATE(id).URL);
        return response;
    } catch (err: any) {
        console.log("Check update payment error: ", err);
        return null;
    }
};

export const putChangePaymentStatus = async ({
    status,
    paymentId,
}: {
    status: (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
    paymentId: string;
}) => {
    try {
        const response = await apiService.put<boolean>(API_PATH.PAYMENT.CHANGE_STATUS.URL, {
            status,
            paymentId,
        });
        return response;
    } catch (err) {
        console.log("Change paymnet status error: ", err);
        return null;
    }
};
