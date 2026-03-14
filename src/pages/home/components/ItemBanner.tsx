import { useI18n } from "../../../contexts/I18nContext";
import { Link } from "react-router-dom";
import type { Product } from "../../../shared/models/product-model";

interface ItemBannerProps {
  ratio: "16:9" | "1:1";
  item: Product;
}

const ItemBanner = ({ ratio, item }: ItemBannerProps) => {
  const i18n = useI18n();

  return (
    <article
      className="w-full h-full bg-white flex justify-center items-center rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden relative"
      aria-label={item.title}
    >
      <figure className="w-full h-full m-0 relative">
        <img
          src={item.variants?.[0]?.images?.[0]}
          alt={item.title}
          className={
            ratio === "16:9"
              ? "w-full h-full object-contain"
              : "w-full h-full object-contain"
          }
        />
        <figcaption className="flex flex-col gap-2 md:gap-4 items-start absolute bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-[30px] md:left-[30px]">
          <span className="text-base sm:text-lg md:text-xl lg:text-2xl text-black font-semibold">
            {item.title}
          </span>
          <p className="text-xs sm:text-sm text-gray-600 font-normal line-clamp-2">
            {item.description}
          </p>
          <Link
            to={`/products/${item._id}`}
            className="text-sm md:text-base text-black font-medium underline cursor-pointer hover:text-gray-600 transition-colors"
            aria-label={`${i18n.t("Shop Now")} - ${item.title}`}
          >
            {i18n.t("Shop Now")}
          </Link>
        </figcaption>
      </figure>
    </article>
  );
};

export default ItemBanner;
