import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { UserRole } from "../../../../shared/models/user-model";
import type { IBranch } from "../../../../shared/models/branch-model";
import { fetchBranches } from "../../../../services/api/api.branches";
import {
  fetchPayrollList,
  updatePayrollStatus,
  type IPayrollRecord,
} from "../../../../services/api/api.payroll";
import { PayrollStatus } from "../../../../shared/models/payroll-model";
import { useToast } from "../../../../contexts/ToastContext";

export const usePayrollData = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === UserRole.ADMIN;

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [filterBranch, setFilterBranch] = useState("");
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [records, setRecords] = useState<IPayrollRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [branchList, payrollList] = await Promise.all([
      isAdmin ? fetchBranches() : Promise.resolve([]),
      fetchPayrollList({ month, year, branchId: filterBranch || undefined }),
    ]);
    if (isAdmin) setBranches(branchList);
    setRecords(payrollList);
    setIsLoading(false);
  }, [isAdmin, month, year, filterBranch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBulkStatusChange = async (
    fromStatus: PayrollStatus,
    toStatus: PayrollStatus,
  ) => {
    const targets = records.filter((r) => r.status === fromStatus);
    if (targets.length === 0) return;
    setBulkUpdating(true);
    const results = await Promise.all(
      targets.map((r) => updatePayrollStatus(r._id, toStatus)),
    );
    setBulkUpdating(false);
    const succeeded = results.filter(Boolean).length;
    if (succeeded > 0) {
      setRecords((prev) =>
        prev.map((r) => {
          const updated = results.find((res) => res && res._id === r._id);
          return updated ? { ...r, status: updated.status } : r;
        }),
      );
      showToast(`Updated ${succeeded} record(s)`, "success");
    } else {
      showToast("Bulk update failed", "error");
    }
  };

  const handleStatusChange = async (id: string, status: PayrollStatus) => {
    setUpdatingId(id);
    const result = await updatePayrollStatus(id, status);
    setUpdatingId(null);
    if (result) {
      setRecords((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: result.status } : r)),
      );
      showToast("Status updated successfully", "success");
    } else {
      showToast("Update failed", "error");
    }
  };

  const totalActual = records.reduce((sum, r) => sum + r.actualSalary, 0);

  return {
    user,
    isAdmin,
    month,
    setMonth,
    year,
    setYear,
    filterBranch,
    setFilterBranch,
    branches,
    records,
    isLoading,
    updatingId,
    bulkUpdating,
    totalActual,
    loadData,
    handleBulkStatusChange,
    handleStatusChange,
  };
};
