import { useNavigate, useLocation } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import type { Product } from "../../../shared/models/product-model";
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
    product: Product;
}

const ProductDetail = ({ product }: ProductDetailProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const dispatch = useAppDispatch();
    const { checkStatus } = useAppSelector((state) => state.wishlist);

    const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
    const [imageIdx, setImageIdx] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);

    useEffect(() => {
        if (product.variants.length > 0) {
            setSelectedVariant(product.variants[0]);
        }
    }, [product]);

    useEffect(() => {
        if (isAuthenticated && product?._id) {
            dispatch(checkWishlistThunk(product._id));
        }
    }, [isAuthenticated, product, dispatch]);

    useEffect(() => {
        if (isAuthenticated && product?._id && checkStatus[product._id] !== undefined) {
            setAdded(checkStatus[product._id]);
        }
    }, [checkStatus, product, isAuthenticated]);

    const uniqueVersions = useMemo(() => {
        const versions = new Set(product.variants.map((v) => v.version));
        return Array.from(versions);
    }, [product.variants]);

    const uniqueColors = useMemo(() => {
        const colors = new Set(
            product.variants.map((v) => JSON.stringify({ name: v.colorName, hex: v.hexcode })),
        );
        return Array.from(colors).map((c) => JSON.parse(c));
    }, [product.variants]);

    const handleVersionSelect = (version: string) => {
        const newVariant = product.variants.find(
            (v) => v.version === version && v.colorName === selectedVariant.colorName,
        );
        if (newVariant) {
            setSelectedVariant(newVariant);
        } else {
            const fallbackVariant = product.variants.find((v) => v.version === version);
            if (fallbackVariant) setSelectedVariant(fallbackVariant);
        }
    };

    const handleColorSelect = (colorName: string) => {
        const newVariant = product.variants.find(
            (v) => v.colorName === colorName && v.version === selectedVariant.version,
        );
        if (newVariant) {
            setSelectedVariant(newVariant);
        } else {
            // Fallback
            const fallbackVariant = product.variants.find((v) => v.colorName === colorName);
            if (fallbackVariant) setSelectedVariant(fallbackVariant);
        }
    };

    const handleBuy = () => {
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

    const allImages = useMemo(() => {
        return product.variants.flatMap((variant) => variant.images[0]);
    }, [product.variants]);

    useEffect(() => {
        if (selectedVariant) {
            const index = product.variants.findIndex((v) => v === selectedVariant);
            if (index !== -1) {
                setImageIdx(index);
            }
        }
    }, [selectedVariant, product.variants]);

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
                    {allImages.map((url, idx) => (
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
                    <img
                        src={allImages[imageIdx]}
                        alt={product.title}
                        className="w-full h-full object-cover"
                    />
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
                        {allImages.map((url, idx) => (
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
                <h1 className="text-xl sm:text-2xl text-black font-semibold">{product.title}</h1>
                <div className="flex flex-row gap-2 flex-wrap items-center">
                    {product.rating && <StarRating rating={product.rating} />}
                    {product.rating && <div className="w-px h-4 bg-black" aria-hidden="true" />}
                    <span
                        className={`text-sm font-normal ${
                            selectedVariant.quantity > 0 ? "text-button1" : "text-button2"
                        }`}
                        aria-live="polite"
                    >
                        {selectedVariant.quantity > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                </div>
                <div
                    className="flex flex-row gap-2 flex-wrap items-baseline"
                    role="group"
                    aria-label="Product pricing"
                >
                    <span
                        className={`text-xl sm:text-2xl font-normal ${
                            selectedVariant.salePrice ? "text-button2" : "text-black"
                        } ${selectedVariant.salePrice ? "line-through" : ""}`}
                    >
                        {formatPrice(selectedVariant.price)}
                    </span>
                    {selectedVariant.salePrice && (
                        <span className="text-xl sm:text-2xl text-black font-font-normal">
                            {formatPrice(selectedVariant.salePrice)}
                        </span>
                    )}
                </div>
                <p className="text-sm font-normal text-black">{product.description}</p>
                <p className="text-sm font-normal text-black">{product.descriptionDetail}</p>
                <SectionLineSeparator />

                <div className="flex flex-col gap-2">
                    {uniqueVersions.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <span className="font-medium text-black">Version:</span>
                            <div className="flex flex-wrap gap-2">
                                {uniqueVersions.map((version) => (
                                    <button
                                        key={version}
                                        onClick={() => handleVersionSelect(version)}
                                        className={`px-4 py-2 border rounded-sm transition-colors ${
                                            selectedVariant.version === version
                                                ? "border-button2 bg-button2 text-white"
                                                : "border-gray-300 hover:border-button2 text-black"
                                        }`}
                                    >
                                        {version}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {uniqueColors.length > 0 && (
                        <div className="flex flex-col gap-2 mt-4">
                            <span className="font-medium text-black">Color:</span>
                            <div className="flex flex-wrap gap-2">
                                {uniqueColors.map((color) => (
                                    <button
                                        key={color.name}
                                        onClick={() => handleColorSelect(color.name)}
                                        className={`px-4 py-2 border rounded-sm flex items-center gap-2 transition-colors ${
                                            selectedVariant.colorName === color.name
                                                ? "border-button2 ring-1 ring-button2"
                                                : "border-gray-300 hover:border-button2"
                                        }`}
                                        aria-label={`Select color ${color.name}`}
                                    >
                                        <span
                                            className={`text-sm ${
                                                selectedVariant.colorName === color.name
                                                    ? "text-button2 font-medium"
                                                    : "text-black"
                                            }`}
                                        >
                                            {color.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-6">
                    <QuantitySelector
                        maxQuantity={selectedVariant.quantity}
                        quantity={quantity}
                        setQuantity={setQuantity}
                    />
                    <div className="flex flex-row gap-3 md:gap-4 flex-1 sm:flex-none">
                        <CommonButton
                            label="Buy Now"
                            onClick={handleBuy}
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
