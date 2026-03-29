import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../contexts/ToastContext";
import type { IDiscountProgram } from "../../shared/models/discount-program-model";
import {
  getAllDiscountPrograms,
  createDiscountProgram,
  updateDiscountProgram,
  deleteDiscountProgram,
} from "../../services/api/api.discount-program";
import DiscountTable from "../../components/admin/DiscountTable";
import DiscountForm, {
  type DiscountFormData,
} from "../../components/admin/DiscountForm";

const DiscountProgramManagementPage = () => {
  const { showToast } = useToast();

  const [programs, setPrograms] = useState<IDiscountProgram[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<IDiscountProgram | null>(
    null,
  );

  const loadPrograms = async () => {
    setIsLoading(true);
    const data = await getAllDiscountPrograms();
    setPrograms(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  const openCreate = () => {
    setEditingProgram(null);
    setIsFormOpen(true);
  };

  const openEdit = (program: IDiscountProgram) => {
    setEditingProgram(program);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: DiscountFormData) => {
    if (editingProgram) {
      const result = await updateDiscountProgram(editingProgram._id, data);
      if (result) {
        showToast("Program updated successfully", "success");
        setIsFormOpen(false);
        loadPrograms();
      } else {
        showToast("Failed to update program", "error");
      }
    } else {
      const result = await createDiscountProgram(data);
      if (result) {
        showToast("Program created successfully", "success");
        setIsFormOpen(false);
        loadPrograms();
      } else {
        showToast("Failed to create program", "error");
      }
    }
  };

  const handleDelete = async (program: IDiscountProgram) => {
    if (!window.confirm(`Delete "${program.name}"?`)) return;
    try {
      await deleteDiscountProgram(program._id);
      showToast("Program deleted", "success");
      loadPrograms();
    } catch {
      showToast("Failed to delete program", "error");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Discount Programs
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage direct price discounts applied automatically to products.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-5 py-2.5 bg-button2 text-white rounded-xl font-medium text-sm hover:bg-hoverButton shadow-sm shadow-red-200 transition-colors"
        >
          + Add Program
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <DiscountTable
          programs={programs}
          isLoading={isLoading}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl"
            >
              <DiscountForm
                key={editingProgram?._id ?? "create"}
                editingProgram={editingProgram}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsFormOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DiscountProgramManagementPage;
