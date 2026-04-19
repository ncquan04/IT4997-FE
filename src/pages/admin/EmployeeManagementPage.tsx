import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useEmployeeData } from "./employee/hooks/useEmployeeData";
import { EmployeeFilters } from "./employee/components/EmployeeFilters";
import { EmployeeTable } from "./employee/components/EmployeeTable";
import { EditModal } from "./employee/components/EditModal";
import { CreateModal } from "./employee/components/CreateModal";
import type { IEmployee } from "../../services/api/api.hr-employee";

const EmployeeManagementPage = () => {
  const {
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
  } = useEmployeeData();

  const [editingEmployee, setEditingEmployee] = useState<IEmployee | null>(
    null,
  );
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Employee Management
          </h1>
          {isAdmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-button2 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
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
              Add Employee
            </button>
          )}
        </div>

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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <EmployeeTable
            employees={employees}
            isLoading={isLoading}
            onEdit={setEditingEmployee}
          />
        </div>
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
        {showCreate && (
          <CreateModal
            branches={branches}
            onClose={() => setShowCreate(false)}
            onCreated={(emp) => {
              addOne(emp);
              setShowCreate(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeManagementPage;
