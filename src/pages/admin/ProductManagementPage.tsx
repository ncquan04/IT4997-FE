import { useEffect, useState } from "react";
import type { IProduct } from "../../shared/models/product-model";
import ProductTable from "../../components/admin/ProductTable";
import ProductForm from "../../components/admin/ProductForm";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../contexts/ToastContext";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import productAsync from "../../redux/async-thunk/product.thunk";
import categoriesAync from "../../redux/async-thunk/categories.thunk";

const ProductManagementPage = () => {
    const dispatch = useAppDispatch();
    const { products, isLoading, page: currentPage = 1, totalPages = 1 } = useAppSelector((state) => state.products);
    const { categories } = useAppSelector((state) => state.categories);
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
    const { showToast } = useToast();

    const loadData = async (page: number) => {
        try {
            await dispatch(productAsync.fetchProduct({ page })).unwrap();
        } catch (error) {
            console.error("Error loading products:", error);
            showToast("Error loading products", "error");
        }
    };

    const loadCategories = async () => {
        try {
            await dispatch(categoriesAync.fectchCategories()).unwrap();
        } catch (error) {
            console.error("Error loading categories:", error);
        }
    };

    useEffect(() => {
        loadData(1);
        loadCategories();
    }, [dispatch]);

    const handleCreateClick = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (product: IProduct) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleDeleteClick = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await dispatch(productAsync.deleteProduct(id)).unwrap();
                showToast("Product deleted successfully", "success");
                // Refresh list to ensure pagination is correct
                loadData(currentPage);
            } catch (error) {
                console.error("Failed to delete product:", error);
                showToast("Failed to delete product", "error");
            }
        }
    };

     const getErrorMessage = (error: any) => {
        if (error?.response?.data?.error?.errors) {
             // Mongoose validation errors
            const errors = error.response.data.error.errors;
            const details = Object.entries(errors)
                .map(([_, err]: [string, any]) => {
                    const field = (err.path || "").charAt(0).toUpperCase() + (err.path || "").slice(1);
                    return `• ${field}: ${err.kind === 'required' ? 'This field is required' : err.message}`;
                })
                .join("\n");
            return details || "Validation failed";
        }
        if (error?.message) return error.message;
        if (typeof error === 'string') return error;
        return "An unknown error occurred";
    }

    const handleFormSubmit = async (data: Partial<IProduct>) => {
        try {
            if (editingProduct) {
                await dispatch(productAsync.updateProduct({ id: editingProduct._id, data })).unwrap();
                showToast("Product updated successfully", "success");
                loadData(currentPage);
            } else {
                await dispatch(productAsync.createProduct(data)).unwrap();
                showToast("Product created successfully", "success");
                loadData(1);
            }
            setIsFormOpen(false);
        } catch (error: any) {
            console.error("Failed to save product:", error);
             const message = getErrorMessage(error);
            showToast("Failed to save product: " + message, "error");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Product Management</h1>
                        <p className="text-gray-500 mt-1">Manage your catalog, prices, and inventory.</p>
                    </div>
                    
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCreateClick}
                        className="flex items-center justify-center gap-2 bg-button2 hover:bg-hoverButton text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-red-200 transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Add Product
                    </motion.button>
                </div>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <ProductTable
                        products={products}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        isLoading={isLoading}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={loadData}
                    />
                </motion.div>
            </div>

            {/* Modal Overlay */}
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
                        <div className="relative z-10 w-full max-w-5xl pointer-events-none flex justify-center">
                            <div className="pointer-events-auto w-full">
                                <ProductForm
                                    initialData={editingProduct}
                                    categories={categories}
                                    onSubmit={handleFormSubmit}
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

export default ProductManagementPage;
