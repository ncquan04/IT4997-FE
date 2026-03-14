import React from "react";

type InputProps = {
    label: string;
    value?: string | number;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    type?: React.HTMLInputTypeAttribute;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const Input: React.FC<InputProps> = ({ label, required, disabled, ...props }) => {
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <input
                {...props}
                disabled={disabled}
                className={`
                    w-full rounded-md border px-3 py-2 text-sm
                    placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-red-400
                    ${
                        disabled
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                            : "border-gray-300 bg-white"
                    }
                `}
            />
        </div>
    );
};

type TextareaProps = {
    label: string;
    value?: string;
    required?: boolean;
    rows?: number;
    placeholder?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

export const Textarea: React.FC<TextareaProps> = ({ label, required, ...props }) => {
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <textarea
                {...props}
                className="
                    w-full rounded-md border border-gray-300
                    px-3 py-2 text-sm
                    placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-red-400
                "
            />
        </div>
    );
};
