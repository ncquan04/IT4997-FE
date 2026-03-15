import { useNavigate, useLocation } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import type {
  IProduct,
  IProductVariant,
} from "../../../shared/models/product-model";
import StarRating from "../../../components/common/starRating/StarRating";
import SectionLineSeparator from "../../home/components/SectionLineSeparator";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Scrollbar } from "swiper/modules";
import "swiper/css";
import QuantitySelector from "../../../components/common/quantitySelector/QuantitySelector";
import CommonButton from "../../../components/common/CommonButton";
import HeartIcon from "../../../icons/HeartIcon";
import ProductOfferInfo from "./ProductOfferInfo";
import { formatPrice } from "../../../utils";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import {
  addToWishlistThunk,
  checkWishlistThunk,
  removeFromWishlistThunk,
} from "../../../redux/async-thunk/wishlist.thunk";
import { AppRoutes } from "../../../navigation";

interface ProductDetailProps {
  product: IProduct;
}

const DEFAULT_MAX_QUANTITY = 10;

const getVariantStock = (variant: IProductVariant): number | null => {
  const stockAttr = variant.attributes.find((attr) => {
    const key = attr.key.toLowerCase();
    return (
      key.includes("stock") ||
      key.includes("quantity") ||
      key.includes("ton") ||
      key.includes("so luong") ||
      key.includes("so_luong")
    );
  });

  if (!stockAttr) return null;
  if (typeof stockAttr.numericValue === "number") return stockAttr.numericValue;

  const parsed = Number(stockAttr.value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
};

const ProductDetail = ({ product }: ProductDetailProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const { checkStatus } = useAppSelector((state) => state.wishlist);

  const [selectedVariant, setSelectedVariant] =
    useState<IProductVariant | null>(product.variants[0] ?? null);
  const [imageIdx, setImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
    setQuantity(1);
    setImageIdx(0);
  }, [product]);

  useEffect(() => {
    if (isAuthenticated && product?._id) {
      dispatch(checkWishlistThunk(product._id));
    }
  }, [isAuthenticated, product, dispatch]);

  useEffect(() => {
    if (
      isAuthenticated &&
      product?._id &&
      checkStatus[product._id] !== undefined
    ) {
      setAdded(checkStatus[product._id]);
    }
  }, [checkStatus, product, isAuthenticated]);

  const variantNames = useMemo(() => {
    const names = new Set(
      product.variants.map((variant) => variant.variantName),
    );
    return Array.from(names);
  }, [product.variants]);

  const handleVariantSelect = (variantName: string) => {
    const variant = product.variants.find(
      (item) => item.variantName === variantName,
    );
    if (variant) {
      setSelectedVariant(variant);
      setQuantity(1);
      setImageIdx(0);
    }
  };

  const selectedVariantStock = useMemo(() => {
    if (!selectedVariant) return null;
    return getVariantStock(selectedVariant);
  }, [selectedVariant]);

  const maxQuantity = useMemo(() => {
    if (selectedVariantStock === null) return DEFAULT_MAX_QUANTITY;
    return Math.max(1, selectedVariantStock);
  }, [selectedVariantStock]);

  useEffect(() => {
    setQuantity((prev) => Math.min(prev, maxQuantity));
  }, [maxQuantity]);

  const handleBuy = () => {
    if (!selectedVariant) return;

    navigate("/checkout", {
      state: {
        products: [
          {
            product,
            variant: selectedVariant,
            quantity: quantity,
          },
        ],
      },
    });
  };

  const handleAddToWishList = async () => {
    if (!isAuthenticated) {
      navigate(AppRoutes.LOGIN, { state: { from: location } });
      return;
    }
    try {
      await dispatch(addToWishlistThunk(product._id)).unwrap();
      setAdded(true);
      showToast("Added to wishlist", "success");
    } catch (error) {
      showToast("Failed to add to wishlist", "error");
    }
  };

  const handleRemoveFromWishList = async () => {
    if (!isAuthenticated) return;
    try {
      await dispatch(removeFromWishlistThunk(product._id)).unwrap();
      setAdded(false);
      showToast("Removed from wishlist", "success");
    } catch (error) {
      showToast("Failed to remove from wishlist", "error");
    }
  };

  const selectedImages = useMemo(() => {
    if (!selectedVariant) return [];
    return selectedVariant.images ?? [];
  }, [selectedVariant]);

  const fallbackImages = useMemo(() => {
    const images = product.variants.flatMap((variant) => variant.images ?? []);
    return Array.from(new Set(images));
  }, [product.variants]);

  const displayImages =
    selectedImages.length > 0 ? selectedImages : fallbackImages;

  useEffect(() => {
    if (imageIdx >= displayImages.length) {
      setImageIdx(0);
    }
  }, [imageIdx, displayImages.length]);

  const hasVariant = Boolean(selectedVariant);
  const isOutOfStock =
    selectedVariantStock !== null && selectedVariantStock <= 0;

  return (
    <section className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8">
      <nav
        className="hidden lg:block w-[120px] xl:w-[170px] h-[400px] xl:h-[600px]"
        aria-label="Product image thumbnails"
      >
        <Swiper
          direction="vertical"
          slidesPerView={4}
          spaceBetween={8}
          className="h-full [&_.swiper-scrollbar]:bg-gray-100! [&_.swiper-scrollbar-drag]:bg-gray-300!"
          mousewheel={true}
          scrollbar={{ draggable: true, hide: false }}
          modules={[Mousewheel, Scrollbar]}
        >
          {displayImages.map((url, idx) => (
            <SwiperSlide key={idx}>
              <button
                className={`w-[calc(100%-12px)] h-[90px] xl:h-[138px] rounded-sm overflow-hidden cursor-pointer border ${
                  imageIdx === idx ? "border-button2" : "border-transparent"
                } hover:border-button2 transition-colors`}
                onClick={() => setImageIdx(idx)}
                aria-label={`View image ${idx + 1}`}
              >
                <img
                  src={url}
                  alt={`${product.title} - Image ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </nav>

      <div className="flex flex-col gap-4 md:w-[500px] lg:w-[400px] xl:w-[500px]">
        <figure className="w-full h-[300px] sm:h-[400px] md:h-[500px] xl:h-[600px] rounded-sm overflow-hidden bg-gray-100">
          {displayImages.length > 0 ? (
            <img
              src={displayImages[imageIdx]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
              No image available
            </div>
          )}
        </figure>

        <nav className="lg:hidden w-full" aria-label="Product image thumbnails">
          <Swiper
            direction="horizontal"
            slidesPerView={4}
            spaceBetween={8}
            breakpoints={{
              640: { slidesPerView: 5 },
              768: { slidesPerView: 6 },
            }}
          >
            {displayImages.map((url, idx) => (
              <SwiperSlide key={idx}>
                <button
                  className={`w-full aspect-square rounded-sm overflow-hidden cursor-pointer border ${
                    imageIdx === idx ? "border-button2" : "border-transparent"
                  } hover:border-button2 transition-colors`}
                  onClick={() => setImageIdx(idx)}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img
                    src={url}
                    alt={`${product.title} - Image ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </nav>
      </div>

      <article className="flex flex-1 flex-col gap-3 md:gap-4 items-start justify-start">
        <h1 className="text-xl sm:text-2xl text-black font-semibold">
          {product.title}
        </h1>
        <div className="flex flex-row gap-2 flex-wrap items-center">
          {product.rating && <StarRating rating={product.rating} />}
          {product.rating && (
            <div className="w-px h-4 bg-black" aria-hidden="true" />
          )}
          <span
            className={`text-sm font-normal ${
              !hasVariant || isOutOfStock ? "text-button2" : "text-button1"
            }`}
            aria-live="polite"
          >
            {!hasVariant
              ? "Unavailable"
              : isOutOfStock
                ? "Out of Stock"
                : "In Stock"}
          </span>
        </div>
        <div
          className="flex flex-row gap-2 flex-wrap items-baseline"
          role="group"
          aria-label="Product pricing"
        >
          <span
            className={`text-xl sm:text-2xl font-normal ${
              selectedVariant?.salePrice ? "text-button2" : "text-black"
            } ${selectedVariant?.salePrice ? "line-through" : ""}`}
          >
            {formatPrice(selectedVariant?.price || 0)}
          </span>
          {selectedVariant?.salePrice && (
            <span className="text-xl sm:text-2xl text-black font-font-normal">
              {formatPrice(selectedVariant.salePrice)}
            </span>
          )}
        </div>
        <p className="text-sm font-normal text-black">{product.description}</p>
        <p className="text-sm font-normal text-black">
          {product.descriptionDetail}
        </p>
        <SectionLineSeparator />

        <div className="flex flex-col gap-2">
          {variantNames.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="font-medium text-black">Variant:</span>
              <div className="flex flex-wrap gap-2">
                {variantNames.map((variantName) => (
                  <button
                    key={variantName}
                    onClick={() => handleVariantSelect(variantName)}
                    className={`px-4 py-2 border rounded-sm transition-colors ${
                      selectedVariant?.variantName === variantName
                        ? "border-button2 bg-button2 text-white"
                        : "border-gray-300 hover:border-button2 text-black"
                    }`}
                  >
                    {variantName}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-6">
          <QuantitySelector
            maxQuantity={maxQuantity}
            quantity={quantity}
            setQuantity={setQuantity}
          />
          <div className="flex flex-row gap-3 md:gap-4 flex-1 sm:flex-none">
            <CommonButton
              label="Buy Now"
              onClick={handleBuy}
              disable={!hasVariant || isOutOfStock}
              style={{
                width: "100%",
                minWidth: 140,
                maxWidth: 165,
                height: 46,
              }}
              className="flex-1 sm:flex-none"
            />
            <button
              className="w-[44px] h-[44px] border border-[#00000033] rounded-sm flex justify-center items-center hover:cursor-pointer shrink-0"
              onClick={added ? handleRemoveFromWishList : handleAddToWishList}
              aria-label={added ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={added}
            >
              <HeartIcon fill={added ? "#db4444bb" : "transparent"} />
            </button>
          </div>
        </div>
        <ProductOfferInfo />
      </article>
    </section>
  );
};

export default ProductDetail;
