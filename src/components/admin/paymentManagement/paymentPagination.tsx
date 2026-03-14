type Props = {
    page: number;
    totalPages: number;
    onChange: (page: number) => void;
};

const Pagination = ({ page, totalPages, onChange }: Props) => {
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-end gap-2 mt-4">
            <button
                disabled={page === 1}
                onClick={() => onChange(page - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
            >
                Prev
            </button>

            <span className="px-2 py-1 text-sm text-gray-600">
                Page {page} / {totalPages}
            </span>

            <button
                disabled={page === totalPages}
                onClick={() => onChange(page + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
