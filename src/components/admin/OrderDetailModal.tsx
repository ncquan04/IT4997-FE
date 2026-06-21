import { motion, AnimatePresence } from "framer-motion";
import type { IOrder } from "../../shared/models/order-model";
import type { IPayment } from "../../shared/models/payment-model";
import { Contacts } from "../../shared/contacts";

type OrderWithExtra = IOrder & {
  payment?: IPayment;
  userId?: { _id: string; email: string; fullName: string; phone: string };
};

interface Props {
  order: OrderWithExtra;
  onClose: () => void;
}

const O = Contacts.Status.Order;

const STATUS_META: Record<number, { label: string; color: string }> = {
  [O.ORDERED]: { label: "Ordered", color: "bg-blue-100 text-blue-800" },
  [O.PROCESSING]: { label: "Processing", color: "bg-yellow-100 text-yellow-800" },
  [O.SHIPPING]: { label: "Shipping", color: "bg-purple-100 text-purple-800" },
  [O.DELIVERED]: { label: "Delivered", color: "bg-green-100 text-green-800" },
  [O.CANCELLED]: { label: "Cancelled", color: "bg-red-100 text-red-800" },
  [O.RETURNED]: { label: "Returned", color: "bg-gray-100 text-gray-800" },
};

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n || 0,
  );

const formatDate = (d?: string) =>
  d
    ? new Date(d).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const OrderDetailModal: React.FC<Props> = ({ order, onClose }) => {
  // Gộp danh sách IMEI đã bán theo từng (sản phẩm, biến thể)
  const imeiByVariant = new Map<string, string[]>();
  (order.imeiAssignments ?? []).forEach((a) => {
    const key = `${a.productId}_${a.variantId}`;
    const existing = imeiByVariant.get(key) ?? [];
    imeiByVariant.set(key, existing.concat(a.imeiList ?? []));
  });

  const status = STATUS_META[order.statusOrder] ?? {
    label: "Unknown",
    color: "bg-gray-100 text-gray-800",
  };
  const isPaid = order.payment?.status === Contacts.Status.Payment.PAID;
  // @ts-ignore createdAt được backend trả về kèm theo
  const createdAt: string | undefined = order.createdAt;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">
                  Order #{order._id.slice(-6).toUpperCase()}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                >
                  {status.label}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Đặt lúc {formatDate(createdAt)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Khách hàng & giao hàng */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Khách hàng
                </h3>
                <p className="font-medium text-gray-900">
                  {order.userId?.fullName || order.userName || "Khách vãng lai"}
                </p>
                {order.userId?.email && (
                  <p className="text-sm text-gray-500">{order.userId.email}</p>
                )}
                <p className="text-sm text-gray-500">
                  {order.numberPhone || order.userId?.phone || "—"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Giao hàng
                </h3>
                <p className="text-sm text-gray-700">
                  {order.toAddress || "—"}
                </p>
                {order.branch?.name && (
                  <p className="text-sm text-gray-500 mt-1">
                    Chi nhánh xử lý:{" "}
                    <span className="font-medium text-gray-700">
                      {order.branch.name}
                    </span>
                  </p>
                )}
                {order.note && (
                  <p className="text-sm text-gray-500 mt-1 italic">
                    Ghi chú: {order.note}
                  </p>
                )}
              </div>
            </div>

            {/* Danh sách sản phẩm + IMEI */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Sản phẩm ({order.listProduct?.length ?? 0})
              </h3>
              <div className="space-y-3">
                {order.listProduct?.map((item) => {
                  const imeis =
                    imeiByVariant.get(`${item.productId}_${item.variantId}`) ??
                    (item.imeiOrSerial ? [item.imeiOrSerial] : []);
                  return (
                    <div
                      key={`${item.productId}_${item.variantId}`}
                      className="border border-gray-100 rounded-xl p-3"
                    >
                      <div className="flex gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-14 h-14 rounded-lg object-cover bg-gray-100 shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {item.title}
                          </p>
                          {item.variantName && (
                            <p className="text-xs text-gray-500">
                              {item.variantName}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 mt-0.5">
                            {formatVND(item.price)} × {item.quantity}
                          </p>
                        </div>
                        <div className="text-right font-semibold text-gray-900 shrink-0">
                          {formatVND(item.totalMoney)}
                        </div>
                      </div>

                      {/* IMEI đã bán */}
                      <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                        <p className="text-xs font-semibold text-gray-400 mb-1.5">
                          IMEI/Serial đã bán
                        </p>
                        {imeis.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {imeis.map((imei) => (
                              <span
                                key={imei}
                                className="font-mono text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 rounded px-2 py-0.5"
                              >
                                {imei}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">
                            Chưa gán IMEI (đơn chưa xuất kho)
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Thanh toán */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Thanh toán
              </h3>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 capitalize">
                  Phương thức: {order.payment?.method || "COD"}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    isPaid
                      ? "bg-green-50 text-green-600 border border-green-200"
                      : "bg-orange-50 text-orange-600 border border-orange-200"
                  }`}
                >
                  {isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                </span>
              </div>
              {order.payment?.couponDiscount ? (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Giảm mã {order.payment.couponCode}</span>
                  <span>-{formatVND(order.payment.couponDiscount)}</span>
                </div>
              ) : null}
              {order.payment?.pointsDiscount ? (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Đổi điểm ({order.payment.pointsRedeemed} điểm)</span>
                  <span>-{formatVND(order.payment.pointsDiscount)}</span>
                </div>
              ) : null}
              {order.payment?.memberDiscount ? (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Chiết khấu thành viên</span>
                  <span>-{formatVND(order.payment.memberDiscount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between font-bold text-gray-900 mt-2 pt-2 border-t border-gray-200">
                <span>Tổng cộng</span>
                <span>
                  {formatVND(order.payment?.totalMoney ?? order.sumPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderDetailModal;
