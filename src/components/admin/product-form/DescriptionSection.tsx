import React from "react";
import type { IProduct } from "../../../shared/models/product-model";

interface DescriptionSectionProps {
    formData: Partial<IProduct>;
    handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    inputClass: string;
    labelClass: string;
}

const DescriptionSection: React.FC<DescriptionSectionProps> = ({
    formData,
    handleChange,
    inputClass,
    labelClass,
}) => {
    return (
        <div className="space-y-6">
            <div>
                <label className={labelClass}>
                    Short Description <span className="text-red-500">*</span>
                </label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className={inputClass}
                    placeholder="Brief overview of the product..."
                />
            </div>
            <div>
                <label className={labelClass}>
                    Detailed Description <span className="text-red-500">*</span>
                </label>
                <textarea
                    name="descriptionDetail"
                    value={formData.descriptionDetail}
                    onChange={handleChange}
                    rows={5}
                    className={inputClass}
                    placeholder="Full product details..."
                />
            </div>
        </div>
    );
};

export default DescriptionSection;
