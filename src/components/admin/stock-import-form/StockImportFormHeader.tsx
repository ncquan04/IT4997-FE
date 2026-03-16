interface StockImportFormHeaderProps {
  onCancel: () => void;
}

const StockImportFormHeader = ({ onCancel }: StockImportFormHeaderProps) => {
  return (
    <div className="flex justify-between items-center p-6 border-b border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800">Create Stock Import</h2>
      <button
        onClick={onCancel}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
};

export default StockImportFormHeader;
