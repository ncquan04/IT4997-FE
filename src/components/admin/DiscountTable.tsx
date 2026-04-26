import { motion, AnimatePresence } from "framer-motion";
import type { IDiscountProgram } from "../../shared/models/discount-program-model";

interface DiscountTableProps {
  programs: IDiscountProgram[];
  isLoading: boolean;
  onEdit: (program: IDiscountProgram) => void;
  onDelete: (program: IDiscountProgram) => void;
}

const now = () => Date.now();

const statusLabel = (p: IDiscountProgram) => {
  if (!p.isActive) return "inactive";
  const t = now();
  if (t < p.startAt) return "scheduled";
  if (t > p.endAt) return "expired";
  return "active";
};

const STATUS_STYLE: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  scheduled: "bg-blue-100 text-blue-700",
  expired: "bg-gray-100 text-gray-500",
  inactive: "bg-gray-100 text-gray-400",
};

const fmtDate = (ts: number) =>
  new Date(ts).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const fmtValue = (p: IDiscountProgram) =>
  p.type === "percent" ? `${p.value}%` : `${p.value.toLocaleString()}đ`;

const DiscountTable = ({
  programs,
  isLoading,
  onEdit,
  onDelete,
}: DiscountTableProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-500">
        <div className="w-12 h-12 border-4 border-button2 border-t-transparent rounded-full animate-spin mb-4" />
        Loading programs...
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-400">
        <p className="text-lg font-medium">No discount programs yet</p>
        <p className="text-sm mt-1">Click "Add Program" to create one.</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Mobile card list (< md) ── */}
      <div className="block md:hidden divide-y divide-gray-100">
        <AnimatePresence>
          {programs.map((p, i) => {
            const status = statusLabel(p);
            return (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: i * 0.04 }}
                className="p-4 space-y-2"
              >
                {/* Name + status */}
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-gray-800 text-sm line-clamp-2">
                    {p.name}
                  </span>
                  <span
                    className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLE[status]}`}
                  >
                    {status}
                  </span>
                </div>

                {/* Type + value + cap */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      p.type === "percent"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {p.type === "percent" ? "Percent" : "Fixed"}
                  </span>
                  <span className="font-medium text-gray-800 text-sm">
                    {fmtValue(p)}
                  </span>
                  {p.maxDiscount > 0 && (
                    <span className="text-xs text-gray-500">
                      Cap: {p.maxDiscount.toLocaleString()}đ
                    </span>
                  )}
                </div>

                {/* Scope + period */}
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 items-center text-xs text-gray-500">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-semibold capitalize ${
                      p.scope === "product"
                        ? "bg-sky-100 text-sky-700"
                        : p.scope === "category"
                          ? "bg-teal-100 text-teal-700"
                          : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {p.scope}
                  </span>
                  <span>
                    {p.scope === "all"
                      ? "All products"
                      : `${p.applicableIds.length} ${p.scope}(s)`}
                  </span>
                  <span>
                    {fmtDate(p.startAt)} → {fmtDate(p.endAt)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => onEdit(p)}
                    title="Edit"
                    className="p-1.5 rounded-lg text-button2 hover:bg-red-50 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(p)}
                    title="Delete"
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-red-500 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── Desktop table (≥ md) ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {[
                "Name",
                "Type",
                "Value",
                "Max Cap",
                "Scope",
                "Applies to",
                "Period",
                "Status",
              ].map((col) => (
                <th
                  key={col}
                  className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
              <th className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {programs.map((p, i) => {
                const status = statusLabel(p);
                return (
                  <motion.tr
                    key={p._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-gray-50 hover:bg-gray-50/50 group"
                  >
                    <td className="p-5 font-semibold text-gray-800 text-sm max-w-45 truncate">
                      {p.name}
                    </td>
                    <td className="p-5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          p.type === "percent"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {p.type === "percent" ? "Percent" : "Fixed"}
                      </span>
                    </td>
                    <td className="p-5 text-sm text-gray-700 font-medium">
                      {fmtValue(p)}
                    </td>
                    <td className="p-5 text-sm text-gray-600">
                      {p.maxDiscount > 0
                        ? `${p.maxDiscount.toLocaleString()}đ`
                        : "—"}
                    </td>
                    <td className="p-5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          p.scope === "product"
                            ? "bg-sky-100 text-sky-700"
                            : p.scope === "category"
                              ? "bg-teal-100 text-teal-700"
                              : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {p.scope}
                      </span>
                    </td>
                    <td className="p-5 text-sm text-gray-600">
                      {p.scope === "all"
                        ? "All products"
                        : `${p.applicableIds.length} ${p.scope}(s)`}
                    </td>
                    <td className="p-5 text-xs text-gray-500 whitespace-nowrap">
                      {fmtDate(p.startAt)} → {fmtDate(p.endAt)}
                    </td>
                    <td className="p-5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLE[status]}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(p)}
                          title="Edit"
                          className="p-1.5 rounded-lg text-button2 hover:bg-red-50 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete(p)}
                          title="Delete"
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-red-500 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default DiscountTable;
