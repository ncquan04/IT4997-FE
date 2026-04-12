import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../contexts/ToastContext";
import {
  fetchStockImportById,
  createStockImport,
  updateStockImportStatus,
} from "../../services/api/api.stock-import";
import { fetchProductById } from "../../services/api/api.products";
import { SearchProducts } from "../../services/api/api.search";
import StockImportForm from "../../components/admin/StockImportForm";
import type {
  IStockImportDetail,
  ICreateStockImportPayload,
  IStockImportProductSearchOption,
} from "../../types/stock-import.types";
import { useStockImportData } from "./stock-import/hooks/useStockImportData";
import StockImportFilters from "./stock-import/components/StockImportFilters";
import StockImportTable from "./stock-import/components/StockImportTable";
import DetailModal from "./stock-import/components/DetailModal";

const StockImportManagementPage = () => {
  const { showToast } = useToast();
  const {
    items,
    branches,
    suppliers,
    isLoading,
    currentPage,
    totalPages,
    selectedBranchId,
    setSelectedBranchId,
    selectedStatus,
    setSelectedStatus,
    searchId,
    setSearchId,
    loadList,
    getBranchDisplay,
    getCreatorDisplay,
    getSupplierDisplay,
  } = useStockImportData();

  const [selectedDetail, setSelectedDetail] = useState<IStockImportDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenDetail = async (id: string) => {
    setIsDetailOpen(true);
    setSelectedDetail(null);
    setIsDetailLoading(true);
    const detail = await fetchStockImportById(id);
    setIsDetailLoading(false);
    if (!detail) {
      showToast("Failed to load stock import detail", "error");
      setIsDetailOpen(false);
      return;
    }
    setSelectedDetail(detail);
  };

  const handleUpdateStatus = async (status: number) => {
    if (!selectedDetail) return;
    setIsUpdatingStatus(true);
    const success = await updateStockImportStatus(selectedDetail._id, { status });
    setIsUpdatingStatus(false);
    if (!success) {
      showToast("Failed to update status", "error");
      return;
    }
    showToast("Status updated successfully", "success");
    setIsDetailOpen(false);
    loadList(currentPage);
  };

  const searchProductsForStockImport = async (
    keyword: string,
  ): Promise<IStockImportProductSearchOption[]> => {
    const trimmed = keyword.trim();
    if (trimmed.length < 2) return [];
    const response = await SearchProducts({ userInput: trimmed, page: 1 });
    if (!response) return [];
    const deduped = new Map<string, IStockImportProductSearchOption>();
    response.products.forEach((p) => {
      deduped.set(p._id, {
        productId: p._id,
        title: p.title,
        skuHints: (p.variants ?? [])
          .map((v) => v.sku)
          .filter((s): s is string => Boolean(s))
          .slice(0, 3),
      });
    });
    return Array.from(deduped.values());
  };

  const handleCreateStockImport = async (
    payload: ICreateStockImportPayload,
  ): Promise<boolean> => {
    const success = await createStockImport(payload);
    if (!success) {
      showToast("Failed to create stock import", "error");
      return false;
    }
    showToast("Stock import created successfully", "success");
    loadList(1);
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Stock Import Management
            </h1>
            <p className="text-gray-500 mt-1">
              View and manage warehouse stock import receipts.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsFormOpen(true)}
            className="flex items-center justify-center gap-2 bg-button2 hover:bg-hoverButton text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-red-200 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Stock Import
          </motion.button>
        </div>

        <StockImportFilters
          branches={branches}
          selectedBranchId={selectedBranchId}
          setSelectedBranchId={setSelectedBranchId}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          searchId={searchId}
          setSearchId={setSearchId}
        />

        <StockImportTable
          items={items}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          searchId={searchId}
          getBranchDisplay={getBranchDisplay}
          getCreatorDisplay={getCreatorDisplay}
          getSupplierDisplay={getSupplierDisplay}
          onOpenDetail={handleOpenDetail}
          onPageChange={loadList}
        />
      </div>

      {/* Detail Modal */}
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
              onUpdateStatus={handleUpdateStatus}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 overflow-y-auto"
          >
            <div className="min-h-screen flex items-start justify-center p-4 pt-10 pb-10">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl"
              >
                <StockImportForm
                  branches={branches}
                  suppliers={suppliers}
                  onSearchProducts={searchProductsForStockImport}
                  onLoadProductDetail={fetchProductById}
                  onSubmit={async (payload) => {
                    const result = await handleCreateStockImport(payload);
                    if (result) setIsFormOpen(false);
                    return result;
                  }}
                  onCancel={() => setIsFormOpen(false)}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StockImportManagementPage;
