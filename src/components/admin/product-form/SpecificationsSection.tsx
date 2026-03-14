import React from "react";
import type { ISpecItem } from "../../../shared/models/product-model";
import { motion, AnimatePresence } from "framer-motion";

interface SpecificationsSectionProps {
    specifications: ISpecItem[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    onChange: (index: number, field: keyof ISpecItem, value: string) => void;
    inputClass: string;
}

const SpecificationsSection: React.FC<SpecificationsSectionProps> = ({
    specifications,
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
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                    </svg>
                    Specifications
                </h3>
                <button
                    type="button"
                    onClick={onAdd}
                    className="text-sm font-semibold text-button2 hover:text-hoverButton hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-red-200"
                >
                    + Add Spec
                </button>
            </div>
            <AnimatePresence>
                {specifications?.map((spec, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-4 mb-3 items-start"
                    >
                        <input
                            placeholder="Key (e.g., RAM)"
                            value={spec.key}
                            onChange={(e) => onChange(index, "key", e.target.value)}
                            className={inputClass}
                        />
                        <input
                            placeholder="Value (e.g., 8GB)"
                            value={spec.value}
                            onChange={(e) => onChange(index, "value", e.target.value)}
                            className={inputClass}
                        />
                        <button
                            type="button"
                            onClick={() => onRemove(index)}
                            className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            title="Remove Specification"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
            {(!specifications || specifications.length === 0) && (
                <div className="text-center py-4 text-gray-400 text-sm italic">
                    No specifications added yet.
                </div>
            )}
        </div>
    );
};

export default SpecificationsSection;
