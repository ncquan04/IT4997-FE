import React, { useState } from "react";
import type { IProductVariant } from "../../../shared/models/product-model";
import { motion, AnimatePresence } from "framer-motion";
import { uploadSingleImage } from "../../../services/api/api.upload";

const VariantItem: React.FC<{
    variant: IProductVariant;
    index: number;
    onRemove: (index: number) => void;
    onChange: (index: number, field: keyof IProductVariant, value: any) => void;
    inputClass: string;
}> = ({ variant, index, onRemove, onChange, inputClass }) => {
    const [uploading, setUploading] = useState(false);
    const [imageUrlInput, setImageUrlInput] = useState("");
    const [inputMode, setInputMode] = useState<"url" | "file">("file");

    const handleAddUrl = () => {
        if (!imageUrlInput.trim()) return;
        const currentImages = variant.images || [];
        onChange(index, "images", [...currentImages, imageUrlInput.trim()]);
        setImageUrlInput("");
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await uploadSingleImage(formData);
            if (res && res.url) {
                const currentImages = variant.images || [];
                onChange(index, "images", [...currentImages, res.url]);
            }
        } catch (error) {
            console.error("Upload failed", error);
            // alert("Upload failed. Please try again.");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const removeImage = (imgIndex: number) => {
        const currentImages = variant.images || [];
        const newImages = currentImages.filter((_, i) => i !== imgIndex);
        onChange(index, "images", newImages);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative group"
        >
            <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                title="Remove Variant"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pr-8">
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Version</label>
                    <input
                        placeholder="e.g. 128GB"
                        value={variant.version}
                        onChange={(e) => onChange(index, "version", e.target.value)}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Color</label>
                    <input
                        placeholder="Color Name"
                        value={variant.colorName}
                        onChange={(e) => onChange(index, "colorName", e.target.value)}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Price</label>
                    <input
                        placeholder="0"
                        type="number"
                        value={variant.price}
                        onChange={(e) => onChange(index, "price", Number(e.target.value))}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Stock</label>
                    <input
                        placeholder="0"
                        type="number"
                        value={variant.quantity}
                        onChange={(e) => onChange(index, "quantity", Number(e.target.value))}
                        className={inputClass}
                    />
                </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4">
                <div className="flex justify-between items-center mb-3">
                    <label className="text-xs text-gray-500 font-semibold">Product Images</label>
                    <div className="flex bg-gray-100 rounded-lg p-0.5">
                        <button
                            type="button"
                            onClick={() => setInputMode("url")}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${inputMode === 'url' ? 'bg-white text-button2 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Paste Link
                        </button>
                        <button
                            type="button"
                            onClick={() => setInputMode("file")}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${inputMode === 'file' ? 'bg-white text-button2 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Upload File
                        </button>
                    </div>
                </div>

                {/* Image Previews */}
                {(variant.images && variant.images.length > 0) ? (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {variant.images.map((img, i) => (
                            <div key={i} className="relative w-24 h-24 rounded-lg border border-gray-200 overflow-hidden group/img bg-gray-50">
                                <img src={img} alt={`Variant ${index} - ${i}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(i)}
                                    className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover/img:opacity-100 transition-all transform scale-90 hover:scale-100"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mb-4 p-4 text-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-400 text-xs">
                        No images added yet
                    </div>
                )}

                {/* Input Area */}
                {inputMode === "url" ? (
                    <div className="flex gap-2">
                        <input
                            placeholder="https://example.com/image.jpg"
                            value={imageUrlInput}
                            onChange={(e) => setImageUrlInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
                            className={inputClass}
                        />
                        <button
                            type="button"
                            onClick={handleAddUrl}
                            disabled={!imageUrlInput.trim()}
                            className="px-4 py-2 bg-button2 hover:bg-hoverButton text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add
                        </button>
                    </div>
                ) : (
                    <div className="relative group/upload">
                        <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${uploading ? 'bg-gray-50 border-gray-300' : 'border-gray-300 hover:bg-gray-50 hover:border-button2'}`}>
                            {uploading ? (
                                <div className="flex flex-col items-center px-4 py-2">
                                     <div className="w-6 h-6 border-2 border-button2 border-t-transparent rounded-full animate-spin mb-2"></div>
                                     <span className="text-xs text-gray-500">Uploading...</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center px-4 py-2">
                                    <svg className="w-6 h-6 text-gray-400 mb-2 group-hover/upload:text-button2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                    <span className="text-xs text-gray-500">Click to upload image</span>
                                </div>
                            )}
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileUpload}
                                disabled={uploading}
                            />
                        </label>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

interface VariantsSectionProps {
    variants: IProductVariant[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    onChange: (index: number, field: keyof IProductVariant, value: any) => void;
    inputClass: string;
}

const VariantsSection: React.FC<VariantsSectionProps> = ({
    variants,
    onAdd,
    onRemove,
    onChange,
    inputClass,
}) => {
    return (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-button2">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                    Variants
                </h3>
                <button
                    type="button"
                    onClick={onAdd}
                    className="text-sm font-semibold text-button2 hover:text-hoverButton hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-red-200"
                >
                    + Add Variant
                </button>
            </div>
            <div className="space-y-4">
                <AnimatePresence>
                    {variants?.map((variant, index) => (
                        <VariantItem
                            key={index}
                            variant={variant}
                            index={index}
                            onRemove={onRemove}
                            onChange={onChange}
                            inputClass={inputClass}
                        />
                    ))}
                </AnimatePresence>
                {(!variants || variants.length === 0) && (
                    <div className="text-center py-4 text-gray-400 text-sm italic">
                        No variants added yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default VariantsSection;
