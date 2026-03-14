import SectionTag from "../../../components/common/sectionTag/SectionTag";
import { Swiper, SwiperSlide, type SwiperRef } from "swiper/react";
import "swiper/swiper.css";
import CategoryCard from "../components/CategoryCard";
import type { Category } from "../../../shared/models/category-model";
import LeftRightNavigator from "../components/LeftRightNavigator";
import { useRef } from "react";

interface CategoriesSectionProps {
  categories: Category[];
}

const CategoriesSection = (props: CategoriesSectionProps) => {
  const swiperRef = useRef<SwiperRef>(null);

  return (
    <section
      className="flex flex-col gap-4 md:gap-6 lg:gap-8"
      aria-labelledby="categories-section-title"
    >
      <div className="flex flex-row justify-between items-center">
        <SectionTag title="Categories" />
        <LeftRightNavigator
          onLeftClick={() => {
            swiperRef.current?.swiper.slidePrev();
          }}
          onRightClick={() => {
            swiperRef.current?.swiper.slideNext();
          }}
        />
      </div>
      <Swiper
        ref={swiperRef}
        spaceBetween={15}
        slidesPerView={"auto"}
        style={{ width: "100%" }}
        breakpoints={{
          640: { spaceBetween: 20 },
          768: { spaceBetween: 25 },
          1024: { spaceBetween: 30 },
        }}
      >
        {props.categories.map((category, index) => (
          <SwiperSlide
            key={index}
            className="!w-[140px] sm:!w-[150px] md:!w-[160px] lg:!w-[170px]"
          >
            <CategoryCard category={category} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default CategoriesSection;
