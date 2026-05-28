import { useState, useEffect } from "react";
import { useToast } from "../../../../contexts/ToastContext";
import { fetchBranches } from "../../../../services/api/api.branches";
import { fetchStockTransferList } from "../../../../services/api/api.stock-transfer";
import type { IBranch } from "../../../../shared/models/branch-model";
import type {
  IStockTransferListItem,
  IStockTransferListFilters,
} from "../../../../types/stock-transfer.types";
import { PAGE_SIZE } from "../constants";

export const useStockTransferData = () => {
  const { showToast } = useToast();

  const [items, setItems] = useState<IStockTransferListItem[]>([]);
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<number | "">("");
  const [viewOption, setViewOption] = useState<"both" | "from" | "to">("both");

  const loadList = async (page = 1) => {
    setIsLoading(true);
    const filters: IStockTransferListFilters = {
      page,
      limit: PAGE_SIZE,
      branchId: selectedBranchId || undefined,
      status: selectedStatus !== "" ? (selectedStatus as number) : undefined,
      viewOptions: viewOption,
    };
    const response = await fetchStockTransferList(filters);
    setIsLoading(false);
    if (!response) {
      showToast("Failed to load stock transfers", "error");
      return;
    }
    setItems(response.items);
    setTotalPages(response.pagination.totalPages);
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchBranches().then((data) => setBranches((data ?? []) as unknown as IBranch[]));
  }, []);

  useEffect(() => {
    loadList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId, selectedStatus, viewOption]);

  const getBranchName = (branchId: string | { _id: string; name: string }) =>
    typeof branchId === "string"
      ? branchId.slice(-6).toUpperCase()
      : branchId.name;

  const getCreatorName = (
    createdBy?: string | { _id: string; userName: string } | null,
  ) => {
    if (!createdBy) return "System";
    return typeof createdBy === "string"
      ? createdBy.slice(-6).toUpperCase()
      : createdBy.userName;
  };

  return {
    items,
    branches,
    isLoading,
    currentPage,
    totalPages,
    selectedBranchId,
    setSelectedBranchId,
    selectedStatus,
    setSelectedStatus,
    viewOption,
    setViewOption,
    loadList,
    getBranchName,
    getCreatorName,
  };
};
