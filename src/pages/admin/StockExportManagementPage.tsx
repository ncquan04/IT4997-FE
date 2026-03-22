import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchBranches } from "../../services/api/api.branches";
import {
  createStockExport,
  fetchStockExportById,
  fetchStockExportList,
  updateStockExportStatus,
} from "../../services/api/api.stock-export";
import StockExportForm from "../../components/admin/StockExportForm";
import { useToast } from "../../contexts/ToastContext";
import { Contacts } from "../../shared/contacts";
import type { IBranch } from "../../shared/models/branch-model";
import type {
  ICreateStockExportPayload,
  IStockExportDetail,
  IStockExportListFilters,
  IStockExportListItem,
  ExportReason,
} from "../../types/stock-export.types";

const STATUS_STOCK = Contacts.Status.Stock;

const STATUS_META: Record<number, { label: string; color: string }> = {
  [STATUS_STOCK.PENDING]: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
  },
  [STATUS_STOCK.COMPLETED]: {
    label: "Completed",
    color: "bg-green-100 text-green-800",
  },
  [STATUS_STOCK.CANCELLED]: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
  },
};

const ALLOWED_TRANSITIONS: Record<number, number[]> = {
  [STATUS_STOCK.PENDING]: [STATUS_STOCK.COMPLETED, STATUS_STOCK.CANCELLED],
};

const REASON_LABELS: Record<ExportReason, string> = {
  SALE: "Offline Sale",
  RETURN_TO_SUPPLIER: "Return to Supplier",
  DAMAGED: "Damaged",
  OTHER: "Other",
};

const REASON_COLORS: Record<ExportReason, string> = {
  SALE: "bg-blue-100 text-blue-800",
  RETURN_TO_SUPPLIER: "bg-purple-100 text-purple-800",
  DAMAGED: "bg-red-100 text-red-800",
  OTHER: "bg-gray-100 text-gray-700",
};

