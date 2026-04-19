import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InventoryTable from "../../components/admin/InventoryTable";
import { fetchSuppliers } from "../../services/api/api.suppliers";
import { createStockImport } from "../../services/api/api.stock-import";
import { fetchProductById } from "../../services/api/api.products";
import { SearchProducts } from "../../services/api/api.search";
import StockImportForm from "../../components/admin/StockImportForm";
import type { ISupplier } from "../../shared/models/supplier-model";
import type {
  ICreateStockImportPayload,
  IStockImportProductSearchOption,
} from "../../types/stock-import.types";
import { useToast } from "../../contexts/ToastContext";
import { useInventoryData } from "./inventory/hooks/useInventoryData";

const InventoryManagementPage = () => {
  const { showToast } = useToast();
  const {
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
  } = useInventoryData();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);

  const handleOpenCreateForm = async () => {
    setIsFormOpen(true);
    if (suppliers.length === 0) {
      const data = await fetchSuppliers();
      setSuppliers(data);
    }
  };

  const searchProductsForStockImport = async (
    keyword: string,
  ): Promise<IStockImportProductSearchOption[]> => {
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword.length < 2) return [];
    const response = await SearchProducts({ userInput: trimmedKeyword, page: 1 });
    if (!response) return [];
    const deduplicated = new Map<string, IStockImportProductSearchOption>();
    const loweredKeyword = trimmedKeyword.toLowerCase();
    response.products.forEach((product) => {
      const allSkus = (product.variants ?? [])
        .map((variant) => variant.sku)
        .filter((sku): sku is string => Boolean(sku));
      const matchedSkus = allSkus.filter((sku) =>
        sku.toLowerCase().includes(loweredKeyword),
      );
      deduplicated.set(product._id, {
        productId: product._id,
        title: product.title,
        skuHints: matchedSkus.slice(0, 3),
      });
    });
    return Array.from(deduplicated.values());
  };

  const handleCreateStockImport = async (
    payload: ICreateStockImportPayload,
  ): Promise<boolean> => {
    const success = await createStockImport(payload);
    if (!success) {
      showToast("Failed to create stock import", "error");
      return false;
    }
    showToast("Stock import created successfully", "success");
    loadInventory(1);
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Inventory Management
            </h1>
            <p className="text-gray-500 mt-1">
              Track inventory quantity by branch and product variant.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenCreateForm}
            className="flex items-center justify-center gap-2 bg-button2 hover:bg-hoverButton text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-red-200 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Stock Import
          </motion.button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Search</label>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search product name or SKU"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Branch</label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <option value="">All branches</option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>{branch.name}</option>
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

      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <div className="relative z-10 w-full max-w-6xl pointer-events-none flex justify-center">
              <div className="pointer-events-auto w-full">
                <StockImportForm
                  branches={branches}
                  suppliers={suppliers}
                  onSearchProducts={searchProductsForStockImport}
                  onLoadProductDetail={fetchProductById}
                  onSubmit={handleCreateStockImport}
                  onCancel={() => setIsFormOpen(false)}
                />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InventoryManagementPage;
