import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Contacts } from "../../shared/contacts";
import { UserRole } from "../../shared/models/user-model";
import type { IBranch } from "../../shared/models/branch-model";
import { fetchBranches } from "../../services/api/api.branches";
import {
  fetchWarrantyList,
  fetchWarrantyById,
  createWarrantyRequest,
  updateWarrantyStatus,
  fetchRepairLogs,
  addRepairLog,
} from "../../services/api/api.warranty";
import type {
  IWarrantyListItem,
  IWarrantyDetail,
  IWarrantyListFilters,
  IRepairLogItem,
  ICreateWarrantyPayload,
  ICreateRepairLogPayload,
} from "../../types/warranty.types";
import WarrantyForm from "../../components/admin/WarrantyForm";

const SW = Contacts.Status.Warranty;

const STATUS_META: Record<number, { label: string; color: string }> = {
  [SW.RECEIVED]: { label: "Đã tiếp nhận", color: "bg-blue-100 text-blue-800" },
  [SW.DIAGNOSING]: {
    label: "Đang chẩn đoán",
    color: "bg-indigo-100 text-indigo-800",
  },
  [SW.REPAIRING]: {
    label: "Đang sửa chữa",
    color: "bg-yellow-100 text-yellow-800",
  },
  [SW.WAITING_PARTS]: {
    label: "Chờ linh kiện",
    color: "bg-orange-100 text-orange-800",
  },
  [SW.COMPLETED]: { label: "Hoàn thành", color: "bg-green-100 text-green-800" },
  [SW.RETURNED]: { label: "Đã trả khách", color: "bg-gray-100 text-gray-600" },
};

const TRANSITIONS: Record<number, number[]> = {
  [SW.RECEIVED]: [SW.DIAGNOSING],
  [SW.DIAGNOSING]: [SW.REPAIRING, SW.WAITING_PARTS, SW.COMPLETED],
  [SW.REPAIRING]: [SW.WAITING_PARTS, SW.COMPLETED],
  [SW.WAITING_PARTS]: [SW.REPAIRING, SW.COMPLETED],
  [SW.COMPLETED]: [SW.RETURNED],
  [SW.RETURNED]: [],
};

const PAGE_SIZE = 20;

const formatDate = (value?: string | number) => {
  if (value === undefined || value === null || value === "") return "—";
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (iso?: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const getPopulatedName = (
  field: unknown,
  fallback: (id: string) => string,
): string => {
  if (typeof field === "object" && field !== null) {
    const obj = field as Record<string, unknown>;
    if (typeof obj.name === "string") return obj.name;
    if (typeof obj.userName === "string") return obj.userName;
    if (typeof obj._id === "string") return fallback(obj._id);
  }
  if (typeof field === "string") return fallback(field);
  return "—";
};

// ─── Repair Log Add Form ────────────────────────────────────────────────────

interface AddRepairLogFormProps {
  warrantyId: string;
  onSuccess: () => void;
}

const AddRepairLogForm = ({ warrantyId, onSuccess }: AddRepairLogFormProps) => {
  const { showToast } = useToast();
  const [action, setAction] = useState("");
  const [note, setNote] = useState("");
  const [cost, setCost] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!action.trim()) return;
    setIsSaving(true);

    const payload: ICreateRepairLogPayload = {
      action: action.trim(),
      replacedParts: [],
    };
    if (note.trim()) payload.note = note.trim();
    if (cost && !isNaN(Number(cost))) payload.cost = Number(cost);

    const ok = await addRepairLog(warrantyId, payload);
    setIsSaving(false);

    if (!ok) {
      showToast("Không thể thêm nhật ký", "error");
      return;
    }

    setAction("");
    setNote("");
    setCost("");
    showToast("Đã thêm nhật ký sửa chữa", "success");
    onSuccess();
  };

  const fieldClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-purple-50 rounded-xl p-4 space-y-3"
    >
      <p className="text-xs font-bold text-purple-700 uppercase tracking-wide">
        Thêm nhật ký sửa chữa
      </p>
      <input
        value={action}
        onChange={(e) => setAction(e.target.value)}
        placeholder="Mô tả hành động *"
        className={fieldClass}
        required
      />
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Ghi chú (tuỳ chọn)"
        className={fieldClass}
      />
      <input
        type="number"
        value={cost}
        onChange={(e) => setCost(e.target.value)}
        placeholder="Chi phí (VND)"
        className={fieldClass}
        min={0}
      />
      <button
        type="submit"
        disabled={isSaving || !action.trim()}
        className="w-full py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
      >
        {isSaving ? "Đang lưu..." : "Thêm nhật ký"}
      </button>
    </form>
  );
};

