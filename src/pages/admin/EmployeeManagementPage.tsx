import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useEmployeeData } from "./employee/hooks/useEmployeeData";
import { EmployeeFilters } from "./employee/components/EmployeeFilters";
import { EmployeeTable } from "./employee/components/EmployeeTable";
import { EditModal } from "./employee/components/EditModal";
import type { IEmployee } from "../../services/api/api.hr-employee";

const EmployeeManagementPage = () => {
  const {
    isAdmin,
    employees,
    branches,
    isLoading,
    filterBranch, setFilterBranch,
    filterRole, setFilterRole,
    filterActive, setFilterActive,
    search, setSearch,
    updateOne,
  } = useEmployeeData();

  const [editingEmployee, setEditingEmployee] = useState<IEmployee | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Employee Management</h1>

        <EmployeeFilters
          isAdmin={isAdmin}
          search={search}
          filterBranch={filterBranch}
          filterRole={filterRole}
          filterActive={filterActive}
          branches={branches}
          onSearchChange={setSearch}
          onBranchChange={setFilterBranch}
          onRoleChange={setFilterRole}
          onActiveChange={setFilterActive}
        />

        <EmployeeTable
          employees={employees}
          isLoading={isLoading}
          onEdit={setEditingEmployee}
        />
      </div>

      <AnimatePresence>
        {editingEmployee && (
          <EditModal
            employee={editingEmployee}
            branches={branches}
            isAdmin={isAdmin}
            onClose={() => setEditingEmployee(null)}
            onSaved={(updated) => {
              updateOne(updated);
              setEditingEmployee(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeManagementPage;
