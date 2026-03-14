import React from "react";
import type { IProduct } from "../../../shared/models/product-model";
import type { ICategory } from "../../../shared/models/category-model";
import { Contacts } from "../../../shared/contacts";

interface BasicInfoSectionProps {
    formData: Partial<IProduct>;
    categories: ICategory[];
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    setFormData: React.Dispatch<React.SetStateAction<Partial<IProduct>>>;
    inputClass: string;
    labelClass: string;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
    formData,
    categories,
    handleChange,
    setFormData,
    inputClass,
    labelClass,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className={labelClass}>
                    Title <span className="text-red-500">*</span>
                </label>
                <input
                    required
                    name="title"
                    placeholder="Product Title"
                    value={formData.title}
                    onChange={handleChange}
                    className={inputClass}
                />
            </div>
            <div>
                <label className={labelClass}>
                    Brand <span className="text-red-500">*</span>
                </label>
                <input
                    required
                    name="brand"
                    placeholder="Brand Name"
                    value={formData.brand}
                    onChange={handleChange}
                    className={inputClass}
                />
            </div>
            <div>
                <label className={labelClass}>
                    Category <span className="text-red-500">*</span>
                </label>
                <select
                    required
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className={inputClass}
                >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className={labelClass}>Status</label>
                <select
                    name="isHide"
                    value={formData.isHide}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            isHide: Number(e.target.value) as typeof Contacts.Status.Evaluation[keyof typeof Contacts.Status.Evaluation],
                        }))
                    }
                    className={inputClass}
                >
                    <option value={Contacts.Status.Evaluation.PUBLIC}>Public</option>
                    <option value={Contacts.Status.Evaluation.HIDE}>Hidden</option>
                </select>
            </div>
        </div>
    );
};

export default BasicInfoSection;
