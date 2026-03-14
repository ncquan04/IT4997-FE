import React from "react";
import type { IProduct } from "../../shared/models/product-model";
import { Contacts } from "../../shared/contacts";
import { motion } from "framer-motion";

interface ProductTableProps {
    products: IProduct[];
    onEdit: (product: IProduct) => void;
    onDelete: (id: string) => void;
    isLoading?: boolean;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
    products,
    onEdit,
    onDelete,
    isLoading,
    currentPage,
    totalPages,
    onPageChange,
}) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                Loading products...
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider">Product</th>
                            <th className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider">Brand</th>
                            <th className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider">Price</th>
                            <th className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider">Status</th>
                            <th className="p-5 font-semibold text-gray-500 text-sm uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product, index) => {
                            const representativeVariant = product.variants?.[0];
                            const imageUrl = representativeVariant?.images?.[0] || "";
                            const price = representativeVariant?.price || 0;
                            const isHidden = product.isHide === Contacts.Status.Evaluation.HIDE;

                            return (
                                <motion.tr
                                    key={product._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors group"
                                >
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={product.title}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                                                        No Img
                                                    </div>
                                                )}
                                            </div>
                                            <span className="font-semibold text-gray-800 line-clamp-1 max-w-[200px]" title={product.title}>
                                                {product.title}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-gray-600 font-medium">{product.brand}</td>
                                    <td className="p-5 text-gray-900 font-bold">
                                        {new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        }).format(price)}
                                    </td>
                                    <td className="p-5">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                isHidden
                                                    ? "bg-red-100 text-red-800"
                                                    : "bg-green-100 text-green-800"
                                            }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isHidden ? "bg-red-500" : "bg-green-500"}`}></span>
                                            {isHidden ? "Hidden" : "Public"}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button
                                                onClick={() => onEdit(product)}
                                                className="p-2 text-button2 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                            </button>
                                            <button
                                                onClick={() => onDelete(product._id)}
                                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })}
                        {products.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-gray-400">
                                    <div className="flex flex-col items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-gray-300"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                        <p>No products found.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="text-sm text-gray-500">
                        Showing page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>

                        {/* Pagination Numbers */}
                        <div className="flex items-center gap-1">
                            {(() => {
                                const pages = [];
                                const maxVisiblePages = 5;

                                if (totalPages <= maxVisiblePages) {
                                    for (let i = 1; i <= totalPages; i++) {
                                        pages.push(i);
                                    }
                                } else {
                                    // Always show first page
                                    pages.push(1);

                                    if (currentPage > 3) {
                                        pages.push("...");
                                    }

                                    // Neighbors
                                    const start = Math.max(2, currentPage - 1);
                                    const end = Math.min(totalPages - 1, currentPage + 1);

                                    for (let i = start; i <= end; i++) {
                                        pages.push(i);
                                    }

                                    if (currentPage < totalPages - 2) {
                                        pages.push("...");
                                    }

                                    // Always show last page
                                    pages.push(totalPages);
                                }

                                return pages.map((page, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => typeof page === 'number' && onPageChange(page)}
                                        disabled={page === "..."}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                                            page === currentPage
                                                ? "bg-button2 text-white shadow-md shadow-red-200"
                                                : page === "..."
                                                ? "text-gray-400 cursor-default"
                                                : "text-gray-600 hover:bg-gray-100 bg-white border border-gray-200"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ));
                            })()}
                        </div>

                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductTable;
