import { Swiper, SwiperSlide } from "swiper/react";
import { Link } from "react-router-dom";
import { Pagination, Autoplay } from "swiper/modules";
import type { Product } from "../../../shared/models/product-model";
import { useI18n } from "../../../contexts/I18nContext";

interface BannerSwiperProps {
  products: Product[];
}

const BannerSwiper = ({ products }: BannerSwiperProps) => {
  const i18n = useI18n();

  return (
    <section
      className="flex-1 min-w-0 w-full lg:w-auto"
      style={{ aspectRatio: "892/344" }}
      aria-label="Featured products carousel"
    >
      <style>{`
                .banner-swiper .swiper-pagination-bullet {
                    background: #9ca3af;
                    opacity: 0.5;
                }
                .banner-swiper .swiper-pagination-bullet-active {
                    background: #ef4444;
                    opacity: 1;
                }
            `}</style>
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{
          clickable: true,
        }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        loop={true}
        className="banner-swiper w-full h-full rounded-lg bg-white shadow-md hover:shadow-xl transition-all duration-300"
      >
        {products.slice(0, 10).map((product) => (
          <SwiperSlide key={product._id}>
            <article
              className="w-full h-full bg-white flex justify-center items-center overflow-hidden relative"
              aria-label={product.title}
            >
              <figure className="w-full h-full m-0 relative">
                <img
                  src={product.variants?.[0]?.images?.[0]}
                  alt={product.title}
                  className="w-full h-full object-contain"
                />
                <figcaption className="flex flex-col gap-2 md:gap-4 items-start absolute bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-[30px] md:left-[30px]">
                  <span className="text-black text-base sm:text-lg md:text-xl lg:text-2xl font-semibold">
                    {product.title}
                  </span>
                  <p className="text-gray-600 text-xs sm:text-sm font-normal line-clamp-2 md:line-clamp-3">
                    {product.description}
                  </p>
                  <Link
                    to={`/products/${product._id}`}
                    className="text-black text-sm md:text-base font-medium underline cursor-pointer hover:text-gray-600 transition-colors"
                    aria-label={`${i18n.t("Shop Now")} - ${product.title}`}
                  >
                    {i18n.t("Shop Now")}
                  </Link>
                </figcaption>
              </figure>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default BannerSwiper;
