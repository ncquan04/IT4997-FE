import { useState, useEffect } from "react";
import { useToast } from "../../../../contexts/ToastContext";
import { fetchBranches } from "../../../../services/api/api.branches";
import { fetchInventoryList } from "../../../../services/api/api.inventory";
import type { IBranch } from "../../../../shared/models/branch-model";
import type { IInventoryItem } from "../../../../types/inventory.types";

const PAGE_SIZE = 20;

export const useInventoryData = () => {
  const { showToast } = useToast();

  const [items, setItems] = useState<IInventoryItem[]>([]);
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const loadInventory = async (page = 1) => {
    setIsLoading(true);
    const response = await fetchInventoryList({
      search: searchKeyword || undefined,
      branchId: selectedBranchId || undefined,
      page,
      limit: PAGE_SIZE,
    });
    setIsLoading(false);
    if (!response) {
      showToast("Failed to load inventory", "error");
      return;
    }
    setItems(response.items ?? []);
    setCurrentPage(response.pagination?.page ?? 1);
    setTotalPages(response.pagination?.totalPages ?? 1);
  };

  useEffect(() => {
    fetchBranches().then(setBranches);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchKeyword(searchInput.trim());
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    loadInventory(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId, searchKeyword]);

  return {
    items,
    branches,
    isLoading,
    currentPage,
    totalPages,
    selectedBranchId,
    setSelectedBranchId,
    searchInput,
    setSearchInput,
    loadInventory,
  };
};
