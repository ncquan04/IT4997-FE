import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { UserRole } from "../../../../shared/models/user-model";
import type { IBranch } from "../../../../shared/models/branch-model";
import { fetchBranches } from "../../../../services/api/api.branches";
import {
  fetchEmployees,
  type IEmployee,
} from "../../../../services/api/api.hr-employee";

export const useEmployeeData = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;

  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filterBranch, setFilterBranch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterActive, setFilterActive] = useState<"" | "true" | "false">("");
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [empList, branchList] = await Promise.all([
      fetchEmployees({
        branchId: filterBranch || undefined,
        role: filterRole || undefined,
        isActive: filterActive !== "" ? filterActive === "true" : undefined,
        search: search || undefined,
      }),
      isAdmin ? fetchBranches() : Promise.resolve([]),
    ]);
    setEmployees(empList);
    if (isAdmin) setBranches(branchList as unknown as IBranch[]);
    setIsLoading(false);
  }, [filterBranch, filterRole, filterActive, search, isAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateOne = (updated: IEmployee) => {
    setEmployees((prev) =>
      prev.map((e) => (e._id === updated._id ? updated : e)),
    );
  };

  const addOne = (emp: IEmployee) => {
    setEmployees((prev) => [emp, ...prev]);
  };

  return {
    isAdmin,
    employees,
    branches,
    isLoading,
    filterBranch,
    setFilterBranch,
    filterRole,
    setFilterRole,
    filterActive,
    setFilterActive,
    search,
    setSearch,
    updateOne,
    addOne,
  };
};
