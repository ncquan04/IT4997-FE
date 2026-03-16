interface StockImportFormFooterProps {
  isSaving: boolean;
  onCancel: () => void;
}

const StockImportFormFooter = ({
  isSaving,
  onCancel,
}: StockImportFormFooterProps) => {
  return (
    <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
      <button
        type="button"
        onClick={onCancel}
        className="w-32 px-4 py-3 rounded-lg border border-gray-300 font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="stock-import-form"
        disabled={isSaving}
        className="w-44 h-14 rounded-lg bg-button2 hover:bg-hoverButton text-white font-semibold shadow-md transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSaving ? "Saving..." : "Create Import"}
      </button>
    </div>
  );
};

export default StockImportFormFooter;
