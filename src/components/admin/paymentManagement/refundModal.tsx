import type { IOrder } from "../../../shared/models/order-model";
import type { IPayment } from "../../../shared/models/payment-model";
import React, { useMemo, useState } from "react";
import { Input, Textarea } from "./input";
import { RefundImageUpload } from "./refundImage";
import type { IRefundReport } from "../../../types/payment-management.types";

export type RefundModalProps = {
    open: boolean;
    order: IOrder & { payment: IPayment };
    onClose: () => void;
    onSubmit: (data: IRefundReport) => void;
};

export const RefundModal: React.FC<RefundModalProps> = ({ open, order, onClose, onSubmit }) => {
    const [form, setForm] = useState<IRefundReport>({
        orderId: order._id,
        paymentId: order.payment._id,
        amount: order.payment.totalMoney,
        reason: "",
        images: [],
        cusName: "",
        cusMail: "",
        cusPhone: "",
    });

    const disable = useMemo(() => {
        return !form.reason.trim() || !form.cusName || !form.cusMail || !form.cusPhone;
    }, [form]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">Refund Order</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <Input label="Order ID" value={form.orderId} disabled />
                        <Input label="Payment ID" value={form.paymentId} disabled />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <Input label="Refund Amount" value={form.amount} disabled />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <Input
                            label="Customer Name"
                            value={form.cusName}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    cusName: e.target.value,
                                })
                            }
                            required={true}
                        />

                        <Input
                            label="Customer Email"
                            value={form.cusMail}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    cusMail: e.target.value,
                                })
                            }
                            required={true}
                        />
                    </div>

                    <Input
                        label="Customer Phone"
                        value={form.cusPhone}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                cusPhone: e.target.value,
                            })
                        }
                        required={true}
                    />

                    <Textarea
                        label="Refund Reason"
                        required
                        rows={3}
                        value={form.reason}
                        placeholder="Please describe the reason for refund..."
                        onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    />
                    <RefundImageUpload
                        images={form.images}
                        onChange={(images) => setForm({ ...form, images })}
                    />

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-5 border-t">
                        <button
                            onClick={() => onSubmit(form)}
                            disabled={disable}
                            className="
                                px-5 py-2 rounded-md text-sm
                                bg-red-500 text-white
                                hover:bg-red-600
                                disabled:bg-gray-300
                            "
                        >
                            Confirm Refund
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
