import { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SaleTag from "./SaleTag";
import StarRating from "../starRating/StarRating";
import { useI18n } from "../../../contexts/I18nContext";
import type { Product } from "../../../shared/models/product-model";
import { formatPrice } from "../../../utils";
import { addToCart } from "../../../services/api/api.cart";
import { useAuth } from "../../../contexts/AuthContext";
import { AppRoutes } from "../../../navigation";
import { useToast } from "../../../contexts/ToastContext";

interface ItemCardProps {
  item: Product;
}

const ItemCard = ({ item }: ItemCardProps) => {
  const i18n = useI18n();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const { showToast } = useToast();

  const variant = item.variants?.[0];

  const salePercent = useMemo(() => {
    if (variant && variant.salePrice && variant.salePrice < variant.price) {
      return Math.round(
        ((variant.price - variant.salePrice) / variant.price) * 100
      );
    }
    return 0;
  }, [variant]);

  const handleAddToCart = async () => {
    if (!variant) return;

    if (!isAuthenticated) {
      navigate(AppRoutes.LOGIN, {
        state: {
          from: location,
          action: "addToCart",
          payload: {
            productId: item._id,
            variantId: variant._id,
            quantity: 1,
          },
        },
      });
      return;
    }

    try {
      await addToCart(item._id, variant._id, 1);
      showToast(i18n.t("Added to cart"), "success");
    } catch (error: any) {
      console.error(error);
      showToast(
        error.message || i18n.t("Something went wrong, please try again later"),
        "error"
      );
    }
  };

  const handleClick = () => {
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
        <button
          className="w-full pb-2 pt-2 absolute bottom-0 bg-black flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out cursor-pointer border-0"
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
          aria-label={i18n.t("Add to Cart")}
        >
          <span className="text-sm md:text-base text-white font-medium">
            {i18n.t("Add to Cart")}
          </span>
        </button>
      </figure>
      <section className="flex flex-col gap-2 p-4">
        <h3 className="text-sm md:text-base text-black font-medium m-0 truncate">
          {item.title}
        </h3>
        <div className="flex flex-row gap-2 md:gap-3">
          <data
            className="text-sm md:text-base text-secondary2 font-medium"
            value={variant?.salePrice || variant?.price}
          >
            {formatPrice(variant?.salePrice || variant?.price || 0)}
          </data>
          {variant?.salePrice && (
            <data
              className="text-sm md:text-base text-black opacity-50 line-through font-medium"
              value={variant?.price}
            >
              {formatPrice(variant?.price || 0)}
            </data>
          )}
        </div>
        <div className="flex flex-row gap-2 items-center">
          <StarRating rating={item.rating || 0} />
          <span className="text-xs md:text-sm text-black opacity-50 font-medium">
            ({variant?.quantity || 0})
          </span>
        </div>
      </section>
    </article>
  );
};
export default ItemCard;
