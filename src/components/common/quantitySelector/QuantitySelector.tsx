import type { Dispatch, SetStateAction } from "react";

interface QuantitySelectorProps {
  maxQuantity: number;
  quantity: number;
  setQuantity: Dispatch<SetStateAction<number>>;
  onQuantityChange?: (quantity: number) => void;
}

const QuantitySelector = ({
  maxQuantity,
  quantity,
  setQuantity,
  onQuantityChange,
}: QuantitySelectorProps) => {
  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
      onQuantityChange?.(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
      onQuantityChange?.(quantity + 1);
    }
  };

  return (
    <div className="flex flex-row border-[1px] border-[#00000033] rounded-sm overflow-hidden w-fit h-[44px]">
      <button
        className="w-10 sm:w-[40px] h-full hover:bg-gray-50 active:bg-gray-100 transition-colors flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
        onClick={handleDecrease}
        disabled={quantity <= 1}
        aria-label="Decrease quantity"
      >
        <span className="text-2xl sm:text-3xl text-black font-light select-none">
          -
        </span>
      </button>
      <div className="w-[1px] h-full bg-[#00000033]" />
      <div className="min-w-[60px] sm:w-[80px] h-full flex justify-center items-center px-2">
        <span className="text-lg sm:text-xl text-black font-normal">
          {quantity}
        </span>
      </div>
      <div className="w-[1px] h-full bg-[#00000033]" />
      <button
        className="w-10 sm:w-[40px] h-full hover:bg-red-600 active:bg-red-700 transition-colors flex justify-center items-center bg-button2 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
        onClick={handleIncrease}
        disabled={quantity >= maxQuantity}
        aria-label="Increase quantity"
      >
        <span className="text-2xl sm:text-3xl text-white font-light select-none">
          +
        </span>
      </button>
    </div>
  );
};

export default QuantitySelector;
