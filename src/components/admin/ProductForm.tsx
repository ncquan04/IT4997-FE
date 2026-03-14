import React, { useEffect, useState } from "react";
import type { IProduct, IProductVariant, ISpecItem } from "../../shared/models/product-model";
import type { ICategory } from "../../shared/models/category-model";
import { Contacts } from "../../shared/contacts";
import { motion } from "framer-motion";
import BasicInfoSection from "./product-form/BasicInfoSection";
import DescriptionSection from "./product-form/DescriptionSection";
import SpecificationsSection from "./product-form/SpecificationsSection";
import VariantsSection from "./product-form/VariantsSection";

interface ProductFormProps {
    initialData?: IProduct | null;
    categories: ICategory[];
    onSubmit: (data: Partial<IProduct>) => Promise<void>;
    onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
    initialData,
    categories,
    onSubmit,
    onCancel,
}) => {
    const [formData, setFormData] = useState<Partial<IProduct>>({
        title: "",
        brand: "",
        categoryId: "",
        description: "",
        descriptionDetail: "",
        specifications: [],
        variants: [],
        isHide: Contacts.Status.Evaluation.PUBLIC,
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                title: initialData.title || "",
                brand: initialData.brand || "",
                categoryId: initialData.categoryId || "",
                description: initialData.description || "",
                descriptionDetail: initialData.descriptionDetail || "",
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSpecChange = (index: number, field: keyof ISpecItem, value: string) => {
        const newSpecs = [...(formData.specifications || [])];
        newSpecs[index] = { ...newSpecs[index], [field]: value };
        setFormData((prev) => ({ ...prev, specifications: newSpecs }));
    };

    const addSpec = () => {
        setFormData((prev) => ({
            ...prev,
            specifications: [...(prev.specifications || []), { key: "", value: "" }],
        }));
    };

    const removeSpec = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            specifications: prev.specifications?.filter((_, i) => i !== index),
        }));
    };
    
    const handleVariantChange = (index: number, field: keyof IProductVariant, value: any) => {
        const newVariants = [...(formData.variants || [])];
        newVariants[index] = { ...newVariants[index], [field]: value };
         if(field === "images" && typeof value === "string") {
             newVariants[index].images = value.split(',').map(s => s.trim());
         }
        setFormData((prev) => ({ ...prev, variants: newVariants }));
    };

    const addVariant = () => {
         const newVariant: any = {
            version: "",
            colorName: "",
            hexcode: "#000000",
            images: [],
            quantity: 0,
            price: 0,
            sku: `SKU-${Date.now()}`
        };
        setFormData((prev) => ({
            ...prev,
            variants: [...(prev.variants || []), newVariant],
        }));
    };

    const removeVariant = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            variants: prev.variants?.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSubmit(formData);
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-button2 focus:border-button2 transition-all outline-none bg-white text-gray-800 placeholder-gray-400";
    const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh]"
        >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800">
                    {initialData ? "Edit Product" : "Create New Product"}
                </h2>
                <button 
                    onClick={onCancel}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
                    
                    <BasicInfoSection 
                        formData={formData}
                        categories={categories}
                        handleChange={handleChange}
                        setFormData={setFormData}
                        inputClass={inputClass}
                        labelClass={labelClass}
                    />

                    <DescriptionSection
                        formData={formData}
                        handleChange={handleChange}
                        inputClass={inputClass}
                        labelClass={labelClass}
                    />

                    <SpecificationsSection
                        specifications={formData.specifications || []}
                        onAdd={addSpec}
                        onRemove={removeSpec}
                        onChange={handleSpecChange}
                        inputClass={inputClass}
                    />

                    <VariantsSection
                        variants={formData.variants || []}
                        onAdd={addVariant}
                        onRemove={removeVariant}
                        onChange={handleVariantChange}
                        inputClass={inputClass}
                    />
                    
                </form>
            </div>

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
                    form="product-form"
                    disabled={isLoading}
                    className="w-40 h-14 rounded-lg bg-button2 hover:bg-hoverButton text-white font-semibold shadow-md transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                     {isLoading ? (
                         <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                     ) : null}
                     {isLoading ? "Saving..." : "Save Product"}
                 </button>
            </div>
        </motion.div>
    );
};

export default ProductForm;
