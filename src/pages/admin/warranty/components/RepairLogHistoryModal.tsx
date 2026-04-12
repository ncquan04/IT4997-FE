import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fetchRepairLogHistory } from "../../../../services/api/api.warranty";
import type { IRepairLogHistoryItem } from "../../../../types/warranty.types";
import { formatDate, formatDateTime, getPopulatedName } from "../constants";

interface RepairLogHistoryModalProps {
  imei: string;
  onClose: () => void;
}

const RepairLogHistoryModal = ({
  imei,
  onClose,
}: RepairLogHistoryModalProps) => {
  const [logs, setLogs] = useState<IRepairLogHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchRepairLogHistory(imei).then((res) => {
      setLogs(res?.data ?? []);
      setIsLoading(false);
    });
  }, [imei]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh]"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Lịch sử sửa chữa</h2>
          <p className="text-xs text-gray-400 font-mono mt-0.5">{imei}</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {isLoading ? (
          <p className="text-sm text-gray-400 text-center py-10">Đang tải...</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">
            Không tìm thấy lịch sử sửa chữa cho IMEI/Serial này.
          </p>
        ) : (
          <ol className="relative border-l-2 border-purple-100 space-y-6 ml-2">
            {logs.map((log) => {
              const tName = getPopulatedName(
                log.technicianId,
                (id) => `...${id.slice(-6)}`,
              );
              const wr =
                typeof log.warrantyRequestId === "object"
                  ? log.warrantyRequestId
                  : null;
              const branchName = wr?.branchId
                ? typeof wr.branchId === "object"
                  ? (wr.branchId as any).name
                  : String(wr.branchId).slice(-6)
                : "";
              const warrantyDate = wr?.createdAt
                ? formatDate(wr.createdAt)
                : "";
              return (
                <li key={log._id} className="ml-4">
                  <span className="absolute -left-[9px] mt-1 w-4 h-4 rounded-full bg-purple-500 border-2 border-white" />
                  <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-1.5">
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
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span>KTV: {tName}</span>
                      {log.cost > 0 && (
                        <span className="font-medium text-gray-700">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(log.cost)}
                        </span>
                      )}
                      {branchName && (
                        <span className="text-purple-600">{branchName}</span>
                      )}
                      {warrantyDate && <span>Phiếu: {warrantyDate}</span>}
                    </div>
                    {log.replacedParts && log.replacedParts.length > 0 && (
                      <p className="text-xs text-gray-500">
                        Linh kiện: {log.replacedParts.join(", ")}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </motion.div>
  );
};

export default RepairLogHistoryModal;
