import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../contexts/ToastContext";
import {
  createStockTransfer,
  fetchStockTransferById,
  updateStockTransferStatus,
} from "../../services/api/api.stock-transfer";
import type {
  IStockTransferDetail,
  ICreateStockTransferPayload,
} from "../../types/stock-transfer.types";
import { useStockTransferData } from "./stock-transfer/hooks/useStockTransferData";
import StockTransferFilters from "./stock-transfer/components/StockTransferFilters";
import StockTransferTable from "./stock-transfer/components/StockTransferTable";
import StockTransferDetailModal from "./stock-transfer/components/StockTransferDetailModal";
import CreateStockTransferModal from "./stock-transfer/components/CreateStockTransferModal";

const StockTransferManagementPage = () => {
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
    viewOption,
    setViewOption,
    loadList,
    getBranchName,
    getCreatorName,
  } = useStockTransferData();

  const [selectedDetail, setSelectedDetail] = useState<IStockTransferDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const openDetail = async (id: string) => {
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    const detail = await fetchStockTransferById(id);
    setIsDetailLoading(false);
    if (!detail) {
      showToast("Failed to load transfer detail", "error");
      return;
    }
    setSelectedDetail(detail);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedDetail(null);
  };

  const handleStatusChange = async (id: string, status: number) => {
    setIsUpdatingStatus(true);
    const ok = await updateStockTransferStatus(id, { status });
    setIsUpdatingStatus(false);
    if (ok) {
      showToast("Status updated", "success");
      closeDetail();
      loadList(currentPage);
    } else {
      showToast("Failed to update status", "error");
    }
  };

  const handleCreate = async (
    payload: ICreateStockTransferPayload,
  ): Promise<boolean> => {
    const ok = await createStockTransfer(payload);
    if (ok) {
      showToast("Stock transfer created", "success");
      loadList(1);
    } else {
      showToast("Failed to create stock transfer", "error");
    }
    return ok;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Stock Transfer Management
            </h1>
            <p className="text-gray-500 mt-1">
              Move inventory between branches and track in-transit stock.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Transfer
          </motion.button>
        </div>

        <StockTransferFilters
          branches={branches}
          selectedBranchId={selectedBranchId}
          setSelectedBranchId={setSelectedBranchId}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          viewOption={viewOption}
          setViewOption={setViewOption}
        />

        <StockTransferTable
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
            onClick={(e) => {
              if (e.target === e.currentTarget) closeDetail();
            }}
          >
            <StockTransferDetailModal
              detail={selectedDetail}
              isLoading={isDetailLoading}
              isUpdatingStatus={isUpdatingStatus}
              onClose={closeDetail}
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
            <CreateStockTransferModal
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

export default StockTransferManagementPage;
