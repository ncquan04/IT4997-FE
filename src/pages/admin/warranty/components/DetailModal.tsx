import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "../../../../contexts/ToastContext";
import { fetchRepairLogs, updateWarrantyStatus } from "../../../../services/api/api.warranty";
import type { IWarrantyDetail, IRepairLogItem } from "../../../../types/warranty.types";
import type { IBranch } from "../../../../shared/models/branch-model";
import {
  STATUS_META,
  TRANSITIONS,
  formatDate,
  formatDateTime,
  getPopulatedName,
} from "../constants";
import AddRepairLogForm from "./AddRepairLogForm";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        (id) => branches.find((b) => b._id === id)?.name ?? `...${id.slice(-6)}`,
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
            <h2 className="text-lg font-bold text-gray-800">Chi tiết phiếu bảo hành</h2>
            {detail && (
              <p className="text-xs text-gray-400 font-mono mt-0.5">{detail._id}</p>
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
        <div className="flex items-center justify-center py-20 text-gray-400">Đang tải...</div>
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
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "IMEI / Serial", value: detail.imeiOrSerial },
                    { label: "Chi nhánh", value: branchName },
                    { label: "Khách hàng", value: customerName },
                    { label: "Sản phẩm", value: productTitle },
                    { label: "Tiếp nhận bởi", value: techName },
                    { label: "Ngày tiếp nhận", value: formatDate(detail.createdAt) },
                    { label: "Ngày dự kiến trả", value: formatDate(detail.estimatedDate) },
                    { label: "Ngày hoàn thành", value: formatDate(detail.completedDate) },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">{label}</p>
                      <p className="text-sm font-medium text-gray-800 break-all">{value || "—"}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Mô tả lỗi</p>
                    <p className="text-sm text-gray-800">{detail.issueDescription}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Tình trạng vật lý</p>
                    <p className="text-sm text-gray-800">{detail.physicalCondition}</p>
                  </div>
                </div>

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
                <AddRepairLogForm warrantyId={detail._id} onSuccess={loadLogs} />

                {isLogsLoading ? (
                  <p className="text-sm text-gray-400 text-center py-6">Đang tải nhật ký...</p>
                ) : repairLogs.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">Chưa có nhật ký sửa chữa.</p>
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
                            <p className="text-sm font-semibold text-gray-800">{log.action}</p>
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
                          {log.replacedParts && log.replacedParts.length > 0 && (
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

export default DetailModal;
