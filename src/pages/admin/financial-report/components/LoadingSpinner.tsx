export const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-20 text-gray-400">
    <svg className="animate-spin h-8 w-8 mr-3" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
    <span className="text-sm">Loading data...</span>
  </div>
);
