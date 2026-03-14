import { useState, useRef } from "react";
import { useOnClickOutside } from "usehooks-ts";

export interface IInputBillingProps {
    label: string;
    input?: string;
    type: "text" | "number";
    isRequired?: boolean;
    onClickOutSide?: (value: string) => void;
}

const InputBilling = ({
    input = "",
    label,
    isRequired,
    type,
    onClickOutSide,
}: IInputBillingProps) => {
    const [value, setValue] = useState(input);
    const [hasFocused, setHasFocused] = useState(false);
    const [hasChanged, setHasChanged] = useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);

    const validateAndParse = (value: string) => {
        switch (type) {
            case "text":
                return value.replace(/^\s+/, "").replace(/\s{2,}/g, " ");
            case "number":
                if (!/^\d*$/.test(value)) return null;
                if (/^0+/.test(value)) {
                    value = value.replace(/^0+/, "0");
                }
                return value;

            default:
                return value;
        }
    };
    useOnClickOutside(wrapperRef as React.RefObject<HTMLElement>, () => {
        if (hasFocused && hasChanged) {
            onClickOutSide?.(value);
            setHasChanged(false);
        }
    });

    return (
        <div ref={wrapperRef} className="flex flex-col gap-2">
            <label className="text-base text-gray-500">
                {label}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>

            <input
                value={value}
                onFocus={() => setHasFocused(true)}
                onChange={(e) => {
                    const parsed = validateAndParse(e.target.value);
                    if (parsed === null) return;

                    setValue(parsed.toString());
                    setHasChanged(true);
                }}
                className="w-full h-12 bg-secondary rounded px-4 outline-none text-black"
                required={isRequired}
            />
        </div>
    );
};

export default InputBilling;
