import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import InventoryTable from "../../components/admin/InventoryTable";
import { fetchBranches } from "../../services/api/api.branches";
import { fetchInventoryList } from "../../services/api/api.inventory";
import type { IBranch } from "../../shared/models/branch-model";
import type { IInventoryItem } from "../../types/inventory.types";
import { useToast } from "../../contexts/ToastContext";

const PAGE_SIZE = 20;

const InventoryManagementPage = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState<IInventoryItem[]>([]);
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const loadBranches = async () => {
    const branchData = await fetchBranches();
    setBranches(branchData);
  };

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
    loadBranches();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchKeyword(searchInput.trim());
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    loadInventory(1);
  }, [selectedBranchId, searchKeyword]);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Inventory Management
          </h1>
          <p className="text-gray-500 mt-1">
            Track inventory quantity by branch and product variant.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search product name or SKU"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Branch
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <option value="">All branches</option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <InventoryTable
            items={items}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={loadInventory}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default InventoryManagementPage;