const PAGE_SIZE = 20;

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const StockExportManagementPage = () => {
  const { showToast } = useToast();

  const [items, setItems] = useState<IStockExportListItem[]>([]);
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<number | "">("");

  // Detail modal
  const [selectedDetail, setSelectedDetail] =
    useState<IStockExportDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Create form
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadList = async (page = 1) => {
    setIsLoading(true);
    const filters: IStockExportListFilters = {
      page,
      limit: PAGE_SIZE,
      branchId: selectedBranchId || undefined,
      status: selectedStatus !== "" ? (selectedStatus as number) : undefined,
    };
    const response = await fetchStockExportList(filters);
    setIsLoading(false);
    if (!response) {
      showToast("Failed to load stock exports", "error");
      return;
    }
    setItems(response.items);
    setTotalPages(response.pagination.totalPages);
    setCurrentPage(page);
  };

  useEffect(() => {
    loadList(1);
  }, [selectedBranchId, selectedStatus]);

  useEffect(() => {
    fetchBranches().then((data) => setBranches(data ?? []));
  }, []);

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

  const handleCreate = async (
    payload: ICreateStockExportPayload,
  ): Promise<boolean> => {
    const ok = await createStockExport(payload);
    if (ok) {
      showToast("Stock export created", "success");
      loadList(1);
    } else {
      showToast("Failed to create stock export", "error");
    }
    return ok;
  };

  const branchName = (branchId: string | { _id: string; name: string }) =>
    typeof branchId === "string"
      ? branchId.slice(-6).toUpperCase()
      : branchId.name;

  const creatorName = (
    createdBy: string | { _id: string; userName: string },
  ) =>
    typeof createdBy === "string"
      ? createdBy.slice(-6).toUpperCase()
      : createdBy.userName;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Stock Export Management
            </h1>
            <p className="text-gray-500 mt-1">
              Manage stock-out records (offline sales, damage, returns…)
            </p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors shadow-sm"
          >
            + New Export
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_META).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[
                    "Export ID",
                    "Branch",
                    "Reason",
                    "Items",
                    "Created By",
                    "Status",
                    "Date",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="p-4 font-semibold text-gray-500 text-xs uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-gray-400">
                      No stock exports found.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <motion.tr
                      key={item._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.03 }}
                      className="border-b border-gray-100 hover:bg-orange-50/30 transition-colors"
                    >
                      <td className="p-4 font-mono text-sm text-gray-600">
                        #{item._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="p-4 text-sm text-gray-800">
                        {branchName(item.branchId)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${REASON_COLORS[item.reason] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {REASON_LABELS[item.reason] ?? item.reason}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-700">
                        {item.items.length} item(s)
                      </td>
                      <td className="p-4 text-sm text-gray-700">
                        {creatorName(item.createdBy)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_META[item.status]?.color ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {STATUS_META[item.status]?.label ?? item.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => openDetail(item._id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50/50">
              <span className="text-sm text-gray-500">
                Page <b>{currentPage}</b> of <b>{totalPages}</b>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => loadList(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-white border border-gray-300 disabled:opacity-50 text-sm"
                >
                  Prev
                </button>
                <button
                  onClick={() => loadList(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded bg-white border border-gray-300 disabled:opacity-50 text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {isDetailOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsDetailOpen(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
                <h2 className="text-xl font-bold text-gray-900">
                  Stock Export Detail
                </h2>
                <button
                  onClick={() => setIsDetailOpen(false)}
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

              {/* Modal body */}
              <div className="flex-1 overflow-y-auto p-6">
                {isDetailLoading ? (
                  <div className="flex items-center justify-center py-20 text-gray-400">
                    Loading...
                  </div>
                ) : selectedDetail ? (
                  <div className="space-y-6">
                    {/* Summary cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-400 mb-1.5">Status</p>
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-sm font-semibold ${STATUS_META[selectedDetail.status]?.color ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {STATUS_META[selectedDetail.status]?.label ??
                            selectedDetail.status}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-400 mb-1.5">Reason</p>
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-sm font-semibold ${REASON_COLORS[selectedDetail.reason] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {REASON_LABELS[selectedDetail.reason] ??
                            selectedDetail.reason}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-400 mb-1.5">Branch</p>
                        <p className="text-sm font-medium text-gray-800">
                          {selectedDetail.branchId?.name ?? "—"}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-400 mb-1.5">
                          Created By
                        </p>
                        <p className="text-sm font-medium text-gray-800">
                          {selectedDetail.createdBy?.userName ?? "—"}
                        </p>
                      </div>
                    </div>

                    {selectedDetail.orderId && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                        Linked Order:{" "}
                        <span className="font-mono font-semibold">
                          #
                          {String(selectedDetail.orderId)
                            .slice(-8)
                            .toUpperCase()}
                        </span>
                      </div>
                    )}

                    {selectedDetail.note && (
                      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
                        <span className="font-semibold">Note:</span>{" "}
                        {selectedDetail.note}
                      </div>
                    )}

                    {/* Items */}
                    <div>
                      <h3 className="text-base font-semibold text-gray-800 mb-3">
                        Items ({selectedDetail.items.length})
                      </h3>
                      <div className="space-y-3">
                        {selectedDetail.items.map((item, idx) => {
                          const product =
                            typeof item.productId === "string"
                              ? null
                              : item.productId;
                          const variantName = product
                            ? product.variants.find(
                                (v) => v._id === String(item.variantId),
                              )?.variantName
                            : null;
                          return (
                            <div
                              key={idx}
                              className="rounded-xl border border-gray-100 p-4 bg-gray-50/50"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">
                                    {product?.title ?? String(item.productId)}
                                  </p>
                                  {variantName && (
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {variantName}
                                    </p>
                                  )}
                                </div>
                                <span className="text-sm font-semibold text-gray-700">
                                  Qty: {item.quantity}
                                </span>
                              </div>
                              {item.imeiList.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {item.imeiList.map((imei) => (
                                    <span
                                      key={imei}
                                      className="font-mono text-xs bg-white border border-gray-200 rounded px-2 py-0.5 text-gray-600"
                                    >
                                      {imei}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Status actions */}
                    {(ALLOWED_TRANSITIONS[selectedDetail.status] ?? []).length >
                      0 && (
                      <div className="flex gap-3 pt-2">
                        {(ALLOWED_TRANSITIONS[selectedDetail.status] ?? []).map(
                          (nextStatus) => {
                            const meta = STATUS_META[nextStatus];
                            const isComplete =
                              nextStatus === STATUS_STOCK.COMPLETED;
                            return (
                              <button
                                key={nextStatus}
                                onClick={() =>
                                  handleStatusChange(
                                    selectedDetail._id,
                                    nextStatus,
                                  )
                                }
                                disabled={isUpdatingStatus}
                                className={`px-5 py-2 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50
                                ${isComplete ? "bg-green-500 hover:bg-green-600 text-white" : "bg-red-100 hover:bg-red-200 text-red-700"}`}
                              >
                                {isUpdatingStatus
                                  ? "Updating..."
                                  : `Mark as ${meta?.label}`}
                              </button>
                            );
                          },
                        )}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </motion.div>
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
