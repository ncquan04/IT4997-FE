interface Props {
    label: string;
    onRemove?: () => void;
    onClick?: () => void;
}

const RecentItem = ({ label, onRemove, onClick }: Props) => {
    return (
        <div
            className="group flex items-center justify-between gap-2 px-3 py-2  cusor rounded-lg bg-white hover:bg-gray-100 text-sm transition"
            onClick={(e) => {
                e.stopPropagation();
                onClick?.();
            }}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-gray-400 shrink-0"
            >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
            </svg>

            <span className="flex-1 truncate">{label}</span>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove?.();
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-black transition"
            >
                ×
            </button>
        </div>
    );
};

export default RecentItem;
