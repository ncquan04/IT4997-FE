import { useState, useEffect } from "react";
import { useToast } from "../../../../contexts/ToastContext";
import { fetchBranches } from "../../../../services/api/api.branches";
import { fetchSuppliers } from "../../../../services/api/api.suppliers";
import {
  fetchStockImportList,
} from "../../../../services/api/api.stock-import";
import type { IBranch } from "../../../../shared/models/branch-model";
import type { ISupplier } from "../../../../shared/models/supplier-model";
import type {
  IStockImportListItem,
  IStockImportListFilters,
} from "../../../../types/stock-import.types";
import { PAGE_SIZE } from "../constants";

export const useStockImportData = () => {
  const { showToast } = useToast();

  const [items, setItems] = useState<IStockImportListItem[]>([]);
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<number | "">("");
  const [searchId, setSearchId] = useState("");

  const loadList = async (page = 1) => {
    setIsLoading(true);
    const filters: IStockImportListFilters = {
      page,
      limit: PAGE_SIZE,
      branchId: selectedBranchId || undefined,
      status: selectedStatus !== "" ? (selectedStatus as number) : undefined,
    };
    const response = await fetchStockImportList(filters);
    setIsLoading(false);
    if (!response) {
      showToast("Failed to load stock imports", "error");
      return;
    }
    setItems(response.items ?? []);
    setCurrentPage(response.pagination.page);
    setTotalPages(response.pagination.totalPages);
  };

  useEffect(() => {
    fetchBranches().then(setBranches);
    fetchSuppliers().then(setSuppliers);
  }, []);

  useEffect(() => {
    loadList(1);
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId, selectedStatus]);

  const getBranchDisplay = (item: IStockImportListItem): string => {
    const b = item.branchId as unknown as { _id: string; name: string } | string;
    if (typeof b === "object" && b?.name) return b.name;
    return (
      branches.find((br) => br._id === String(b))?.name ??
      `...${String(b).slice(-6)}`
    );
  };

  const getCreatorDisplay = (item: IStockImportListItem): string => {
    if (!item.createdBy) return "—";
    const c = item.createdBy as unknown as { _id: string; userName: string } | string;
    if (typeof c === "object" && c !== null && c?.userName) return c.userName;
    if (typeof c === "string" && c) return `...${c.slice(-6)}`;
    return "—";
  };

  const getSupplierDisplay = (item: IStockImportListItem): string => {
    return (
      suppliers.find((s) => s._id === item.supplierId)?.name ??
      `...${String(item.supplierId).slice(-6)}`
    );
  };

  return {
    items,
    branches,
    suppliers,
    isLoading,
    currentPage,
    totalPages,
    selectedBranchId,
    setSelectedBranchId,
    selectedStatus,
    setSelectedStatus,
    searchId,
    setSearchId,
    loadList,
    getBranchDisplay,
    getCreatorDisplay,
    getSupplierDisplay,
  };
};
