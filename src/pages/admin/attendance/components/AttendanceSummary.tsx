import type { IAttendanceRecord } from "../../../../services/api/api.attendance";
import { STATUS_META } from "../constants";

interface AttendanceSummaryProps {
  records: IAttendanceRecord[];
}

export const AttendanceSummary = ({ records }: AttendanceSummaryProps) => {
  const summary = records.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
      {Object.entries(STATUS_META).map(([k, v]) => (
        <div
          key={k}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center"
        >
          <div className="text-2xl font-bold text-gray-800">{summary[k] ?? 0}</div>
          <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${v.color}`}>
            {v.label}
          </div>
        </div>
      ))}
    </div>
  );
};
