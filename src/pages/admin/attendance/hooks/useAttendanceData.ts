import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { UserRole } from "../../../../shared/models/user-model";
import type { IBranch } from "../../../../shared/models/branch-model";
import { fetchBranches } from "../../../../services/api/api.branches";
import { fetchEmployees, type IEmployee } from "../../../../services/api/api.hr-employee";
import { fetchAttendanceList, type IAttendanceRecord } from "../../../../services/api/api.attendance";

export const useAttendanceData = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [filterBranch, setFilterBranch] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");

  const [branches, setBranches] = useState<IBranch[]>([]);
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [records, setRecords] = useState<IAttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBranchesAndEmployees = useCallback(async () => {
    const [branchList, empList] = await Promise.all([
      isAdmin ? fetchBranches() : Promise.resolve([]),
      fetchEmployees({ branchId: filterBranch || undefined }),
    ]);
    if (isAdmin) setBranches(branchList);
    setEmployees(empList);
  }, [isAdmin, filterBranch]);

  const loadAttendance = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchAttendanceList({
      month,
      year,
      branchId: filterBranch || undefined,
      employeeId: filterEmployee || undefined,
    });
    setRecords(data);
    setIsLoading(false);
  }, [month, year, filterBranch, filterEmployee]);

  useEffect(() => {
    loadBranchesAndEmployees();
  }, [loadBranchesAndEmployees]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  return {
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
    reload: loadAttendance,
  };
};
