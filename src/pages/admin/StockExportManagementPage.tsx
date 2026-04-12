import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../contexts/ToastContext";
import {
  fetchStockExportById,
  createStockExport,
  updateStockExportStatus,
} from "../../services/api/api.stock-export";
import StockExportForm from "../../components/admin/StockExportForm";
import type {
  IStockExportDetail,
  ICreateStockExportPayload,
} from "../../types/stock-export.types";
import { useStockExportData } from "./stock-export/hooks/useStockExportData";
import StockExportFilters from "./stock-export/components/StockExportFilters";
import StockExportTable from "./stock-export/components/StockExportTable";
import DetailModal from "./stock-export/components/DetailModal";

const StockExportManagementPage = () => {
  const { showToast } = useToast();
  const {
    items,
    branches,
    isLoading,
    currentPage,
    totalPages,
    selectedBranchId,
    setSelectedBranchId,
    selectedStatus,
    setSelectedStatus,
    loadList,
    getBranchName,
    getCreatorName,
  } = useStockExportData();

  const [selectedDetail, setSelectedDetail] = useState<IStockExportDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const openDetail = async (id: string) => {
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    const detail = await fetchStockExportById(id);
    setIsDetailLoading(false);
    if (!detail) {
      showToast("Failed to load detail", "error");
      return;
    }
    setSelectedDetail(detail);
  };

  const handleStatusChange = async (id: string, status: number) => {
    setIsUpdatingStatus(true);
    const ok = await updateStockExportStatus(id, { status });
    setIsUpdatingStatus(false);
    if (ok) {
      showToast("Status updated", "success");
      setIsDetailOpen(false);
      loadList(currentPage);
    } else {
      showToast("Failed to update status", "error");
    }
  };

  const handleCreate = async (payload: ICreateStockExportPayload): Promise<boolean> => {
    const ok = await createStockExport(payload);
    if (ok) {
      showToast("Stock export created", "success");
      loadList(1);
    } else {
      showToast("Failed to create stock export", "error");
    }
    return ok;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Stock Export Management
            </h1>
            <p className="text-gray-500 mt-1">
              Manage stock-out records (offline sales, damage, returns...)
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-button2 hover:bg-hoverButton text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-red-200 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Export
          </motion.button>
        </div>

        <StockExportFilters
          branches={branches}
          selectedBranchId={selectedBranchId}
          setSelectedBranchId={setSelectedBranchId}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />

        <StockExportTable
          items={items}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          getBranchName={getBranchName}
          getCreatorName={getCreatorName}
          onOpenDetail={openDetail}
          onPageChange={loadList}
        />
      </div>

      <AnimatePresence>
        {isDetailOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setIsDetailOpen(false); }}
          >
            <DetailModal
              detail={selectedDetail}
              isLoading={isDetailLoading}
              isUpdatingStatus={isUpdatingStatus}
              onClose={() => setIsDetailOpen(false)}
              onStatusChange={handleStatusChange}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <StockExportForm
              branches={branches}
              onSubmit={handleCreate}
              onCancel={() => setIsFormOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StockExportManagementPage;
