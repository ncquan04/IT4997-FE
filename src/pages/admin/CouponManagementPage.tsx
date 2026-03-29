import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../contexts/ToastContext";
import type { ICoupon } from "../../shared/models/coupon-model";
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../../services/api/api.coupon";
import CouponTable from "../../components/admin/CouponTable";
import CouponForm, {
  type CouponFormData,
} from "../../components/admin/CouponForm";

const CouponManagementPage = () => {
  const { showToast } = useToast();

  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<ICoupon | null>(null);

  const loadCoupons = async () => {
    setIsLoading(true);
    const data = await getAllCoupons();
    setCoupons(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const openCreate = () => {
    setEditingCoupon(null);
    setIsFormOpen(true);
  };

  const openEdit = (coupon: ICoupon) => {
    setEditingCoupon(coupon);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: CouponFormData) => {
    if (editingCoupon) {
      const result = await updateCoupon(editingCoupon._id, data);
      if (result) {
        showToast("Coupon updated successfully", "success");
        setIsFormOpen(false);
        loadCoupons();
      } else {
        showToast("Failed to update coupon", "error");
      }
    } else {
      const result = await createCoupon(data);
      if (result) {
        showToast("Coupon created successfully", "success");
        setIsFormOpen(false);
        loadCoupons();
      } else {
        showToast("Failed to create coupon", "error");
      }
    }
  };

  const handleDelete = async (coupon: ICoupon) => {
    if (!window.confirm(`Delete coupon "${coupon.code}"?`)) return;
    const ok = await deleteCoupon(coupon._id);
    if (ok) {
      showToast("Coupon deleted", "success");
      loadCoupons();
    } else {
      showToast("Failed to delete coupon", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Coupon Management
            </h1>
            <p className="text-gray-500 mt-1">
              Create and manage discount coupons for your store.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCreate}
            className="flex items-center justify-center gap-2 bg-button2 hover:bg-hoverButton text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-red-200 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Coupon
          </motion.button>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <CouponTable
            coupons={coupons}
            isLoading={isLoading}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        </motion.div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <CouponForm
                key={editingCoupon?._id ?? "create"}
                editingCoupon={editingCoupon}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsFormOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CouponManagementPage;
