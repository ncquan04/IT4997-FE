import type { Product } from "../../../shared/models/product-model";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper.css";
import ItemCard from "../../../components/common/itemCard/ItemCard";
import CommonButton from "../../../components/common/CommonButton";

interface WishlistProps {
  products: Product[];
}

const Wishlist = ({ products }: WishlistProps) => {
  const handleMoveToBag = () => {};

  return (
    <section
      className="w-full flex flex-col gap-6 md:gap-8 lg:gap-12"
      aria-labelledby="wishlist-section-heading"
    >
      <h2 id="wishlist-section-heading" className="sr-only">
        Wishlist Items
      </h2>
      {/* <div className="flex justify-end w-full">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-[223px] h-14 flex justify-center items-center">
          <CommonButton
            transparentBg
            label="Move All To Bag"
            onClick={handleMoveToBag}
          />
        </div>
      </div> */}
      <div className="w-full">
        <Swiper
          spaceBetween={12}
          slidesPerView={"auto"}
          style={{ width: "100%" }}
          breakpoints={{
            640: { spaceBetween: 16 },
            768: { spaceBetween: 20 },
            1024: { spaceBetween: 24 },
          }}
        >
          {products.slice(0, 8).map((item, index) => (
            <SwiperSlide
              key={index}
              className="!w-[160px] sm:!w-[200px] md:!w-[240px] lg:!w-[270px]"
            >
              <ItemCard item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Wishlist;
