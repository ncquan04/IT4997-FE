import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useToast } from "../../../../contexts/ToastContext";
import { UserRole } from "../../../../shared/models/user-model";
import type { IBranch } from "../../../../shared/models/branch-model";
import { fetchBranches } from "../../../../services/api/api.branches";
import { fetchWarrantyList } from "../../../../services/api/api.warranty";
import type {
  IWarrantyListItem,
  IWarrantyListFilters,
} from "../../../../types/warranty.types";
import { PAGE_SIZE } from "../constants";

export const useWarrantyData = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const isBranchScoped =
    user?.role === UserRole.MANAGER || user?.role === UserRole.TECHNICIAN;
  const fixedBranchId = isBranchScoped ? user?.branchId : undefined;

  const [items, setItems] = useState<IWarrantyListItem[]>([]);
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterBranch, setFilterBranch] = useState(fixedBranchId ?? "");
  const [filterStatus, setFilterStatus] = useState<number | "">("");
  const [filterImei, setFilterImei] = useState("");

  const loadList = async (page = 1) => {
    setIsLoading(true);
    const filters: IWarrantyListFilters = { page, limit: PAGE_SIZE };
    if (filterBranch) filters.branchId = filterBranch;
    if (filterStatus !== "") filters.status = filterStatus;
    if (filterImei.trim()) filters.imei = filterImei.trim();

    const res = await fetchWarrantyList(filters);
    setIsLoading(false);

    if (!res) {
      showToast("Không thể tải danh sách bảo hành", "error");
      return;
    }

    setItems(res.data);
    setCurrentPage(res.pagination.page);
    setTotalPages(res.pagination.totalPages);
  };

  useEffect(() => {
    if (user?.role !== UserRole.TECHNICIAN) {
      fetchBranches(true).then(setBranches);
    }
  }, [user?.role]);

  useEffect(() => {
    loadList(1);
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterBranch, filterStatus, filterImei]);

  return {
    user,
    isBranchScoped,
    fixedBranchId,
    items,
    branches,
    isLoading,
    currentPage,
    totalPages,
    filterBranch,
    setFilterBranch,
    filterStatus,
    setFilterStatus,
    filterImei,
    setFilterImei,
    loadList,
  };
};
