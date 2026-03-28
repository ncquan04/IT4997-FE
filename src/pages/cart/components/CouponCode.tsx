import { useState } from "react";
import { useI18n } from "../../../contexts/I18nContext";
import CommonButton from "../../../components/common/CommonButton";
import { validateCoupon } from "../../../services/api/api.coupon";
import { useAppSelector } from "../../../redux/store";

const CouponCode = ({
  onApply,
}: {
  onApply: (code: string, discountAmount: number) => void;
}) => {
  const i18n = useI18n();
  const totalPrice = useAppSelector((state) => state.cart.totalPrice);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!code.trim()) return;
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      const result = await validateCoupon({
        code: code.trim(),
        orderTotal: totalPrice,
      });
      if (result) {
        onApply(code.trim().toUpperCase(), result.discountAmount);
        setSuccess(`Discount: -${result.discountAmount.toLocaleString()}đ`);
      }
    } catch (err: any) {
      const msg: string = err?.message ?? "Invalid coupon";
      if (msg === "COUPON_NOT_FOUND") setError("Coupon not found");
      else if (msg === "COUPON_EXPIRED") setError("Coupon has expired");
      else if (msg === "COUPON_USAGE_EXCEEDED")
        setError("Coupon usage limit reached");
      else if (msg?.startsWith("COUPON_MIN_ORDER")) {
        const min = msg.split(":")[1];
        setError(`Minimum order value: ${Number(min).toLocaleString()}đ`);
      } else setError("Invalid coupon");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <form
        className="flex flex-col sm:flex-row gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleApplyCoupon();
        }}
      >
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Coupon Code"
          className="w-full sm:w-[300px] h-[56px] border border-[#00000033] rounded-md px-4 py-2 text-text2"
        />
        <div className="w-full sm:w-[211px] h-[56px]">
          <CommonButton
            label={isLoading ? "Applying..." : "Apply"}
            onClick={() => {}}
            type="submit"
            disable={isLoading}
          />
        </div>
      </form>
      {error && <span className="text-red-500 text-sm">{error}</span>}
      {success && <span className="text-green-600 text-sm">{success}</span>}
    </div>
  );
};

export default CouponCode;
