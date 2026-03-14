import { useNavigate } from "react-router";
import SectionTag from "../../../components/common/sectionTag/SectionTag";
import CommonButton from "../../../components/common/CommonButton";
import type { Product } from "../../../shared/models/product-model";
import ItemSwiper from "../../../components/common/itemSwiper/ItemSwiper";

interface TodaySectionProps {
  items: Product[];
}

const TodaySection = (props: TodaySectionProps) => {
  const navigate = useNavigate();
  return (
    <section
      className="flex flex-col gap-4 md:gap-6 lg:gap-8"
      aria-labelledby="today-section-title"
    >
      <SectionTag title="Today's" />
      <ItemSwiper items={props.items} />
      <CommonButton
        label="View All Products"
        onClick={() => {
          navigate("/search?all=true");
        }}
        style={{ alignSelf: "center" }}
        className="w-full sm:w-64 md:w-56 h-12 md:h-14"
      />
    </section>
  );
};

export default TodaySection;
