import type { Product } from "../../../shared/models/product-model";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper.css";
import ItemCard from "../itemCard/ItemCard";

interface ItemSwiperProps {
  items: Product[];
}

const ItemSwiper = ({ items }: ItemSwiperProps) => {
  return (
    <Swiper
      spaceBetween={15}
      slidesPerView={"auto"}
      style={{ width: "100%", padding: "4px" }}
      breakpoints={{
        640: { spaceBetween: 20 },
        768: { spaceBetween: 25 },
        1024: { spaceBetween: 30 },
      }}
    >
      {items.slice(0, 8).map((item, index) => (
        <SwiperSlide
          key={index}
          className="!w-[200px] sm:!w-[220px] md:!w-[250px] lg:!w-[270px]"
        >
          <ItemCard item={item} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default ItemSwiper;