// ─── Detail Modal ───────────────────────────────────────────────────────────

interface DetailModalProps {
  detail: IWarrantyDetail | null;
  isLoading: boolean;
  branches: IBranch[];
  onClose: () => void;
  onStatusUpdated: () => void;
}

const DetailModal = ({
  detail,
  isLoading,
  branches,
  onClose,
  onStatusUpdated,
}: DetailModalProps) => {
  const { showToast } = useToast();
  const [tab, setTab] = useState<"info" | "logs">("info");
  const [repairLogs, setRepairLogs] = useState<IRepairLogItem[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadLogs = async () => {
    if (!detail) return;
    setIsLogsLoading(true);
    const res = await fetchRepairLogs(detail._id);
    setIsLogsLoading(false);
    setRepairLogs(res?.data ?? []);
  };

  useEffect(() => {
    if (tab === "logs" && detail) loadLogs();
  }, [tab, detail]);

  const handleUpdateStatus = async (status: number) => {
    if (!detail) return;
    setIsUpdating(true);
    const ok = await updateWarrantyStatus(detail._id, { status });
    setIsUpdating(false);
    if (!ok) {
      showToast("Cập nhật trạng thái thất bại", "error");
      return;
    }
    showToast("Đã cập nhật trạng thái", "success");
    onStatusUpdated();
  };

  const currentMeta = detail ? STATUS_META[detail.status] : null;
  const nextStatuses = detail ? (TRANSITIONS[detail.status] ?? []) : [];
  const branchName = detail
    ? getPopulatedName(
        detail.branchId,
        (id) =>
          branches.find((b) => b._id === id)?.name ?? `...${id.slice(-6)}`,
      )
    : "—";

  const customerName = detail
    ? getPopulatedName(detail.customerId, (id) => `...${id.slice(-6)}`)
    : "—";

  const productTitle = detail
    ? (() => {
        if (typeof detail.productId === "object" && detail.productId !== null) {
          return (detail.productId as any).title ?? "—";
        }
        return typeof detail.productId === "string"
          ? `...${detail.productId.slice(-6)}`
          : "—";
      })()
    : "—";

  const techName = detail?.receivedBy
    ? getPopulatedName(detail.receivedBy, (id) => `...${id.slice(-6)}`)
    : "—";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]"
    >
      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Chi tiết phiếu bảo hành
            </h2>
            {detail && (
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                {detail._id}
              </p>
            )}
          </div>
          {currentMeta && (
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${currentMeta.color}`}
            >
              {currentMeta.label}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
        >
          ✕
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          Đang tải...
        </div>
      ) : detail ? (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-100 px-6 shrink-0">
            {(["info", "logs"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                  tab === t
                    ? "border-purple-500 text-purple-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t === "info" ? "Thông tin" : "Nhật ký sửa chữa"}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {tab === "info" && (
              <div className="space-y-5">
                {/* Basic info grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "IMEI / Serial", value: detail.imeiOrSerial },
                    { label: "Chi nhánh", value: branchName },
                    { label: "Khách hàng", value: customerName },
                    { label: "Sản phẩm", value: productTitle },
                    { label: "Tiếp nhận bởi", value: techName },
                    {
                      label: "Ngày tiếp nhận",
                      value: formatDate(detail.createdAt),
                    },
                    {
                      label: "Ngày dự kiến trả",
                      value: formatDate(detail.estimatedDate),
                    },
                    {
                      label: "Ngày hoàn thành",
                      value: formatDate(detail.completedDate),
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">{label}</p>
                      <p className="text-sm font-medium text-gray-800 break-all">
                        {value || "—"}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Descriptions */}
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Mô tả lỗi</p>
                    <p className="text-sm text-gray-800">
                      {detail.issueDescription}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">
                      Tình trạng vật lý
                    </p>
                    <p className="text-sm text-gray-800">
                      {detail.physicalCondition}
                    </p>
                  </div>
                </div>

                {/* Status transitions */}
                {nextStatuses.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                      Chuyển trạng thái
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {nextStatuses.map((s) => {
                        const meta = STATUS_META[s];
                        return (
                          <button
                            key={s}
                            onClick={() => handleUpdateStatus(s)}
                            disabled={isUpdating}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all disabled:opacity-50 hover:shadow-sm ${meta.color} border-current`}
                          >
                            → {meta.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {nextStatuses.length === 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-500">
                      Phiếu đã ở trạng thái cuối — không thể chuyển tiếp.
                    </p>
                  </div>
                )}
              </div>
            )}

            {tab === "logs" && (
              <div className="space-y-4">
                <AddRepairLogForm
                  warrantyId={detail._id}
                  onSuccess={loadLogs}
                />

                {isLogsLoading ? (
                  <p className="text-sm text-gray-400 text-center py-6">
                    Đang tải nhật ký...
                  </p>
                ) : repairLogs.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">
                    Chưa có nhật ký sửa chữa.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {repairLogs.map((log) => {
                      const tName = getPopulatedName(
                        log.technicianId,
                        (id) => `...${id.slice(-6)}`,
                      );
                      return (
                        <li
                          key={log._id}
                          className="bg-gray-50 rounded-xl p-4 flex flex-col gap-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-gray-800">
                              {log.action}
                            </p>
                            <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                              {formatDateTime(log.createdAt)}
                            </span>
                          </div>
                          {log.note && (
                            <p className="text-sm text-gray-600">{log.note}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>KTV: {tName}</span>
                            {log.cost !== undefined && log.cost > 0 && (
                              <span className="font-medium text-gray-700">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(log.cost)}
                              </span>
                            )}
                          </div>
                          {log.replacedParts &&
                            log.replacedParts.length > 0 && (
                              <p className="text-xs text-gray-500">
                                Linh kiện: {log.replacedParts.join(", ")}
                              </p>
                            )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center py-20 text-gray-400">
          Không tải được dữ liệu
        </div>
      )}
    </motion.div>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────────

const WarrantyManagementPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const isBranchScoped =
    user?.role === UserRole.MANAGER || user?.role === UserRole.TECHNICIAN;
  const fixedBranchId = isBranchScoped ? user?.branchId : undefined;

  // ── List state ──────────────────────────────────────────────────────────
  const [items, setItems] = useState<IWarrantyListItem[]>([]);
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ── Filters ─────────────────────────────────────────────────────────────
  const [filterBranch, setFilterBranch] = useState(fixedBranchId ?? "");
  const [filterStatus, setFilterStatus] = useState<number | "">("");
  const [filterImei, setFilterImei] = useState("");

  // ── Create form ─────────────────────────────────────────────────────────
  const [isFormOpen, setIsFormOpen] = useState(false);

  // ── Detail modal ────────────────────────────────────────────────────────
  const [selectedDetail, setSelectedDetail] = useState<IWarrantyDetail | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // ── Load ────────────────────────────────────────────────────────────────
  const loadList = async (page = 1) => {
    setIsLoading(true);
    const filters: IWarrantyListFilters = {
      page,
      limit: PAGE_SIZE,
    };
    if (filterBranch) filters.branchId = filterBranch;
    if (filterStatus !== "") filters.status = filterStatus;
    if (filterImei.trim()) filters.imei = filterImei.trim();

    const res = await fetchWarrantyList(filters);
    setIsLoading(false);

    if (!res) {
      showToast("Không thể tải danh sách bảo hành", "error");
      return;
    }

    setItems(res.data);
    setCurrentPage(res.pagination.page);
    setTotalPages(res.pagination.totalPages);
  };

  useEffect(() => {
    if (user?.role !== UserRole.TECHNICIAN) {
      fetchBranches(true).then(setBranches);
    }
  }, [user?.role]);

  useEffect(() => {
    loadList(1);
    setCurrentPage(1);
  }, [filterBranch, filterStatus, filterImei]);

  // ── Handlers ────────────────────────────────────────────────────────────
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

  const handleCreate = async (
    payload: ICreateWarrantyPayload,
  ): Promise<boolean> => {
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

  // ── Display helpers ──────────────────────────────────────────────────────
  const getItemBranch = (item: IWarrantyListItem) =>
    getPopulatedName(
      item.branchId,
      (id) => branches.find((b) => b._id === id)?.name ?? `...${id.slice(-6)}`,
    );

  const getItemCustomer = (item: IWarrantyListItem) =>
    getPopulatedName(item.customerId, (id) => `...${id.slice(-6)}`);

  const getItemProduct = (item: IWarrantyListItem) => {
    if (typeof item.productId === "object" && item.productId !== null) {
      return (item.productId as any).title ?? "—";
    }
    return typeof item.productId === "string"
      ? `...${item.productId.slice(-6)}`
      : "—";
  };

  const selectClass =
    "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200";

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* ── Header ── */}
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

        {/* ── Filters ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Branch filter — ADMIN only */}
            {!isBranchScoped && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Chi nhánh
                </label>
                <select
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Tất cả chi nhánh</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Trạng thái
              </label>
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className={selectClass}
              >
                <option value="">Tất cả</option>
                {Object.entries(STATUS_META).map(([code, meta]) => (
                  <option key={code} value={code}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={isBranchScoped ? "md:col-span-2" : ""}>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Tìm IMEI / Serial
              </label>
              <input
                type="text"
                value={filterImei}
                onChange={(e) => setFilterImei(e.target.value)}
                placeholder="Nhập IMEI hoặc Serial Number..."
                className={selectClass}
              />
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              Đang tải...
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Không có phiếu bảo hành nào.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: "860px" }}>
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                    <th className="px-4 py-3 text-left">IMEI / Serial</th>
                    <th className="px-4 py-3 text-left">Khách hàng</th>
                    <th className="px-4 py-3 text-left">Sản phẩm</th>
                    {!isBranchScoped && (
                      <th className="px-4 py-3 text-left">Chi nhánh</th>
                    )}
                    <th className="px-4 py-3 text-center">Trạng thái</th>
                    <th className="px-4 py-3 text-left">Ngày tiếp nhận</th>
                    <th className="px-4 py-3 text-center">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((item) => {
                    const meta = STATUS_META[item.status] ?? {
                      label: String(item.status),
                      color: "bg-gray-100 text-gray-600",
                    };
                    return (
                      <tr
                        key={item._id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-gray-700">
                          {item.imeiOrSerial}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {getItemCustomer(item)}
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-50 truncate">
                          {getItemProduct(item)}
                        </td>
                        {!isBranchScoped && (
                          <td className="px-4 py-3 text-gray-600">
                            {getItemBranch(item)}
                          </td>
                        )}
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${meta.color}`}
                          >
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleOpenDetail(item._id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                            title="Xem chi tiết"
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
                Trước
              </button>
              <span className="text-sm text-gray-600">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => loadList(currentPage + 1)}
                className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Create Form Modal ── */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={(e) =>
              e.target === e.currentTarget && setIsFormOpen(false)
            }
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

      {/* ── Detail Modal ── */}
      <AnimatePresence>
        {isDetailOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={(e) =>
              e.target === e.currentTarget && setIsDetailOpen(false)
            }
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
