import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SaleTag from "./SaleTag";
import StarRating from "../starRating/StarRating";
import { useI18n } from "../../../contexts/I18nContext";
import type {
  Product,
  IProductVariant,
} from "../../../shared/models/product-model";
import { formatPrice } from "../../../utils";
import { addToCart } from "../../../services/api/api.cart";
import { useAuth } from "../../../contexts/AuthContext";
import { AppRoutes } from "../../../navigation";
import { useToast } from "../../../contexts/ToastContext";
import { logEvent } from "../../../utils/analytics";

interface ItemCardProps {
  item: Product;
}

const ItemCard = ({ item }: ItemCardProps) => {
  const i18n = useI18n();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const { showToast } = useToast();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  const variant = item.variants?.[0];
  const hasMultipleVariants = item.variants && item.variants.length > 1;

  const salePercent = useMemo(() => {
    if (!variant) return 0;
    // effectiveDiscountPrice (from DiscountProgram) takes priority over salePrice
    const discountedPrice =
      variant.effectiveDiscountPrice ??
      (variant.salePrice && variant.salePrice < variant.price
        ? variant.salePrice
        : null);
    if (discountedPrice !== null && discountedPrice < variant.price) {
      return Math.round(
        ((variant.price - discountedPrice) / variant.price) * 100,
      );
    }
    return 0;
  }, [variant]);

  const doAddToCart = async (selectedVariant: IProductVariant) => {
    if (!isAuthenticated) {
      navigate(AppRoutes.LOGIN, {
        state: {
          from: location,
          action: "addToCart",
          payload: {
            productId: item._id,
            variantId: selectedVariant._id,
            quantity: 1,
          },
        },
      });
      return;
    }

    try {
      setAdding(true);
      await addToCart(item._id, selectedVariant._id, 1);
      showToast(i18n.t("Added to cart"), "success");
      setPickerOpen(false);
      logEvent("add_to_cart", {
        productId: item._id,
        title: item.title,
        variantId: selectedVariant._id,
        variantName: selectedVariant.variantName,
        price: selectedVariant.price,
        quantity: 1,
        source: "product_card",
      });
    } catch (error: any) {
      console.error(error);
      showToast(
        error.message || i18n.t("Something went wrong, please try again later"),
        "error",
      );
    } finally {
      setAdding(false);
    }
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!variant) return;
    if (hasMultipleVariants) {
      setPickerOpen(true);
    } else {
      doAddToCart(variant);
    }
  };

  const handleClick = () => {
    logEvent("select_item", {
      productId: item._id,
      title: item.title,
      price: variant?.price,
      source: "product_card",
    });
    navigate(`/products/${item._id}`);
  };

  return (
    <article
      className="w-full flex flex-col hover:cursor-pointer bg-white shadow-md hover:shadow-xl transition-all duration-300 rounded-lg overflow-hidden"
      onClick={handleClick}
    >
      <figure className="w-full aspect-270/250 relative overflow-hidden group m-0">
        <img
          src={variant?.images?.[0]}
          alt={item.title}
          className="w-full h-full object-cover "
        />
        {salePercent !== 0 && (
          <SaleTag
            salePercent={salePercent}
            style={{ position: "absolute", top: 12, left: 12 }}
          />
        )}

        {/* Add to Cart button — hidden when picker is open */}
        {!pickerOpen && (
          <button
            className="w-full pb-2 pt-2 absolute bottom-0 bg-black flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out cursor-pointer border-0"
            onClick={handleAddToCartClick}
            aria-label={i18n.t("Add to Cart")}
          >
            <span className="text-sm md:text-base text-white font-medium">
              {i18n.t("Add to Cart")}
            </span>
          </button>
        )}

        {/* Inline variant picker */}
        {pickerOpen && (
          <div
            className="absolute bottom-0 left-0 right-0 bg-black/90 p-2 flex flex-col gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap gap-1 justify-center">
              {item.variants.map((v) => (
                <button
                  key={v._id}
                  disabled={adding}
                  className="px-2 py-1 text-xs text-white border border-white/50 rounded hover:bg-white hover:text-black transition-colors cursor-pointer disabled:opacity-50"
                  onClick={() => doAddToCart(v)}
                >
                  {v.variantName}
                </button>
              ))}
            </div>
            <button
              className="text-xs text-white/50 hover:text-white transition-colors mt-0.5 cursor-pointer bg-transparent border-0"
              onClick={(e) => {
                e.stopPropagation();
                setPickerOpen(false);
              }}
            >
              ✕ {i18n.t("Cancel")}
            </button>
          </div>
        )}
      </figure>
      <section className="flex flex-col gap-2 p-4">
        <h3 className="text-sm md:text-base text-black font-medium m-0 truncate">
          {item.title}
        </h3>
        <div className="flex flex-row gap-2 md:gap-3">
          {(() => {
            const effectivePrice =
              variant?.effectiveDiscountPrice ??
              (variant?.salePrice && variant.salePrice < variant.price
                ? variant.salePrice
                : null);
            const displayPrice = effectivePrice ?? variant?.price ?? 0;
            const showStrike =
              effectivePrice !== null && effectivePrice !== undefined;
            return (
              <>
                <data
                  className="text-sm md:text-base text-secondary2 font-medium"
                  value={displayPrice}
                >
                  {formatPrice(displayPrice)}
                </data>
                {showStrike && (
                  <data
                    className="text-sm md:text-base text-black opacity-50 line-through font-medium"
                    value={variant?.price}
                  >
                    {formatPrice(variant?.price || 0)}
                  </data>
                )}
              </>
            );
          })()}
        </div>
        <div className="flex flex-row gap-2 items-center">
          <StarRating rating={item.rating || 0} />
        </div>
      </section>
    </article>
  );
};
export default ItemCard;
