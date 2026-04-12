import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../contexts/ToastContext";
import {
  fetchWarrantyById,
  createWarrantyRequest,
} from "../../services/api/api.warranty";
import type { IWarrantyDetail, ICreateWarrantyPayload } from "../../types/warranty.types";
import WarrantyForm from "../../components/admin/WarrantyForm";
import { useWarrantyData } from "./warranty/hooks/useWarrantyData";
import WarrantyFilters from "./warranty/components/WarrantyFilters";
import WarrantyTable from "./warranty/components/WarrantyTable";
import RepairLogHistoryModal from "./warranty/components/RepairLogHistoryModal";
import DetailModal from "./warranty/components/DetailModal";

const WarrantyManagementPage = () => {
  const { showToast } = useToast();
  const {
    isBranchScoped,
    fixedBranchId,
    items,
    branches,
    isLoading,
    currentPage,
    totalPages,
    filterBranch,
    setFilterBranch,
    filterStatus,
    setFilterStatus,
    filterImei,
    setFilterImei,
    loadList,
  } = useWarrantyData();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<IWarrantyDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyImei, setHistoryImei] = useState("");

  const handleOpenHistory = () => {
    if (!filterImei.trim()) return;
    setHistoryImei(filterImei.trim());
    setIsHistoryOpen(true);
  };

  const handleOpenDetail = async (id: string) => {
    setIsDetailOpen(true);
    setSelectedDetail(null);
    setIsDetailLoading(true);
    const detail = await fetchWarrantyById(id);
    setIsDetailLoading(false);
    if (!detail) {
      showToast("Không thể tải chi tiết phiếu bảo hành", "error");
      setIsDetailOpen(false);
      return;
    }
    setSelectedDetail(detail);
  };

  const handleCreate = async (payload: ICreateWarrantyPayload): Promise<boolean> => {
    const ok = await createWarrantyRequest(payload);
    if (!ok) {
      showToast("Tiếp nhận thất bại, kiểm tra lại thông tin", "error");
      return false;
    }
    showToast("Đã tiếp nhận phiếu bảo hành", "success");
    setIsFormOpen(false);
    loadList(1);
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Quản lý Bảo hành
            </h1>
            <p className="text-gray-500 mt-1">
              Tiếp nhận, theo dõi sửa chữa và lịch sử bảo hành thiết bị.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsFormOpen(true)}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-purple-200 transition-all"
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
            Tiếp nhận bảo hành
          </motion.button>
        </div>

        <WarrantyFilters
          isBranchScoped={isBranchScoped}
          branches={branches}
          filterBranch={filterBranch}
          setFilterBranch={setFilterBranch}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterImei={filterImei}
          setFilterImei={setFilterImei}
          onOpenHistory={handleOpenHistory}
        />

        <WarrantyTable
          items={items}
          branches={branches}
          isBranchScoped={isBranchScoped}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          onOpenDetail={handleOpenDetail}
          onPageChange={loadList}
        />
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={(e) => e.target === e.currentTarget && setIsFormOpen(false)}
          >
            <WarrantyForm
              branches={branches}
              fixedBranchId={fixedBranchId}
              onSubmit={handleCreate}
              onCancel={() => setIsFormOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isHistoryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={(e) => e.target === e.currentTarget && setIsHistoryOpen(false)}
          >
            <RepairLogHistoryModal
              imei={historyImei}
              onClose={() => setIsHistoryOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDetailOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={(e) => e.target === e.currentTarget && setIsDetailOpen(false)}
          >
            <DetailModal
              detail={selectedDetail}
              isLoading={isDetailLoading}
              branches={branches}
              onClose={() => setIsDetailOpen(false)}
              onStatusUpdated={() => {
                setIsDetailOpen(false);
                loadList(currentPage);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WarrantyManagementPage;
