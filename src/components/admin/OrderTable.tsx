import React from "react";
import type { IOrder } from "../../shared/models/order-model";
import { Contacts } from "../../shared/contacts";
import { motion } from "framer-motion";
import type { IPayment } from "../../shared/models/payment-model";

interface IOrderExtended extends IOrder {
    createdAt?: string;
    updatedAt?: string;
}

interface OrderTableProps {
    orders: (IOrder & {
        payment: IPayment;
        userId: {
            _id: string;
            email: string;
            fullName: string;
            phone: string;
        };
    })[];
    onStatusChange?: (id: string, status: number) => void;
    isLoading?: boolean;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({
    orders,
    onStatusChange,
    isLoading,
    currentPage,
    totalPages,
    onPageChange,
}) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                Loading orders...
            </div>
        );
    }

    const getStatusBadge = (status: number) => {
        const statusMap: Record<number, { label: string; color: string }> = {
            [Contacts.Status.Order.ORDERED]: { label: "Ordered", color: "bg-blue-100 text-blue-800" },
            [Contacts.Status.Order.PROCESSING]: { label: "Processing", color: "bg-yellow-100 text-yellow-800" },
            [Contacts.Status.Order.SHIPPING]: { label: "Shipping", color: "bg-purple-100 text-purple-800" },
            [Contacts.Status.Order.DELIVERED]: { label: "Delivered", color: "bg-green-100 text-green-800" },
            [Contacts.Status.Order.CANCELLED]: { label: "Cancelled", color: "bg-red-100 text-red-800" },
            [Contacts.Status.Order.RETURNED]: { label: "Returned", color: "bg-gray-100 text-gray-800" },
        };
        const config = statusMap[status] || { label: "Unknown", color: "bg-gray-100 text-gray-800" };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const getPaymentStatusBadge = (status: number) => {
        const isPaid = status === Contacts.Status.Payment.PAID;
         return (
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${isPaid ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-orange-50 text-orange-600 border border-orange-200'}`}>
                {isPaid ? "Paid" : "Unpaid"}
            </span>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider">Order ID</th>
                            <th className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider">Customer</th>
                            <th className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider">Total</th>
                            <th className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider">Payment</th>
                            <th className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider">Status</th>
                            <th className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((orderItem, index) => {
                            const order = orderItem as unknown as IOrderExtended; // Cast to local type
                            return (
                            <motion.tr
                                key={order._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
                            >
                                <td className="p-5 font-mono text-sm text-gray-600">
                                    #{order._id.slice(-6).toUpperCase()}
                                    <div className="text-xs text-gray-400 mt-1">
                                        {/* @ts-ignore */}
                                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        }) : ""}
                                    </div>
                                </td>
                                <td className="p-5">
                                    <div className="font-medium text-gray-900">{orderItem.userId?.fullName || order.userName || "Guest"}</div>
                                    <div className="text-sm text-gray-500">{orderItem.userId?.email || order.numberPhone}</div>
                                </td>
                                <td className="p-5 font-bold text-gray-900">
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(order.sumPrice)}
                                </td>
                                <td className="p-5">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm text-gray-700 capitalize">{orderItem.payment?.method || "COD"}</span>
                                        {getPaymentStatusBadge(orderItem.payment?.status)}
                                    </div>
                                </td>
                                <td className="p-5">
                                    <span className={`${getStatusBadge(order.statusOrder).props.className} mb-2 inline-block`}>
                                        {getStatusBadge(order.statusOrder).props.children}
                                    </span>
                                </td>
                                <td className="p-5">
                                    <div className="flex items-center gap-3">
                                        <select
                                            value={order.statusOrder}
                                            onChange={(e) => onStatusChange?.(order._id, Number(e.target.value))}
                                            className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg block p-2 outline-none focus:ring-2 focus:ring-blue-500"
                                            disabled={isLoading}
                                        >
                                            {Object.entries(Contacts.Status.Order).map(([key, value]) => (
                                                <option key={key} value={value}>
                                                    {key}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </td>
                            </motion.tr>
                        )})}
                         {orders.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-gray-400">
                                    No orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

             {/* Pagination */}
             {totalPages > 1 && (
                <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="text-sm text-gray-500">
                     Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                    </div>
                     <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded bg-white border border-gray-300 disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded bg-white border border-gray-300 disabled:opacity-50"
                        >
                            Next
                        </button>
                     </div>
                </div>
             )}
        </div>
    );
};

export default OrderTable;
