import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchBranches } from "../../services/api/api.branches";
import { fetchSuppliers } from "../../services/api/api.suppliers";
import {
  createStockImport,
  fetchStockImportById,
  fetchStockImportList,
  updateStockImportStatus,
} from "../../services/api/api.stock-import";
import { fetchProductById } from "../../services/api/api.products";
import { SearchProducts } from "../../services/api/api.search";
import StockImportForm from "../../components/admin/StockImportForm";
import { useToast } from "../../contexts/ToastContext";
import { Contacts } from "../../shared/contacts";
import type { IBranch } from "../../shared/models/branch-model";
import type { ISupplier } from "../../shared/models/supplier-model";
import type {
  ICreateStockImportPayload,
  IStockImportDetail,
  IStockImportListFilters,
  IStockImportListItem,
  IStockImportProductSearchOption,
} from "../../types/stock-import.types";

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

const PAGE_SIZE = 20;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const StockImportManagementPage = () => {
  const { showToast } = useToast();

  // List state
  const [items, setItems] = useState<IStockImportListItem[]>([]);
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<number | "">("");
  const [searchId, setSearchId] = useState("");

  // Detail modal
  const [selectedDetail, setSelectedDetail] =
    useState<IStockImportDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Create form
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadList = async (page = 1) => {
    setIsLoading(true);
    const filters: IStockImportListFilters = {
      page,
      limit: PAGE_SIZE,
      branchId: selectedBranchId || undefined,
      status: selectedStatus !== "" ? (selectedStatus as number) : undefined,
    };
    const response = await fetchStockImportList(filters);
    setIsLoading(false);

    if (!response) {
      showToast("Failed to load stock imports", "error");
      return;
    }

    setItems(response.items ?? []);
    setCurrentPage(response.pagination.page);
    setTotalPages(response.pagination.totalPages);
  };

  useEffect(() => {
    fetchBranches().then(setBranches);
    fetchSuppliers().then(setSuppliers);
  }, []);

  useEffect(() => {
    loadList(1);
    setCurrentPage(1);
  }, [selectedBranchId, selectedStatus]);

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
    const success = await updateStockImportStatus(selectedDetail._id, {
      status,
    });
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

  // Helpers to display name from populated or raw id
  const getBranchDisplay = (item: IStockImportListItem): string => {
    const b = item.branchId as unknown as
      | { _id: string; name: string }
      | string;
    if (typeof b === "object" && b?.name) return b.name;
    return (
      branches.find((br) => br._id === String(b))?.name ??
      `...${String(b).slice(-6)}`
    );
  };

  const getCreatorDisplay = (item: IStockImportListItem): string => {
    if (!item.createdBy) return "—";
    const c = item.createdBy as unknown as
      | { _id: string; userName: string }
      | string;
    if (typeof c === "object" && c !== null && c?.userName) return c.userName;
    if (typeof c === "string" && c) return `...${c.slice(-6)}`;
    return "—";
  };

  const getSupplierDisplay = (item: IStockImportListItem): string => {
    return (
      suppliers.find((s) => s._id === item.supplierId)?.name ??
      `...${String(item.supplierId).slice(-6)}`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
            Create Stock Import
          </motion.button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Search by ID
              </label>
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="ID"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Branch
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <option value="">All Branches</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <option value="">All Statuses</option>
                <option value={STATUS_STOCK.PENDING}>Pending</option>
                <option value={STATUS_STOCK.COMPLETED}>Completed</option>
                <option value={STATUS_STOCK.CANCELLED}>Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              Loading...
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
              <span>No stock imports found.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: "900px" }}>
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                    <th className="px-4 py-3 text-left whitespace-nowrap">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left">Branch</th>
                    <th className="px-4 py-3 text-left">Supplier</th>
                    <th className="px-4 py-3 text-center">Items</th>
                    <th className="px-4 py-3 text-right">Total Cost</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-left">Created By</th>
                    <th className="px-4 py-3 text-left">Created At</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items
                    .filter((item) =>
                      searchId.trim()
                        ? item._id
                            .toLowerCase()
                            .includes(searchId.trim().toLowerCase())
                        : true,
                    )
                    .map((item) => {
                      const statusMeta = STATUS_META[item.status] ?? {
                        label: String(item.status),
                        color: "bg-gray-100 text-gray-700",
                      };
                      return (
                        <tr
                          key={item._id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">
                            {item._id}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {getBranchDisplay(item)}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {getSupplierDisplay(item)}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600">
                            {item.items?.length ?? 0}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-800">
                            {formatCurrency(item.totalCost)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusMeta.color}`}
                            >
                              {statusMeta.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {getCreatorDisplay(item)}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {formatDate(item.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleOpenDetail(item._id)}
                              title="View detail"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition-colors"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 py-4 border-t border-gray-100">
              <button
                disabled={currentPage <= 1}
                onClick={() => loadList(currentPage - 1)}
                className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => loadList(currentPage + 1)}
                className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[92vh] flex flex-col"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
                <h2 className="text-xl font-bold text-gray-900">
                  Stock Import Detail
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
                        <p className="text-sm text-gray-400 mb-1.5">
                          Total Cost
                        </p>
                        <p className="font-bold text-gray-900 text-base">
                          {formatCurrency(selectedDetail.totalCost)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-400 mb-1.5">
                          SKU Lines
                        </p>
                        <p className="font-bold text-gray-900 text-base">
                          {selectedDetail.items.length}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-400 mb-1.5">
                          Total Units
                        </p>
                        <p className="font-bold text-gray-900 text-base">
                          {selectedDetail.items.reduce(
                            (s, i) => s + i.quantity,
                            0,
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Detail info grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {/* Branch */}
                      <div className="border border-gray-100 rounded-xl p-4 space-y-1.5">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Branch
                        </p>
                        <p className="font-semibold text-gray-800 text-base">
                          {selectedDetail.branchId?.name ?? "—"}
                        </p>
                        {selectedDetail.branchId?.address && (
                          <p className="text-gray-500 text-sm">
                            {selectedDetail.branchId.address}
                          </p>
                        )}
                        {selectedDetail.branchId?.phone && (
                          <p className="text-gray-500 text-sm">
                            {selectedDetail.branchId.phone}
                          </p>
                        )}
                      </div>

                      {/* Supplier */}
                      <div className="border border-gray-100 rounded-xl p-4 space-y-1.5">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Supplier
                        </p>
                        <p className="font-semibold text-gray-800 text-base">
                          {selectedDetail.supplierId?.name ?? "—"}
                        </p>
                        {selectedDetail.supplierId?.contactPerson && (
                          <p className="text-gray-500 text-sm">
                            Contact: {selectedDetail.supplierId.contactPerson}
                          </p>
                        )}
                        {selectedDetail.supplierId?.phone && (
                          <p className="text-gray-500 text-sm">
                            {selectedDetail.supplierId.phone}
                          </p>
                        )}
                        {selectedDetail.supplierId?.email && (
                          <p className="text-gray-500 text-sm">
                            {selectedDetail.supplierId.email}
                          </p>
                        )}
                      </div>

                      {/* Created by */}
                      <div className="border border-gray-100 rounded-xl p-4 space-y-1.5">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Created By
                        </p>
                        <p className="font-semibold text-gray-800 text-base">
                          {selectedDetail.createdBy?.userName ?? "—"}
                        </p>
                        {selectedDetail.createdBy?.email && (
                          <p className="text-gray-500 text-sm">
                            {selectedDetail.createdBy.email}
                          </p>
                        )}
                        {selectedDetail.createdBy?.role && (
                          <p className="text-gray-500 text-sm capitalize">
                            {selectedDetail.createdBy.role}
                          </p>
                        )}
                      </div>

                      {/* Timestamps + note */}
                      <div className="border border-gray-100 rounded-xl p-4 space-y-1.5">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Info
                        </p>
                        <p className="text-gray-600 text-sm">
                          <span className="text-gray-400">Created: </span>
                          {formatDate(selectedDetail.createdAt)}
                        </p>
                        <p className="text-gray-600 text-sm">
                          <span className="text-gray-400">Updated: </span>
                          {formatDate(selectedDetail.updatedAt)}
                        </p>
                        <p className="text-gray-600 text-xs font-mono break-all">
                          <span className="text-gray-400">ID: </span>
                          {selectedDetail._id}
                        </p>
                        {selectedDetail.note && (
                          <p className="text-gray-600 text-sm pt-1.5 border-t border-gray-100 mt-1">
                            <span className="text-gray-400">Note: </span>
                            {selectedDetail.note}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Items table */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">
                        Items ({selectedDetail.items.length})
                      </h3>
                      <div className="rounded-xl border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                <th className="px-4 py-2.5 text-left">
                                  Product
                                </th>
                                <th className="px-4 py-2.5 text-left">
                                  Variant
                                </th>
                                <th className="px-4 py-2.5 text-center">Qty</th>
                                <th className="px-4 py-2.5 text-right">
                                  Unit Cost
                                </th>
                                <th className="px-4 py-2.5 text-right">
                                  Line Total
                                </th>
                                <th className="px-4 py-2.5 text-center">
                                  IMEIs
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {selectedDetail.items.map((it, idx) => {
                                const prod =
                                  typeof it.productId === "object"
                                    ? it.productId
                                    : null;
                                const productTitle =
                                  prod?.title ?? String(it.productId);
                                const productId =
                                  prod?._id ?? String(it.productId);
                                const variantName =
                                  prod?.variants?.find(
                                    (v) => v._id === String(it.variantId),
                                  )?.variantName ?? null;

                                return (
                                  <tr
                                    key={idx}
                                    className="hover:bg-gray-50/50 transition-colors"
                                  >
                                    <td className="px-4 py-3">
                                      <p className="font-medium text-gray-800 text-sm">
                                        {productTitle}
                                      </p>
                                      <p className="font-mono text-gray-400 text-xs mt-0.5 break-all">
                                        {productId}
                                      </p>
                                    </td>
                                    <td className="px-4 py-3">
                                      {variantName && (
                                        <p className="font-medium text-gray-800 text-sm">
                                          {variantName}
                                        </p>
                                      )}
                                      <p className="font-mono text-gray-400 text-xs mt-0.5 break-all">
                                        {String(it.variantId)}
                                      </p>
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm">
                                      {it.quantity}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm">
                                      {formatCurrency(it.unitCost)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-sm">
                                      {formatCurrency(
                                        it.quantity * it.unitCost,
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm">
                                      {it.imeiList?.length ?? 0}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Status actions */}
                    {(ALLOWED_TRANSITIONS[selectedDetail.status] ?? []).length >
                      0 && (
                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                          Update Status
                        </p>
                        <div className="flex gap-3 flex-wrap">
                          {(
                            ALLOWED_TRANSITIONS[selectedDetail.status] ?? []
                          ).map((nextStatus) => {
                            const meta = STATUS_META[nextStatus];
                            const isCancelled =
                              nextStatus === STATUS_STOCK.CANCELLED;
                            const isCompleted =
                              nextStatus === STATUS_STOCK.COMPLETED;

                            // icon per action
                            const icon = isCancelled ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                              </svg>
                            ) : isCompleted ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="9 11 12 14 22 4" />
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                              </svg>
                            );

                            const btnClass = [
                              "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shadow-sm",
                              isCancelled
                                ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 hover:shadow-red-100 hover:shadow-md"
                                : isCompleted
                                  ? "bg-green-500 text-white hover:bg-green-600 shadow-green-200 hover:shadow-md"
                                  : "bg-blue-500 text-white hover:bg-blue-600 shadow-blue-200 hover:shadow-md",
                            ].join(" ");

                            return (
                              <motion.button
                                key={nextStatus}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                disabled={isUpdatingStatus}
                                onClick={() => handleUpdateStatus(nextStatus)}
                                className={btnClass}
                              >
                                {isUpdatingStatus ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="animate-spin"
                                  >
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                  </svg>
                                ) : (
                                  icon
                                )}
                                {isUpdatingStatus
                                  ? "Updating..."
                                  : `Mark as ${meta?.label ?? nextStatus}`}
                              </motion.button>
                            );
                          })}
                        </div>
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
