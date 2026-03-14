import { Contacts } from "../../shared/contacts";
import type { IRefundReport } from "../../types/payment-management.types";
import { apiService } from "./api.config";

const API_PATH = Contacts.API_CONFIG;

export const createReportRefund = async ({
    orderId,
    paymentId,
    reason,
    amount,
    images,
    cusMail,
    cusName,
    cusPhone,
}: IRefundReport) => {
    try {
        const response = await apiService.post(API_PATH.REPORT_REFUND.CREATE.URL, {
            orderId,
            paymentId,
            reason,
            amount,
            images,
            cusMail,
            cusName,
            cusPhone,
        });
        return response;
    } catch (err) {
        console.log("create report refund error: ", err);
        return null;
    }
};
