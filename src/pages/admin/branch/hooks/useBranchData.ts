import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useToast } from "../../../../contexts/ToastContext";
import { UserRole } from "../../../../shared/models/user-model";
import type { IBranchPopulated } from "../../../../shared/models/branch-model";
import {
  fetchBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  addRentHistory,
  type BranchFormData,
  type RentHistoryPayload,
} from "../../../../services/api/api.branches";
import {
  fetchEmployees,
  type IEmployee,
} from "../../../../services/api/api.hr-employee";

export const useBranchData = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === UserRole.ADMIN;

  const [branches, setBranches] = useState<IBranchPopulated[]>([]);
  const [managers, setManagers] = useState<IEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<IBranchPopulated | null>(
    null,
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [branchData, managerData] = await Promise.all([
      fetchBranches(),
      fetchEmployees({ role: UserRole.MANAGER }),
    ]);
    setBranches(branchData);
    setManagers(managerData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setEditingBranch(null);
    setIsFormOpen(true);
  };

  const openEdit = (branch: IBranchPopulated) => {
    setEditingBranch(branch);
    setIsFormOpen(true);
  };

  const closeForm = () => setIsFormOpen(false);

  const handleFormSubmit = async (data: BranchFormData) => {
    if (editingBranch) {
      const result = await updateBranch(editingBranch._id, data);
      if (result) {
        showToast("Branch updated successfully", "success");
        closeForm();
        loadData();
      } else {
        showToast("Failed to update branch", "error");
      }
    } else {
      const result = await createBranch(data);
      if (result) {
        showToast("Branch created successfully", "success");
        closeForm();
        loadData();
      } else {
        showToast("Failed to create branch", "error");
      }
    }
  };

  const handleDelete = async (branch: IBranchPopulated) => {
    if (
      !window.confirm(
        `Delete branch "${branch.name}"? This action cannot be undone.`,
      )
    )
      return;
    const ok = await deleteBranch(branch._id);
    if (ok) {
      showToast("Branch deleted", "success");
      loadData();
    } else {
      showToast("Failed to delete branch", "error");
    }
  };

  const handleAddRentHistory = async (data: RentHistoryPayload) => {
    if (!editingBranch) return;
    const result = await addRentHistory(editingBranch._id, data);
    if (result) {
      showToast("Rent history entry added", "success");
      // Refresh editingBranch in-place so history panel updates without closing modal
      const updated = await fetchBranches();
      const refreshed = updated.find((b) => b._id === editingBranch._id);
      if (refreshed) setEditingBranch(refreshed);
      setBranches(updated);
    } else {
      showToast("Failed to add rent history", "error");
    }
  };

  return {
    isAdmin,
    branches,
    managers,
    isLoading,
    isFormOpen,
    editingBranch,
    openCreate,
    openEdit,
    closeForm,
    handleFormSubmit,
    handleDelete,
    handleAddRentHistory,
  };
};
