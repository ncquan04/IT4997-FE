import { useState } from "react";
import { Contacts } from "../../../shared/contacts";
import type { IOrder } from "../../../shared/models/order-model";
import type { IPayment } from "../../../shared/models/payment-model";
import { RefundModal } from "./refundModal";
import { putChangeOrderStatus } from "../../../services/api/api.order";
import type { IRefundReport } from "../../../types/payment-management.types";
import { createReportRefund } from "../../../services/api/api.report-refund";
import { putChangePaymentStatus } from "../../../services/api/api.payment";
import { useAppDispatch } from "../../../redux/store";
import { setPaymentTab } from "../../../redux/slice/payment-management.slice";

const STATUS_PAYMENT = Contacts.Status.Payment;
const STATUS_ORDER = Contacts.Status.Order;

type Props = {
    orders: (IOrder & { payment: IPayment })[];
    loading?: boolean;
};

const PAYMENT_STATUS_LABEL: Record<number, string> = {
    [STATUS_PAYMENT.UNPAID]: "Chưa thanh toán",
    [STATUS_PAYMENT.PAID]: "Đã thanh toán",
    [STATUS_PAYMENT.REFUNDED]: "Đã hoàn tiền",
    [STATUS_PAYMENT.FAILED]: "Thất bại",
};

const ORDER_STATUS_LABEL: Record<number, string> = {
    [STATUS_ORDER.ORDERED]: "Đã đặt",
    [STATUS_ORDER.PROCESSING]: "Đang xử lý",
    [STATUS_ORDER.SHIPPING]: "Đang giao",
    [STATUS_ORDER.DELIVERED]: "Đã giao",
    [STATUS_ORDER.CANCELLED]: "Đã hủy",
    [STATUS_ORDER.RETURNED]: "Hoàn hàng",
};

const ORDER_STATUS_COLOR: Record<number, string> = {
    [STATUS_ORDER.ORDERED]: "bg-gray-100 text-gray-700",
    [STATUS_ORDER.PROCESSING]: "bg-blue-100 text-blue-700",
    [STATUS_ORDER.SHIPPING]: "bg-orange-100 text-orange-700",
    [STATUS_ORDER.DELIVERED]: "bg-green-100 text-green-700",
    [STATUS_ORDER.CANCELLED]: "bg-red-100 text-red-700",
    [STATUS_ORDER.RETURNED]: "bg-purple-100 text-purple-700",
};

const PaymentOrdersTable = ({ orders, loading }: Props) => {
    const dispatch = useAppDispatch();
    const canRefund = (order: IOrder & { payment: IPayment }) => {
        const { payment, statusOrder: orderStatus } = order;

        return (
            payment.method === Contacts.PaymentMethod.STRIPE &&
            payment.status === STATUS_PAYMENT.PAID &&
            orderStatus === Contacts.Status.Order.SHIPPING
        );
    };

    const [open, setOpen] = useState(false);

    const handleRefund = async (data: IRefundReport) => {
        try {
            const { orderId, paymentId, cusMail, amount, cusName, cusPhone, images, reason } = data;
            const changeOrder = putChangeOrderStatus({
                orderId,
                statusOrder: STATUS_ORDER.RETURNED,
            });

            if (!changeOrder) throw new Error("");

            const changePaymentStatus = await putChangePaymentStatus({
                status: STATUS_PAYMENT.REFUNDED,
                paymentId,
            });

            if (!changePaymentStatus) throw new Error("");

            const report = await createReportRefund({
                orderId,
                paymentId,
                reason,
                amount,
                images,
                cusMail,
                cusName,
                cusPhone,
            });

            if (!report) throw new Error("");

            dispatch(setPaymentTab(STATUS_PAYMENT.REFUNDED));
        } catch (err) {
            alert("refund error");
        }
    };

    if (loading) {
        return <div className="p-4 text-gray-500">Đang tải dữ liệu...</div>;
    }

    if (!orders.length) {
        return <div className="p-4 text-gray-500">Không có đơn hàng</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider">
                            OrderId
                        </th>

                        <th className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider">
                            Customer
                        </th>
                        <th className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider">
                            Sum Price
                        </th>
                        <th className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider">
                            Payment method
                        </th>
                        <th className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider text-center">
                            Order status
                        </th>
                        <th className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {orders.map((order) => {
                        const { payment } = order;

                        return (
                            <tr
                                key={order._id}
                                className="border-b border-gray-100 last:border-b hover:bg-gray-50"
                            >
                                <td className="p-5">{order._id}</td>

                                <td className="p-5  text-center">
                                    {order.userName || order.numberPhone || order.userId}
                                </td>

                                <td className="p-5 text-center font-medium">
                                    {payment.totalMoney.toLocaleString()} ₫
                                </td>

                                <td className="p-5  text-center">{payment.method}</td>

                                <td className="p-5 text-center">
                                    <span
                                        className={`
                                            inline-block px-2 py-1 rounded text-xs font-medium
                                            ${ORDER_STATUS_COLOR[order.statusOrder]}
                                        `}
                                    >
                                        {ORDER_STATUS_LABEL[order.statusOrder] ?? order.statusOrder}
                                    </span>
                                </td>

                                <td className="p-5">
                                    <div className="flex justify-center items-center gap-2 max-w-[240px] mx-auto">
                                        <span
                                            className={`
                                                inline-block px-2 py-1 rounded text-xs
                                                ${
                                                    payment.status === STATUS_PAYMENT.PAID
                                                        ? "bg-green-100 text-green-700"
                                                        : payment.status === STATUS_PAYMENT.REFUNDED
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-gray-100 text-gray-600"
                                                }
                                            `}
                                        >
                                            {PAYMENT_STATUS_LABEL[payment.status] ?? payment.status}
                                        </span>

                                        {canRefund(order) && (
                                            <>
                                                <button
                                                    onClick={() => setOpen(true)}
                                                    className="
                                                px-3 py-1 text-xs font-medium
                                                bg-red-500 text-white rounded
                                                hover:bg-red-600
                                                transition
                                                "
                                                >
                                                    Refund
                                                </button>
                                                {open && (
                                                    <RefundModal
                                                        open={open}
                                                        order={order}
                                                        onClose={() => setOpen(false)}
                                                        onSubmit={(data: IRefundReport) => {
                                                            handleRefund?.(data);
                                                        }}
                                                    />
                                                )}
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default PaymentOrdersTable;
