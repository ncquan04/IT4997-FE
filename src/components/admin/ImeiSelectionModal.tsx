import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { IOrder } from "../../shared/models/order-model";
import type { IPayment } from "../../shared/models/payment-model";
import { shipOrder } from "../../services/api/api.stock-export";

type OrderWithPayment = IOrder & {
  payment: IPayment;
  userId: { _id: string; email: string; fullName: string; phone: string };
};

interface Props {
  order: OrderWithPayment;
  onClose: () => void;
  onSuccess: () => void;
}

const ImeiSelectionModal: React.FC<Props> = ({ order, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    const ok = await shipOrder(order._id);
    setIsSubmitting(false);
    if (ok === true) {
      onSuccess();
    } else {
      setSubmitError(ok);
    }
  };

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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Confirm Ship</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Order #{order._id.slice(-6).toUpperCase()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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
          <div className="p-6 space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              {order.listProduct.map((item) => (
                <div
                  key={`${item.productId}_${item.variantId}`}
                  className="flex justify-between text-sm"
                >
                  <span className="text-gray-700 truncate">{item.title}</span>
                  <span className="text-gray-500 shrink-0 ml-2">
                    x{item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                {submitError}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Shipping..." : "Confirm & Ship"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImeiSelectionModal;
