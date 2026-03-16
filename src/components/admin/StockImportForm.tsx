import { motion } from "framer-motion";
import type { IBranch } from "../../shared/models/branch-model";
import type { IProduct } from "../../shared/models/product-model";
import type { ISupplier } from "../../shared/models/supplier-model";
import type {
  ICreateStockImportPayload,
  IStockImportProductSearchOption,
} from "../../types/stock-import.types";
import StockImportFormFooter from "./stock-import-form/StockImportFormFooter";
import StockImportFormHeader from "./stock-import-form/StockImportFormHeader";
import { useStockImportFileImport } from "../../hooks/stock-import/useStockImportFileImport";
import { useStockImportItems } from "../../hooks/stock-import/useStockImportItems";
import { useStockImportSubmit } from "../../hooks/stock-import/useStockImportSubmit";
import StockImportInfoSection from "./stock-import-form/StockImportInfoSection";
import StockImportItemsSection from "./stock-import-form/StockImportItemsSection";

interface StockImportFormProps {
  branches: IBranch[];
  suppliers: ISupplier[];
  onSearchProducts: (
    keyword: string,
  ) => Promise<IStockImportProductSearchOption[]>;
  onLoadProductDetail: (productId: string) => Promise<IProduct | null>;
  onSubmit: (payload: ICreateStockImportPayload) => Promise<boolean>;
  onCancel: () => void;
}

const StockImportForm = ({
  branches,
  suppliers,
  onSearchProducts,
  onLoadProductDetail,
  onSubmit,
  onCancel,
}: StockImportFormProps) => {
  const {
    items,
    productDetails,
    lineTotals,
    totalCost,
    updateItem,
    addItem,
    removeItem,
    updateImeiInput,
    addImeiInput,
    removeImeiInput,
    getVariantsByProductId,
    getItemProductOptions,
    handleProductSearchChange,
    handleSelectProduct,
    handleVariantChange,
    replaceItems,
    mergeProductDetails,
  } = useStockImportItems({
    onSearchProducts,
    onLoadProductDetail,
  });

  const { isImportingFile, handleImportFile } = useStockImportFileImport({
    onSearchProducts,
    onLoadProductDetail,
    productDetails,
    replaceItems,
    mergeProductDetails,
  });

  const {
    branchId,
    supplierId,
    note,
    isSaving,
    setBranchId,
    setSupplierId,
    setNote,
    handleSubmit,
  } = useStockImportSubmit({
    items,
    onSubmit,
    onCancel,
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl flex flex-col max-h-[90vh]"
    >
      <StockImportFormHeader onCancel={onCancel} />

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <form
          id="stock-import-form"
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          <StockImportInfoSection
            branches={branches}
            suppliers={suppliers}
            branchId={branchId}
            supplierId={supplierId}
            note={note}
            setBranchId={setBranchId}
            setSupplierId={setSupplierId}
            setNote={setNote}
          />

          <StockImportItemsSection
            items={items}
            totalCost={totalCost}
            isImportingFile={isImportingFile}
            addItem={addItem}
            onImportFile={handleImportFile}
            removeItem={removeItem}
            updateItem={updateItem}
            getVariantsByProductId={getVariantsByProductId}
            getItemProductOptions={getItemProductOptions}
            handleProductSearchChange={handleProductSearchChange}
            handleSelectProduct={handleSelectProduct}
            handleVariantChange={handleVariantChange}
            updateImeiInput={updateImeiInput}
            addImeiInput={addImeiInput}
            removeImeiInput={removeImeiInput}
            lineTotals={lineTotals}
          />
        </form>
      </div>

      <StockImportFormFooter isSaving={isSaving} onCancel={onCancel} />
    </motion.div>
  );
};

export default StockImportForm;
