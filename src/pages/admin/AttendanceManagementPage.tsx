import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useAttendanceData } from "./attendance/hooks/useAttendanceData";
import { AttendanceFilters } from "./attendance/components/AttendanceFilters";
import { AttendanceSummary } from "./attendance/components/AttendanceSummary";
import { AttendanceTable } from "./attendance/components/AttendanceTable";
import { UpsertModal } from "./attendance/components/UpsertModal";
import type { IAttendanceRecord } from "../../services/api/api.attendance";

const AttendanceManagementPage = () => {
  const {
    user,
    isAdmin,
    month, setMonth,
    year, setYear,
    filterBranch, setFilterBranch,
    filterEmployee, setFilterEmployee,
    branches,
    employees,
    records,
    isLoading,
    reload,
  } = useAttendanceData();

  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<IAttendanceRecord | undefined>(undefined);

  const branchIdForModal = filterBranch || user?.branchId || "";

  const handleEdit = (record: IAttendanceRecord) => {
    setEditingRecord(record);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Attendance Tracking</h1>
          <button
            onClick={() => {
              setEditingRecord(undefined);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-button2 text-white rounded-lg text-sm hover:opacity-90"
          >
            + Add Record
          </button>
        </div>

        <AttendanceFilters
          isAdmin={isAdmin}
          month={month}
          year={year}
          filterBranch={filterBranch}
          filterEmployee={filterEmployee}
          branches={branches}
          employees={employees}
          onMonthChange={setMonth}
          onYearChange={setYear}
          onBranchChange={setFilterBranch}
          onEmployeeChange={setFilterEmployee}
        />

        <AttendanceSummary records={records} />

        <AttendanceTable
          records={records}
          isLoading={isLoading}
          onEdit={handleEdit}
        />
      </div>

      <AnimatePresence>
        {showModal && (
          <UpsertModal
            record={editingRecord}
            employees={employees}
            branchId={branchIdForModal}
            onClose={() => setShowModal(false)}
            onSaved={() => {
              setShowModal(false);
              reload();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttendanceManagementPage;
