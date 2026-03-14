import SectionTag from "../../../components/common/sectionTag/SectionTag";
import type { Product } from "../../../shared/models/product-model";
import CommonButton from "../../../components/common/CommonButton";
import ItemSwiper from "../../../components/common/itemSwiper/ItemSwiper";
import { useNavigate } from "react-router-dom";

interface ThisMonthSectionProps {
  bestSellingProducts: Product[];
}

const ThisMonthSection = (props: ThisMonthSectionProps) => {
  const navigate = useNavigate();

  return (
    <section
      className="flex flex-col gap-4 md:gap-6 lg:gap-8"
      aria-labelledby="thismonth-section-title"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <SectionTag title="This Month" />
        <CommonButton
          label="View All Products"
          onClick={() => {
            navigate("/search?all=true");
          }}
          style={{ alignSelf: "center" }}
          className="w-full sm:w-40 md:w-44 h-12 md:h-14"
        />
      </div>
      <ItemSwiper items={props.bestSellingProducts} />
    </section>
  );
};

export default ThisMonthSection;
